import ActivityLog from "@/models/ActivityLog";
import type { AdminUser } from "@/lib/admin";
import type { ActivityAction } from "@/lib/activityLabels";

/** Catat aktivitas admin. Kegagalan mencatat tidak menggagalkan aksi utamanya. */
export async function logActivity(
  admin: AdminUser,
  action: ActivityAction,
  target: string,
  detail = ""
) {
  try {
    await ActivityLog.create({
      actor: admin.id,
      actorName: admin.name,
      actorRole: admin.role,
      action,
      target,
      detail,
    });
  } catch (err) {
    console.error("Gagal mencatat aktivitas:", err);
  }
}
