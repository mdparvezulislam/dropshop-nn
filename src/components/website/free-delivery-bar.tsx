"use client";

import type { ReactElement } from "react";
import { Truck, CheckCircle2 } from "lucide-react";

interface FreeDeliveryBarProps {
  subtotal: number;
  threshold?: number;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function FreeDeliveryBar({
  subtotal,
  threshold = 2000,
}: FreeDeliveryBarProps): ReactElement {
  const isFree = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 space-y-2">
      <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-slate-100">
        <span className="flex items-center gap-1.5">
          {isFree ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <span>
            {isFree
              ? "অভিনন্দন! আপনি ফ্রি ডেলিভারি সুযোগ পাচ্ছেন! 🎉"
              : `ফ্রি ডেলিভারি পেতে আরও ${formatBdt(remaining)} টাকার প্রোডাক্ট যোগ করুন`}
          </span>
        </span>
        <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
          {progressPercent}%
        </span>
      </div>

      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export default FreeDeliveryBar;
