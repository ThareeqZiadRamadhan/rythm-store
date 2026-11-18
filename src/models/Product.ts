import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const variantSchema = new Schema(
  {
    size: { type: Number, required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Running", "Lifestyle", "Training"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["Pria", "Wanita", "Unisex"],
    },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    color: { type: String },
    colorName: { type: String },
    tag: { type: String },
    description: { type: String },
    features: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, gender: 1 });

export type ProductDoc = InferSchemaType<typeof productSchema>;

const Product =
  (models.Product as mongoose.Model<ProductDoc>) ||
  model<ProductDoc>("Product", productSchema);

export default Product;