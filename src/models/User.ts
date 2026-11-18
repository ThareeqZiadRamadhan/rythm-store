import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

export const ROLES = ["USER", "ADMIN", "SUPERADMIN"] as const;

const addressSchema = new Schema(
  {
    label: { type: String, default: "Rumah" },
    recipient: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userVoucherSchema = new Schema(
  {
    voucher: { type: Schema.Types.ObjectId, ref: "Voucher", required: true },
    claimedAt: { type: Date, default: Date.now },
    usedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    // Hash bcrypt, tidak pernah dikirim ke client dan tidak ikut query default.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "USER" },
    isBlocked: { type: Boolean, default: false },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    vouchers: { type: [userVoucherSchema], default: [] },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;

const User =
  (models.User as mongoose.Model<UserDoc>) ||
  model<UserDoc>("User", userSchema);

export default User;
