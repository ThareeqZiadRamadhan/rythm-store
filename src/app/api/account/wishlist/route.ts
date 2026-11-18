import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function slugsOf(userId: string) {
  const user = await User.findById(userId).select("wishlist").lean();
  const ids = user?.wishlist ?? [];
  if (ids.length === 0) return [];
  const products = await Product.find({ _id: { $in: ids } }).select("slug").lean();
  return products.map((p) => p.slug);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ slugs: [], loggedIn: false });

  await connectDB();
  return NextResponse.json({ slugs: await slugsOf(session.sub), loggedIn: true });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug ?? "").trim();
    if (!slug) {
      return NextResponse.json({ error: "Produk tidak valid." }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findOne({ slug }).select("_id");
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

    const has = await User.exists({ _id: session.sub, wishlist: product._id });
    await User.updateOne(
      { _id: session.sub },
      has ? { $pull: { wishlist: product._id } } : { $addToSet: { wishlist: product._id } }
    );

    return NextResponse.json({ saved: !has, slugs: await slugsOf(session.sub) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
