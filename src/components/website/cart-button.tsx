"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center h-9 w-9 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-4.5 w-4.5" />
      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
        0
      </span>
    </Link>
  );
}
