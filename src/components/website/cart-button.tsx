"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useLocalCart } from "@/features/checkout/store/local-cart";

export function CartButton() {
  const { count, hydrated } = useLocalCart();
  const showBadge = hydrated && count > 0;

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center h-9 w-9 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
      aria-label={showBadge ? `শপিং কার্ট — ${count} টি আইটেম` : "শপিং কার্ট"}
    >
      <ShoppingCart className="h-4.5 w-4.5" aria-hidden />
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
