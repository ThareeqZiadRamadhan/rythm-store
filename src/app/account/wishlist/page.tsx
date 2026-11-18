import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import WishlistGrid, { type WishlistItem } from "@/components/WishlistGrid";

export const metadata = { title: "Wishlist — RYTHM" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.sub).select("wishlist").lean();
  const products = await Product.find({ _id: { $in: user?.wishlist ?? [] } }).lean();

  const items: WishlistItem[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    image: p.image,
    color: p.color ?? "#eeeeea",
  }));

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Wishlist</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">
        {items.length > 0 ? `${items.length} sepatu yang kamu incar.` : "Sepatu yang kamu incar."}
      </p>
      <WishlistGrid initial={items} />
    </div>
  );
}
