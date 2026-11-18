import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function AccountEmpty({
  icon: Icon,
  title,
  text,
  href,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-[#f7f7f2] px-6 py-16 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-black/5">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h2 className="mt-6 text-xl font-black">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-black/50">{text}</p>
      <Link
        href={href}
        className="mt-6 rounded-full bg-[#11120f] px-6 py-3 text-sm font-bold text-white hover:bg-black/80"
      >
        {cta}
      </Link>
    </div>
  );
}
