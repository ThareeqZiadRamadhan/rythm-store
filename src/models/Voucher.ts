import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const voucherSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    // PERCENT: 10 = 10%. FIXED: nominal rupiah.
    value: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0, min: 0 },
    // Batas potongan untuk tipe PERCENT. 0 = tanpa batas.
    maxDiscount: { type: Number, default: 0, min: 0 },
    // Jumlah maksimal yang boleh mengklaim. 0 = tanpa batas.
    quota: { type: Number, default: 0, min: 0 },
    claimedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type VoucherDoc = InferSchemaType<typeof voucherSchema>;

const Voucher =
  (models.Voucher as mongoose.Model<VoucherDoc>) ||
  model<VoucherDoc>("Voucher", voucherSchema);

export default Voucher;
