export const ACTIVITY_LABEL = {
  "product.create": "Add product",
  "product.update": "Edit product",
  "product.delete": "Delete product",
  "order.status": "Update order status",
  "user.create": "Add admin",
  "user.update": "Edit admin",
  "user.delete": "Delete admin",
  "user.role": "Change role",
  "voucher.create": "Add voucher",
  "voucher.update": "Edit voucher",
  "voucher.delete": "Delete voucher",
  "user.block": "Block account",
  "user.unblock": "Unblock account",
  "settings.update": "Update store settings",
  "review.delete": "Delete review",
} as const;

export type ActivityAction = keyof typeof ACTIVITY_LABEL;

export const ACTIVITY_GROUP: Record<string, string> = {
  product: "Products",
  order: "Orders",
  user: "Users",
  voucher: "Vouchers",
  settings: "Settings",
  review: "Reviews",
};
