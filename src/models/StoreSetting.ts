import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";
import { DEFAULT_SETTINGS } from "@/lib/settings-types";

// Satu dokumen saja dengan key "store"
const storeSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "store" },
    announcementEnabled: { type: Boolean, default: DEFAULT_SETTINGS.announcementEnabled },
    announcementText: { type: String, default: DEFAULT_SETTINGS.announcementText, maxlength: 120 },
    shippingFee: { type: Number, default: DEFAULT_SETTINGS.shippingFee, min: 0 },
    freeShippingMin: { type: Number, default: DEFAULT_SETTINGS.freeShippingMin, min: 0 },
  },
  { timestamps: true }
);

export type StoreSettingDoc = InferSchemaType<typeof storeSettingSchema>;

const StoreSetting =
  (models.StoreSetting as mongoose.Model<StoreSettingDoc>) ||
  model<StoreSettingDoc>("StoreSetting", storeSettingSchema);

export default StoreSetting;
