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
      className="relative flex items-center justify-center h-9 w-9 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
      aria-label={showBadge ? `উইশলিস্ট — ${count} টি প্রোডাক্ট` : "উইশলিস্ট"}
    >
      <Heart className="h-4.5 w-4.5" aria-hidden />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950 tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default WishlistCounter;
