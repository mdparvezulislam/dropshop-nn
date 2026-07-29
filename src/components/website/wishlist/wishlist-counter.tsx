"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "./wishlist-provider";

/**
 * Header wishlist counter — same shape/a11y contract as the cart button, fed
 * by the shared provider so it never issues a request of its own.
 */
export function WishlistCounter(): React.ReactElement {
  const { count, hydrated } = useWishlist();
  const showBadge = hydrated && count > 0;

  return (
    <Link
      href="/account/wishlist"
      className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 hover:text-amber-600 hover:border-amber-400 transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-amber-500"
      aria-label={showBadge ? `উইশলিস্ট — ${count} টি প্রোডাক্ট` : "উইশলিস্ট"}
    >
      <Heart className="h-4.5 w-4.5" aria-hidden />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950 tabular-nums shadow-xs"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default WishlistCounter;
