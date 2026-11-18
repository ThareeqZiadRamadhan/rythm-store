import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof reviewSchema>;

const Review =
  (models.Review as mongoose.Model<ReviewDoc>) || model<ReviewDoc>("Review", reviewSchema);

export default Review;
