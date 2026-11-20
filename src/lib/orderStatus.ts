export const STATUS_LABEL = {
  PENDING: "Awaiting confirmation",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
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
  PENDING: "Pending",
  PROCESSING: "Process order",
  SHIPPED: "Mark as shipped",
  DELIVERED: "Mark as delivered",
  CANCELLED: "Cancel",
};

export const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "Bank transfer",
  EWALLET: "E-wallet",
  COD: "Cash on delivery",
};
