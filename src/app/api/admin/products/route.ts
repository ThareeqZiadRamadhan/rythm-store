import { NextResponse } from "next/server";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { formatPrice } from "@/lib/data";
import { parseProductInput } from "@/lib/productInput";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await adminApi();
  if (g.error) return g.error;

  try {
    const parsed = parseProductInput(await req.json().catch(() => ({})));
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    if (await Product.exists({ slug: parsed.data.slug })) {
      return NextResponse.json({ error: "Slug sudah dipakai produk lain." }, { status: 409 });
    }

    const product = await Product.create(parsed.data);
    const totalStock = parsed.data.variants.reduce((s, v) => s + v.stock, 0);
    await logActivity(
      g.admin,
      "product.create",
      product.name,
      `harga ${formatPrice(parsed.data.price)}, stok ${totalStock} pasang`
    );

    return NextResponse.json({ id: String(product._id) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
