import { notFound } from "next/navigation";
import mongoose from "mongoose";
import ProductPage from "@/views/ProductPage";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — RYTHM` : "Product not found — RYTHM" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [all, stats] = await Promise.all([
    getProducts(),
    Review.aggregate<{ avg: number; n: number }>([
      { $match: { product: new mongoose.Types.ObjectId(product.id) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
    ]),
  ]);

  const others = all.filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, 4);

  return (
    <ProductPage
      product={product}
      related={related}
      rating={{ average: stats[0]?.avg ?? 0, count: stats[0]?.n ?? 0 }}
    />
  );
}
