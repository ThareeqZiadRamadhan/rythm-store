import ShopPage from "@/views/ShopPage";
import { getProducts } from "@/lib/catalog";

export const metadata = { title: "Sale — RYTHM" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await getProducts();
  return <ShopPage mode="sale" products={products} />;
}
