/** Bentuk produk yang dikirim dari server ke halaman toko. */
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery: string[];
  color: string;
  colorName: string;
  tag?: string;
  description: string;
  features: string[];
  /** Stok per ukuran, misal { 38: 10, 39: 0, ... } */
  stock: Record<number, number>;
  totalStock: number;
};

/** Data produk yang disimpan di keranjang. */
export type CartProduct = Pick<Product, "slug" | "name" | "image" | "color" | "price">;
