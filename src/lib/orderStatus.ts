export const STATUS_LABEL = {
  PENDING: "Menunggu konfirmasi",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
} as const;

export type OrderStatus = keyof typeof STATUS_LABEL;

export const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-sky-100 text-sky-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-black/10 text-black/50",
};

/** Status berikutnya yang boleh dipilih admin. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: "Menunggu",
  PROCESSING: "Proses pesanan",
  SHIPPED: "Tandai dikirim",
  DELIVERED: "Tandai selesai",
  CANCELLED: "Batalkan",
};

export const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "Transfer bank",
  EWALLET: "E-wallet",
  COD: "Bayar di tempat",
};
