import Link from "next/link";
import { History } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ACTIVITY_GROUP, ACTIVITY_LABEL, type ActivityAction } from "@/lib/activityLabels";
import ActivityLog from "@/models/ActivityLog";

export const metadata = { title: "Log aktivitas — Admin RYTHM" };
export const dynamic = "force-dynamic";

const TZ = "Asia/Jakarta";

const GROUP_CLASS: Record<string, string> = {
  product: "bg-sky-100 text-sky-800",
  order: "bg-amber-100 text-amber-800",
  user: "bg-purple-100 text-purple-800",
  voucher: "bg-green-100 text-green-800",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  await requireAdmin({ superadmin: true });
  const { group } = await searchParams;
  const active = group && group in ACTIVITY_GROUP ? group : null;

  const logs = await ActivityLog.find(active ? { action: { $regex: `^${active}\\.` } } : {})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const byDay = new Map<string, typeof logs>();
  for (const l of logs) {
    const key = new Date(l.createdAt).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TZ,
    });
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(l);
  }

  const tabs: { key: string | null; label: string }[] = [
    { key: null, label: "Semua" },
    ...Object.entries(ACTIVITY_GROUP).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Log aktivitas</h1>
      <p className="mt-2 text-sm text-black/50">
        Catatan semua perubahan yang dilakukan admin dan superadmin. 200 aktivitas terakhir.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/activity?group=${t.key}` : "/admin/activity"}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === t.key ? "bg-[#11120f] text-white" : "bg-[#f7f7f2] hover:bg-black/10"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-black/15 px-6 py-12 text-center">
          <History size={24} strokeWidth={1.6} />
          <p className="mt-3 font-bold">Belum ada aktivitas</p>
          <p className="mt-1 text-sm text-black/50">
            Perubahan produk, pesanan, dan role akan tercatat di sini.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {[...byDay.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-black/40">{day}</h2>
              <ul className="space-y-2">
                {items.map((l) => {
                  const groupKey = l.action.split(".")[0];
                  return (
                    <li key={String(l._id)} className="flex gap-4 rounded-2xl bg-[#f7f7f2] p-4">
                      <span className="w-12 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-black/45">
                        {new Date(l.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: TZ,
                        })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-bold">{l.actorName}</span>
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold text-black/55">
                            {l.actorRole === "SUPERADMIN" ? "Superadmin" : "Admin"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              GROUP_CLASS[groupKey] ?? "bg-black/10"
                            }`}
                          >
                            {ACTIVITY_LABEL[l.action as ActivityAction] ?? l.action}
                          </span>
                          <span className="font-semibold">{l.target}</span>
                        </p>
                        {l.detail && <p className="mt-1 text-sm text-black/60">{l.detail}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
