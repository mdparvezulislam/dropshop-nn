"use client";

import { useState, type ReactElement } from "react";
import { Tag, CheckCircle2, XCircle, Sparkles } from "lucide-react";

export interface CouponInfo {
  code: string;
  discountAmount: number;
  discountType: "fixed" | "percent";
  description: string;
}

export interface CartCouponSectionProps {
  subtotal: number;
  appliedCoupon: CouponInfo | null;
  onApplyCoupon: (coupon: CouponInfo) => void;
  onRemoveCoupon: () => void;
}

const PRESET_COUPONS: CouponInfo[] = [
  { code: "WELCOME10", discountAmount: 10, discountType: "percent", description: "১০% প্রথম অর্ডার ছাড়" },
  { code: "SAVE100", discountAmount: 100, discountType: "fixed", description: "৳১০০ ফ্লাট ডিসকাউন্ট" },
];

export function CartCouponSection({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CartCouponSectionProps): ReactElement {
  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = (codeToApply?: string): void => {
    const code = (codeToApply ?? inputCode).trim().toUpperCase();
    if (!code) {
      setErrorMsg("একটি কুপন কোড লিখুন");
      return;
    }

    const found = PRESET_COUPONS.find((c) => c.code === code);
    if (found) {
      setErrorMsg(null);
      onApplyCoupon(found);
      setInputCode("");
    } else {
      setErrorMsg("অকার্যকর কুপন কোড। অনুগ্রহ করে সঠিক কোড দিন।");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-amber-500" aria-hidden />
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">কুপন ও অফার</h3>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
            <div className="min-w-0">
              <span className="text-xs font-black uppercase tracking-wider">{appliedCoupon.code}</span>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                {appliedCoupon.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-xs font-extrabold text-red-600 dark:text-red-400 hover:underline shrink-0 px-2 py-1"
          >
            সরিয়ে ফেলুন
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="কুপন কোড প্রবেশ করুন"
              className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
            />
            <button
              type="button"
              onClick={() => handleApply()}
              className="h-10 px-4 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-black transition-colors hover:bg-slate-800 dark:hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-amber-600 active:scale-95 touch-manipulation"
            >
              প্রয়োগ
            </button>
          </div>

          {errorMsg && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
              <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Quick preset coupon chips */}
          <div className="pt-1">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1.5">
              উপলব্ধ প্রমো কোড:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COUPONS.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleApply(c.code)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-extrabold text-amber-900 dark:text-amber-300 hover:bg-amber-100 transition-colors active:scale-95"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" aria-hidden />
                  <span>{c.code} ({c.discountType === "percent" ? `${c.discountAmount}%` : `৳${c.discountAmount}`})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartCouponSection;
