import ShopPage from "@/views/ShopPage";
import { getProducts } from "@/lib/catalog";
import { SIZE_CHART } from "@/lib/sizes";

export const metadata = { title: "Koleksi — RYTHM" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ size?: string }>;
}) {
  const { size } = await searchParams;
  const eu = Number(size);
  const validSize = SIZE_CHART.some((r) => r.eu === eu) ? eu : undefined;

  const products = await getProducts();
  return <ShopPage products={products} size={validSize} />;
}
