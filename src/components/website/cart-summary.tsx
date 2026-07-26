"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export interface CartSummaryProps {
  /** BDT display subtotal. */
  subtotal: number;
  currency?: string;
  itemCount: number;
}

/**
 * Order summary panel. Shipping and any tier discounts are resolved by the
 * server-side checkout pipeline — this panel never invents an estimate,
 * a profit figure, or a shipping threshold.
 */
export function CartSummary({ subtotal, currency = "BDT", itemCount }: CartSummaryProps) {
  const symbol = currency === "BDT" ? "৳" : currency;
  const formatPrice = (price: number) =>
    `${symbol}${price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 rounded-xl border border-border/60 bg-card">
      <h2 className="text-base font-semibold text-foreground mb-4">অর্ডার সামারি</h2>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50">সাবটোটাল ({itemCount} টি)</span>
          <span className="font-medium text-foreground tabular-nums">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-foreground/50">ডেলিভারি চার্জ</span>
          <span className="text-xs font-medium text-foreground/60">চেকআউটে নির্ধারিত হবে</span>
        </div>

        <div className="pt-3 border-t border-border/40">
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-foreground">মোট (ডেলিভারি ছাড়া)</span>
            <span className="font-bold text-foreground tabular-nums">{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        aria-disabled={itemCount === 0}
        tabIndex={itemCount === 0 ? -1 : undefined}
        className={
          itemCount === 0
            ? "mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-muted text-foreground/40 font-semibold px-6 pointer-events-none"
            : "mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        }
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        চেকআউট করুন
      </Link>
      <p className="mt-2 text-[11px] text-foreground/40 text-center">
        মূল্য ও স্টক চেকআউটের সময় সার্ভারে যাচাই করা হবে।
      </p>
    </div>
  );
}

export default CartSummary;
