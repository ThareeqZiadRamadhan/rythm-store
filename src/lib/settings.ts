import { connectDB } from "@/lib/mongodb";
import StoreSetting from "@/models/StoreSetting";
import { DEFAULT_SETTINGS, type PublicSettings } from "@/lib/settings-types";

/** Pengaturan toko dari database. Kalau belum pernah disimpan, pakai nilai bawaan. */
export async function getSettings(): Promise<PublicSettings> {
  try {
    await connectDB();
    const d = await StoreSetting.findOne({ key: "store" }).lean();
    if (!d) return DEFAULT_SETTINGS;
    return {
      announcementEnabled: d.announcementEnabled ?? DEFAULT_SETTINGS.announcementEnabled,
      announcementText: d.announcementText ?? DEFAULT_SETTINGS.announcementText,
      shippingFee: d.shippingFee ?? DEFAULT_SETTINGS.shippingFee,
      freeShippingMin: d.freeShippingMin ?? DEFAULT_SETTINGS.freeShippingMin,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
