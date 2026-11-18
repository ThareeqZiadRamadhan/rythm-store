import { requireAdmin } from "@/lib/admin";
import User from "@/models/User";
import Order from "@/models/Order";
import RoleSelect from "@/components/admin/RoleSelect";

export const metadata = { title: "Pengguna — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const admin = await requireAdmin({ superadmin: true });

  const [users, orderAgg] = await Promise.all([
    User.find().select("name email phone role createdAt").sort({ createdAt: -1 }).lean(),
    Order.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$user", n: { $sum: 1 } } }]),
  ]);
  const orderCount = new Map(orderAgg.map((o) => [String(o._id), o.n]));

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Pengguna</h1>
      <p className="mt-2 text-sm text-black/50">{users.length} akun terdaftar. Hanya superadmin yang bisa mengubah role.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#f7f7f2] text-xs uppercase tracking-wider text-black/50">
            <tr>
              <th className="px-4 py-3 font-bold">Nama</th>
              <th className="px-4 py-3 font-bold">Kontak</th>
              <th className="px-4 py-3 font-bold">Pesanan</th>
              <th className="px-4 py-3 font-bold">Bergabung</th>
              <th className="px-4 py-3 font-bold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {users.map((u) => {
              const id = String(u._id);
              return (
                <tr key={id} className="hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dbe9a6] font-bold text-[#4a5d00]">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-black/60">
                    {u.email}
                    {u.phone && <span className="block text-xs">{u.phone}</span>}
                  </td>
                  <td className="px-4 py-3">{orderCount.get(id) ?? 0}</td>
                  <td className="px-4 py-3 text-black/60">
                    {new Date(u.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect
                      id={id}
                      role={u.role as "USER" | "ADMIN" | "SUPERADMIN"}
                      self={id === admin.id}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
