import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ results: [] });

  const products = await searchProducts(q, 6);
  return NextResponse.json({
    results: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      color: p.color,
    })),
  });
}
