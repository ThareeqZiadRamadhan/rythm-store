"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

let slugs = new Set<string>();
let inflight: Promise<void> | null = null;
const listeners = new Set<(s: Set<string>) => void>();

function publish(next: Set<string>) {
  slugs = next;
  listeners.forEach((l) => l(next));
}

function refresh() {
  if (!inflight) {
    inflight = fetch("/api/account/wishlist", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => publish(new Set<string>(d.slugs ?? [])))
      .catch(() => {})
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useWishlist() {
  const pathname = usePathname();
  const router = useRouter();
  const [current, setCurrent] = useState(slugs);

  useEffect(() => {
    listeners.add(setCurrent);
    setCurrent(slugs);
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname]);

  async function toggle(slug: string): Promise<boolean | null> {
    const before = slugs;
    const optimistic = new Set(slugs);
    if (optimistic.has(slug)) optimistic.delete(slug);
    else optimistic.add(slug);
    publish(optimistic);

    try {
      const res = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.status === 401) {
        publish(before);
        router.push("/login");
        return null;
      }
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        publish(before);
        return null;
      }
      publish(new Set<string>(d.slugs ?? []));
      return Boolean(d.saved);
    } catch {
      publish(before);
      return null;
    }
  }

  return { has: (slug: string) => current.has(slug), toggle };
}

// Saat login/logout, kosongkan dan muat ulang wishlist supaya tombol hati ikut berubah.
if (typeof window !== "undefined") {
  window.addEventListener("rythm:session-change", () => {
    publish(new Set());
    refresh();
  });
}
