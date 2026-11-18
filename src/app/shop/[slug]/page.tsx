import { notFound } from "next/navigation";
import ProductPage from "@/views/ProductPage";
import { getProductBySlug, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — RYTHM` : "Produk tidak ditemukan — RYTHM" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const others = (await getProducts()).filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, 4);

  return <ProductPage product={product} related={related} />;
}
