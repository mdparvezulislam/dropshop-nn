"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

export interface CartSummaryProps {
  /** BDT display subtotal. */
  subtotal: number;
  currency?: string;
  itemCount: number;
  discountAmount?: number;
  deliveryCharge?: number;
  couponCode?: string;
}

/**
 * Order summary panel with inline coupon calculations and mobile sticky checkout bar.
 */
export function CartSummary({
  subtotal,
  currency = "BDT",
  itemCount,
  discountAmount = 0,
  deliveryCharge = 60,
  couponCode,
}: CartSummaryProps) {
  const symbol = currency === "BDT" ? "৳" : currency;
  const formatPrice = (price: number) =>
    `${symbol}${Math.max(0, price).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  return (
    <>
      {/* Desktop / Desktop Sidebar Summary */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          অর্ডার সামারি
        </h2>

        <div className="space-y-3 text-xs sm:text-sm font-semibold">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>সাবটোটাল ({itemCount} টি প্রোডাক্ট)</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1 font-bold">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                কুপন ছাড় ({couponCode})
              </span>
              <span className="font-black tabular-nums">-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>ডেলিভারি চার্জ</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {deliveryCharge > 0 ? formatPrice(deliveryCharge) : "ফ্রি ডেলিভারি"}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black text-emerald-900 dark:text-emerald-300 text-center">
              🎉 আপনি এই অর্ডারে মোট {formatPrice(discountAmount)} সেভ করছেন!
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-slate-100">
              <span>সর্বমোট (Grand Total)</span>
              <span className="text-lg text-amber-600 dark:text-amber-400 tabular-nums">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/checkout"
          aria-disabled={itemCount === 0}
          tabIndex={itemCount === 0 ? -1 : undefined}
          className={
            itemCount === 0
              ? "w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold px-6 pointer-events-none"
              : "w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 transition-all active:scale-[0.98] shadow-md focus-visible:outline-2 focus-visible:outline-amber-600 touch-manipulation"
          }
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          <span>অর্ডার সম্পন্ন করুন</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {/* Mobile Sticky Bottom Checkout Bar (sitting above 48px bottom nav) */}
      <div className="fixed bottom-12 inset-x-0 z-30 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              সর্বমোট ({itemCount} টি)
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatPrice(grandTotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            aria-disabled={itemCount === 0}
            className={
              itemCount === 0
                ? "inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs pointer-events-none"
                : "inline-flex items-center justify-center gap-1.5 h-10 px-6 rounded-xl bg-amber-500 active:bg-amber-600 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md touch-manipulation"
            }
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            <span>চেকআউট ({formatPrice(grandTotal)})</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default CartSummary;
