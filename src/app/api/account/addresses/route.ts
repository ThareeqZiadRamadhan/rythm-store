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
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
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
      return NextResponse.json({ error: "Recipient name must be at least 2 characters." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (street.length < 5) {
      return NextResponse.json({ error: "Full address must be at least 5 characters." }, { status: 400 });
    }
    if (!city || !province) {
      return NextResponse.json({ error: "City and province are required." }, { status: 400 });
    }
    if (!/^\d{5}$/.test(postalCode)) {
      return NextResponse.json({ error: "Postal code must be 5 digits." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.sub).select("addresses");
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (user.addresses.length >= MAX_ADDRESSES) {
      return NextResponse.json(
        { error: `You can save up to ${MAX_ADDRESSES} addresses.` },
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
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}
