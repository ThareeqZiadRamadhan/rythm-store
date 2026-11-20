import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { SIZES, type Category, type Gender, type ProductInput } from "@/lib/productInput";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const p = await Product.findById(id).lean();
  if (!p) notFound();

  const initial: ProductInput = {
    slug: p.slug,
    name: p.name,
    category: p.category as Category,
    gender: p.gender as Gender,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    image: p.image,
    gallery: p.gallery ?? [],
    color: p.color ?? "#eeeeea",
    colorName: p.colorName ?? "",
    tag: p.tag ?? "",
    description: p.description ?? "",
    features: p.features ?? [],
    variants: SIZES.map((size) => ({
      size,
      stock: p.variants?.find((v) => v.size === size)?.stock ?? 0,
    })),
    isActive: p.isActive ?? true,
  };

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Edit product</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">{p.name}</p>
      <ProductForm id={id} initial={initial} />
    </div>
  );
}
