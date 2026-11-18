import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { normalizePhone } from "@/lib/phone";
import { serializeAddresses } from "@/lib/address";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const MAX_ADDRESSES = 5;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const label = String(body.label ?? "").trim() || "Rumah";
    const recipient = String(body.recipient ?? "").trim();
    const phone = normalizePhone(String(body.phone ?? "").trim());
    const street = String(body.street ?? "").trim();
    const city = String(body.city ?? "").trim();
    const province = String(body.province ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();

    if (recipient.length < 2) {
      return NextResponse.json({ error: "Nama penerima minimal 2 karakter." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Nomor HP belum benar." }, { status: 400 });
    }
    if (street.length < 5) {
      return NextResponse.json({ error: "Alamat lengkap minimal 5 karakter." }, { status: 400 });
    }
    if (!city || !province) {
      return NextResponse.json({ error: "Kota dan provinsi wajib diisi." }, { status: 400 });
    }
    if (!/^\d{5}$/.test(postalCode)) {
      return NextResponse.json({ error: "Kode pos harus 5 angka." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.sub).select("addresses");
    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }
    if (user.addresses.length >= MAX_ADDRESSES) {
      return NextResponse.json(
        { error: `Maksimal ${MAX_ADDRESSES} alamat.` },
        { status: 400 }
      );
    }

    // Alamat pertama otomatis jadi utama.
    const makeDefault = user.addresses.length === 0 || Boolean(body.isDefault);
    if (makeDefault) {
      await User.updateOne(
        { _id: session.sub },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    await User.updateOne(
      { _id: session.sub },
      {
        $push: {
          addresses: {
            label,
            recipient,
            phone,
            street,
            city,
            province,
            postalCode,
            isDefault: makeDefault,
          },
        },
      }
    );

    const fresh = await User.findById(session.sub).select("addresses").lean();
    return NextResponse.json(
      { addresses: serializeAddresses(fresh?.addresses) },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
