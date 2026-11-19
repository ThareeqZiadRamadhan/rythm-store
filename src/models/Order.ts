import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const PAYMENT_METHODS = ["TRANSFER", "EWALLET", "COD"] as const;

// Snapshot produk saat dibeli, supaya riwayat tidak berubah kalau produk diedit.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    color: { type: String },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    label: String,
    recipient: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    voucherCode: { type: String },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "PENDING" },
    // Siapa yang membatalkan: pelanggan sendiri (hanya saat PENDING) atau admin.
    cancelledBy: { type: String, enum: ["USER", "ADMIN"] },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;

const Order =
  (models.Order as mongoose.Model<OrderDoc>) || model<OrderDoc>("Order", orderSchema);

export default Order;
