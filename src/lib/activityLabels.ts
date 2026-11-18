export const ACTIVITY_LABEL = {
  "product.create": "Tambah produk",
  "product.update": "Edit produk",
  "product.delete": "Hapus produk",
  "order.status": "Ubah status pesanan",
  "user.role": "Ubah role",
  "voucher.create": "Tambah voucher",
  "voucher.update": "Edit voucher",
  "voucher.delete": "Hapus voucher",
} as const;

export type ActivityAction = keyof typeof ACTIVITY_LABEL;

export const ACTIVITY_GROUP: Record<string, string> = {
  product: "Produk",
  order: "Pesanan",
  user: "Pengguna",
  voucher: "Voucher",
};
