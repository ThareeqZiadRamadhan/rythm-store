import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { serializeAddresses } from "@/lib/address";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function currentList(userId: string) {
  const fresh = await User.findById(userId).select("addresses").lean();
  return serializeAddresses(fresh?.addresses);
}

// Jadikan alamat ini sebagai alamat utama
export async function PATCH(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID alamat tidak valid." }, { status: 400 });
  }

  try {
    await connectDB();
    await User.updateOne(
      { _id: session.sub },
      { $set: { "addresses.$[].isDefault": false } }
    );
    await User.updateOne(
      { _id: session.sub, "addresses._id": id },
      { $set: { "addresses.$.isDefault": true } }
    );
    return NextResponse.json({ addresses: await currentList(session.sub) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}

// Hapus alamat
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID alamat tidak valid." }, { status: 400 });
  }

  try {
    await connectDB();
    await User.updateOne({ _id: session.sub }, { $pull: { addresses: { _id: id } } });

    // Kalau alamat utama yang dihapus, jadikan alamat pertama yang tersisa sebagai utama.
    let list = await currentList(session.sub);
    if (list.length > 0 && !list.some((a) => a.isDefault)) {
      await User.updateOne(
        { _id: session.sub, "addresses._id": list[0].id },
        { $set: { "addresses.$.isDefault": true } }
      );
      list = await currentList(session.sub);
    }

    return NextResponse.json({ addresses: list });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
