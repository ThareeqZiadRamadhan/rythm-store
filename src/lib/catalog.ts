import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import type { Product } from "@/lib/catalog-types";

type Raw = {
  _id: unknown;
  slug: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  gallery?: string[] | null;
  color?: string | null;
  colorName?: string | null;
  tag?: string | null;
  description?: string | null;
  features?: string[] | null;
  variants?: { size: number; stock?: number | null }[] | null;
};

function toProduct(p: Raw): Product {
  const stock: Record<number, number> = {};
  for (const v of p.variants ?? []) stock[v.size] = v.stock ?? 0;
  const gallery = (p.gallery ?? []).filter(Boolean);

  return {
    id: String(p._id),
    slug: p.slug,
    name: p.name,
    category: p.category,
    gender: p.gender,
    price: p.price,
    ...(p.oldPrice ? { oldPrice: p.oldPrice } : {}),
    image: p.image,
    gallery: gallery.length ? gallery : [p.image],
    color: p.color || "#eeeeea",
    colorName: p.colorName ?? "",
    ...(p.tag ? { tag: p.tag } : {}),
    description: p.description ?? "",
    features: p.features ?? [],
    stock,
    totalStock: Object.values(stock).reduce((s, n) => s + n, 0),
  };
}

/** Semua produk yang ditampilkan di toko (isActive = true). */
export async function getProducts(): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({ isActive: true }).sort({ createdAt: 1, _id: 1 }).lean();
  return docs.map((d) => toProduct(d as unknown as Raw));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectDB();
  const doc = await ProductModel.findOne({ slug, isActive: true }).lean();
  return doc ? toProduct(doc as unknown as Raw) : null;
}
