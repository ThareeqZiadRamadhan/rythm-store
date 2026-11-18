import HomePage from "@/views/HomePage";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await getProducts();
  return <HomePage products={products} />;
}
