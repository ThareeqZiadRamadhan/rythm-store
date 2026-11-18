import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { serializeAddresses } from "@/lib/address";
import { getVoucherLists } from "@/lib/vouchers";
import { getProducts } from "@/lib/catalog";
import User from "@/models/User";
import CheckoutView from "@/components/CheckoutView";

export const metadata = { title: "Checkout — RYTHM" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.sub).select("addresses").lean();
  if (!user) redirect("/login");

  const [{ claimed }, products] = await Promise.all([
    getVoucherLists(session.sub),
    getProducts(),
  ]);

  // Harga dan stok terbaru, dipakai untuk mengecek isi keranjang
  const catalog = Object.fromEntries(
    products.map((p) => [p.slug, { price: p.price, stock: p.stock }])
  );

  return (
    <CheckoutView
      addresses={serializeAddresses(user.addresses)}
      vouchers={claimed.filter((v) => v.status === "ACTIVE")}
      catalog={catalog}
    />
  );
}
