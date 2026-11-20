import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = { title: "Store settings — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin({ superadmin: true });
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Store settings</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">
        Changes apply across the store immediately and are recorded in the Activity log.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
