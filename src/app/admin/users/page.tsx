import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import User from "@/models/User";
import Order from "@/models/Order";
import BlockUserButton from "@/components/admin/BlockUserButton";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

export const metadata = { title: "Users — Admin RYTHM" };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  blocked: boolean;
  createdAt: Date;
};

const ROLE_LABEL: Record<string, string> = { USER: "Customer", ADMIN: "Admin", SUPERADMIN: "Superadmin" };

const th = "px-4 py-3 font-bold";
const td = "px-4 py-3";

function joined(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Identity({ u }: { u: Row }) {
  return (
    <div className={`flex items-center gap-3 ${u.blocked ? "opacity-60" : ""}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dbe9a6] font-bold text-[#4a5d00]">
        {u.name.charAt(0).toUpperCase()}
      </span>
      <span className="font-bold">{u.name}</span>
    </div>
  );
}

function Contact({ u }: { u: Row }) {
  return (
    <td className={`${td} text-black/60`}>
      {u.email}
      {u.phone && <span className="block text-xs">{u.phone}</span>}
    </td>
  );
}

function Status({ blocked }: { blocked: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${blocked ? "bg-red-100 text-red-700" : "bg-[#c7ea4c]"}`}
    >
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

export default async function AdminUsers() {
  const me = await requireAdmin({ superadmin: true });

  const [docs, orderAgg] = await Promise.all([
    User.find().select("name email phone role isBlocked createdAt").sort({ createdAt: -1 }).lean(),
    Order.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$user", n: { $sum: 1 } } }]),
  ]);
  const orderCount = new Map(orderAgg.map((o) => [String(o._id), o.n]));

  const rows: Row[] = docs.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role ?? "USER",
    blocked: Boolean(u.isBlocked),
    createdAt: u.createdAt,
  }));
  // Superadmin di atas, lalu admin.
  const staff = rows
    .filter((u) => u.role !== "USER")
    .sort((a, b) => Number(b.role === "SUPERADMIN") - Number(a.role === "SUPERADMIN"));
  const customers = rows.filter((u) => u.role === "USER");
  const blockedCustomers = customers.filter((u) => u.blocked).length;

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Users</h1>
      <p className="mt-2 text-sm text-black/50">
        Superadmins manage admin accounts. Customers sign up themselves through the Sign up page.
      </p>

      {/* ---------- Admin ---------- */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">Admin</h2>
            <p className="mt-1 text-sm text-black/50">{staff.length - 1} admin {staff.length - 1 === 1 ? "account" : "accounts"}</p>
          </div>
          <Link
            href="/admin/users/new"
            className="flex items-center gap-2 rounded-full bg-[#11120f] px-5 py-3 text-sm font-bold text-white hover:bg-black/80"
          >
            <Plus size={16} /> Add admin
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f7f7f2] text-xs uppercase tracking-wider text-black/50">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Contact</th>
                <th className={th}>Role</th>
                <th className={th}>Created</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {staff.map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id} className={u.blocked ? "bg-red-50/40" : "hover:bg-black/[0.02]"}>
                    <td className={td}>
                      <Identity u={u} />
                    </td>
                    <Contact u={u} />
                    <td className={`${td} font-semibold`}>
                      {ROLE_LABEL[u.role]}
                      {self && <span className="font-normal text-black/50"> (you)</span>}
                    </td>
                    <td className={`${td} text-black/60`}>{joined(u.createdAt)}</td>
                    <td className={td}>
                      <Status blocked={u.blocked} />
                    </td>
                    <td className={td}>
                      <div className="flex items-center justify-end gap-1">
                        {u.role !== "ADMIN" ? (
                          <span className="text-xs text-black/40">{self ? "Akunmu" : "—"}</span>
                        ) : (
                          <>
                            <Link
                              href={`/admin/users/${u.id}`}
                              aria-label={`Edit ${u.email}`}
                              title="Edit account"
                              className="grid size-9 place-items-center rounded-full text-black/70 transition hover:bg-black/5"
                            >
                              <Pencil size={16} />
                            </Link>
                            <BlockUserButton id={u.id} email={u.email} blocked={u.blocked} />
                            <DeleteUserButton id={u.id} email={u.email} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Pelanggan ---------- */}
      <section className="mt-12">
        <h2 className="text-xl font-black tracking-tight">Customers</h2>
        <p className="mt-1 text-sm text-black/50">
          {customers.length} {customers.length === 1 ? "account" : "accounts"}
          {blockedCustomers > 0 ? ` · ${blockedCustomers} blocked` : ""}. Customer accounts can only be blocked or unblocked.
        </p>

        {customers.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50">
            No customers have signed up yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f7f7f2] text-xs uppercase tracking-wider text-black/50">
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Orders</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {customers.map((u) => (
                  <tr key={u.id} className={u.blocked ? "bg-red-50/40" : "hover:bg-black/[0.02]"}>
                    <td className={td}>
                      <Identity u={u} />
                    </td>
                    <Contact u={u} />
                    <td className={td}>{orderCount.get(u.id) ?? 0}</td>
                    <td className={`${td} text-black/60`}>{joined(u.createdAt)}</td>
                    <td className={td}>
                      <Status blocked={u.blocked} />
                    </td>
                    <td className={td}>
                      <div className="flex justify-end">
                        <BlockUserButton id={u.id} email={u.email} blocked={u.blocked} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
