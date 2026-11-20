"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Ticket,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
} | null;

type MenuLink = { href: string; label: string; icon: LucideIcon };

const accountLinks: MenuLink[] = [
  { href: "/account", label: "Profile", icon: UserIcon },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/vouchers", label: "My vouchers", icon: Ticket },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

const adminLink: MenuLink = {
  href: "/admin",
  label: "Admin panel",
  icon: LayoutDashboard,
};

function linksFor(user: NonNullable<SessionUser>): MenuLink[] {
  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  return isAdmin ? [adminLink, ...accountLinks] : accountLinks;
}

export const SESSION_EVENT = "rythm:session-change";

/** Beri tahu semua komponen bahwa status login berubah. */
export function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Membaca sesi dari /api/auth/me saat pindah halaman atau saat status login berubah. */
export function useSession() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser>(null);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(SESSION_EVENT, bump);
    return () => window.removeEventListener(SESSION_EVENT, bump);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setUser(d.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, version]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    notifySessionChange();
    router.push("/");
    router.refresh();
  }

  return { user, ready, logout };
}

type Props = {
  user: SessionUser;
  ready: boolean;
  onLogout: () => void;
};

/** Bagian akun di header (desktop, tablet, dan ikon di mobile). */
export function AccountMenu({ user, ready, onLogout }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup menu saat pindah halaman
  useEffect(() => setOpen(false), [pathname]);

  // Tutup menu saat klik di luar atau tekan Escape
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Placeholder supaya tombol tidak "loncat" saat sesi masih dimuat
  if (!ready) return <div className="size-10 sm:w-[150px]" />;

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5 sm:block"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="hidden rounded-full bg-[#11120f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black/80 sm:block"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          aria-label="Sign in or sign up"
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-black/5 sm:hidden"
        >
          <UserIcon size={20} />
        </Link>
      </>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 transition-colors hover:bg-black/5"
      >
        <span className="grid size-10 place-items-center rounded-full bg-[#dbe9a6] text-base font-bold text-[#4a5d00]">
          {initial}
        </span>
        <ChevronDown
          size={18}
          className={`text-black/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[300px] rounded-3xl border border-black/5 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
          <div className="px-3 pb-3 pt-2">
            <p className="truncate text-base font-bold">{user.name}</p>
            <p className="mt-0.5 truncate text-sm text-black/50">{user.email}</p>
          </div>
          <div className="mx-3 mb-2 h-px bg-black/10" />

          <ul>
            {linksFor(user).map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors hover:bg-black/5"
                >
                  <Icon size={22} strokeWidth={1.6} />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-[15px] font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={22} strokeWidth={1.6} />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

/** Bagian akun di dalam menu hamburger (mobile). */
export function MobileAccountLinks({
  user,
  ready,
  onLogout,
  onNavigate,
}: Props & { onNavigate: () => void }) {
  if (!ready) return null;

  if (!user) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-black/10 pt-4">
        <Link
          href="/login"
          onClick={onNavigate}
          className="rounded-full border border-black/15 px-4 py-3 text-center text-sm font-bold"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          onClick={onNavigate}
          className="rounded-full bg-[#11120f] px-4 py-3 text-center text-sm font-bold text-white"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-black/10 pt-4">
      <div className="px-4 pb-2">
        <p className="truncate font-bold">{user.name}</p>
        <p className="truncate text-sm text-black/50">{user.email}</p>
      </div>
      {linksFor(user).map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold hover:bg-black/5"
        >
          <Icon size={20} strokeWidth={1.6} />
          {label}
        </Link>
      ))}
      <button
        onClick={() => {
          onNavigate();
          onLogout();
        }}
        className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
      >
        <LogOut size={20} strokeWidth={1.6} />
        Sign out
      </button>
    </div>
  );
}