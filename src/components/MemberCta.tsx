"use client";

import Link from "next/link";
import { ArrowRight, Heart, Ticket } from "lucide-react";
import { useSession } from "@/components/AccountMenu";

export default function MemberCta() {
  const { user, ready } = useSession();

  // Placeholder setinggi tombol supaya layout tidak "loncat" saat sesi dimuat
  if (!ready) return <div className="h-[104px]" />;

  if (user) {
    const firstName = user.name.split(" ")[0];
    return (
      <div>
        <p className="text-lg font-semibold text-white">
          You're already a member, {firstName}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/account/vouchers"
            className="group flex h-14 items-center gap-2 rounded-full bg-[#c7ea4c] px-7 font-black text-[#11120f] transition hover:bg-[#d6f25e]"
          >
            <Ticket size={18} /> View my vouchers
            <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/account/wishlist"
            className="flex h-14 items-center gap-2 rounded-full border border-white/25 px-7 font-bold text-white transition hover:border-white"
          >
            <Heart size={18} /> Wishlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link
          href="/register"
          className="group flex h-14 items-center gap-2 rounded-full bg-[#c7ea4c] px-8 font-black text-[#11120f] transition hover:bg-[#d6f25e]"
        >
          Sign up now
          <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
        </Link>
        <p className="text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-white underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
      <p className="mt-5 text-sm text-white/45">
        Free. New members can claim the voucher{" "}
        <span className="font-mono font-bold text-white/70">WELCOME10</span> right away.
      </p>
    </div>
  );
}
