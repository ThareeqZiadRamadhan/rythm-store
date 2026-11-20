export const CATEGORIES = ["Running", "Lifestyle", "Training"] as const;
export const GENDERS = ["Pria", "Wanita", "Unisex"] as const;
/** Gender values stay in Indonesian in the database; this is what the UI shows. */
export const GENDER_LABEL: Record<string, string> = { Pria: "Men", Wanita: "Women", Unisex: "Unisex" };
export const SIZES = [38, 39, 40, 41, 42, 43, 44, 45];

export type Category = (typeof CATEGORIES)[number];
export type Gender = (typeof GENDERS)[number];

export type ProductInput = {
  slug: string;
  name: string;
  category: Category;
  gender: Gender;
  price: number;
  oldPrice: number | null;
  image: string;
  gallery: string[];
  color: string;
  colorName: string;
  tag: string;
  description: string;
  features: string[];
  variants: { size: number; stock: number }[];
  isActive: boolean;
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const str = (v: unknown) => String(v ?? "").trim();
const lines = (v: unknown) =>
  (Array.isArray(v) ? v : String(v ?? "").split("\n"))
    .map((x) => String(x).trim())
    .filter(Boolean);

/** Validasi data produk dari form admin. */
export function parseProductInput(raw: unknown): { data: ProductInput } | { error: string } {
  const b = (raw ?? {}) as Record<string, unknown>;

  const name = str(b.name);
  if (name.length < 2) return { error: "Product name must be at least 2 characters." };

  const slug = slugify(str(b.slug) || name);
  if (!slug) return { error: "Invalid slug." };

  const category = str(b.category);
  if (!(CATEGORIES as readonly string[]).includes(category)) return { error: "Please choose a category." };

  const gender = str(b.gender);
  if (!(GENDERS as readonly string[]).includes(gender)) return { error: "Please choose a gender." };

  const price = Math.round(Number(b.price));
  if (!(price > 0)) return { error: "Price must be greater than 0." };

  const oldRaw = str(b.oldPrice);
  const oldPrice = oldRaw === "" ? null : Math.round(Number(oldRaw));
  if (oldPrice !== null && !(oldPrice > price)) {
    return { error: "The original price must be higher than the selling price." };
  }

  const image = str(b.image);
  if (!image) return { error: "The main image URL is required." };

  const gallery = lines(b.gallery);
  const variantsRaw = (Array.isArray(b.variants) ? b.variants : []) as {
    size?: unknown;
    stock?: unknown;
  }[];
  const variants = SIZES.map((size) => {
    const found = variantsRaw.find((v) => Number(v?.size) === size);
    const stock = Math.max(0, Math.floor(Number(found?.stock ?? 0)) || 0);
    return { size, stock };
  });

  return {
    data: {
      slug,
      name,
      category: category as Category,
      gender: gender as Gender,
      price,
      oldPrice,
      image,
      gallery: gallery.length ? gallery : [image],
      color: str(b.color) || "#eeeeea",
      colorName: str(b.colorName),
      tag: str(b.tag),
      description: str(b.description),
      features: lines(b.features),
      variants,
      isActive: b.isActive !== false,
    },
  };
}
