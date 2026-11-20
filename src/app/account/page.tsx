import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { serializeAddresses } from "@/lib/address";
import User from "@/models/User";
import ProfileForm from "@/components/ProfileForm";
import AddressBook from "@/components/AddressBook";

export const metadata = { title: "Profile — RYTHM" };

const roleLabel = {
  USER: "Customer",
  ADMIN: "Admin",
  SUPERADMIN: "Superadmin",
} as const;

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.sub)
    .select("name email phone role addresses createdAt")
    .lean();
  if (!user) redirect("/login");

  const since = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-black/50">Manage your account details and shipping addresses.</p>
      </div>

      {/* Kartu header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#11120f] p-6 text-white md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#c7ea4c]/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-[#c7ea4c] text-3xl font-black text-[#11120f]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-black">{user.name}</p>
            <p className="mt-1 truncate text-sm text-white/60">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                {roleLabel[user.role as keyof typeof roleLabel] ?? "Customer"}
              </span>
              {since && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                  Member since {since}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ""} />
      <AddressBook initial={serializeAddresses(user.addresses)} />
    </div>
  );
}
