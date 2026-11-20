"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistButton({
  slug,
  className = "",
  size = 18,
}: {
  slug: string;
  className?: string;
  size?: number;
}) {
  const { has, toggle } = useWishlist();
  const saved = has(slug);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={`grid size-10 place-items-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 active:scale-95 ${className}`}
    >
      <Heart
        size={size}
        className={`transition-colors ${saved ? "fill-[#e2533f] text-[#e2533f]" : "text-[#11120f]"}`}
      />
    </button>
  );
}
