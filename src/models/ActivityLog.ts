import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const activityLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, default: "" },
    detail: { type: String, default: "" },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

export type ActivityLogDoc = InferSchemaType<typeof activityLogSchema>;

const ActivityLog =
  (models.ActivityLog as mongoose.Model<ActivityLogDoc>) ||
  model<ActivityLogDoc>("ActivityLog", activityLogSchema);

export default ActivityLog;
