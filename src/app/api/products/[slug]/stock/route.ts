import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

/** Stok per ukuran untuk satu produk. Produk tersembunyi dianggap stok 0. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const p = await Product.findOne({ slug }).select("variants isActive").lean();
  if (!p || !p.isActive) {
    return NextResponse.json({ isActive: false, stock: {} });
  }

  const stock: Record<number, number> = {};
  for (const v of p.variants ?? []) stock[v.size] = v.stock ?? 0;

  return NextResponse.json({ isActive: true, stock });
}
