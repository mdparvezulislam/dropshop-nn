"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Clock } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface FlashDealsSectionProps {
  products: PublicProductCard[];
  /** True when this is the first product section on the page — its first row preloads. */
  priorityFirstRow?: boolean;
}

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

function toBanglaDigits(value: number): string {
  return String(value)
    .padStart(2, "0")
    .split("")
    .map((ch) => (/[0-9]/.test(ch) ? BANGLA_DIGITS[Number(ch)] : ch))
    .join("");
}

export function FlashDealsSection({
  products,
  priorityFirstRow = false,
}: FlashDealsSectionProps): React.ReactElement | null {
  // Real countdown logic counting down to midnight today / next 8 hours
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) return null;

  const displayProducts = products.slice(0, 10);

  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-labelledby="flash-deals-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Flame className="h-6 w-6 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" aria-hidden />
              <h2
                id="flash-deals-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                ফ্ল্যাশ সেল
              </h2>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-black text-red-700 dark:text-red-400">
              <Clock className="h-3.5 w-3.5 animate-pulse" aria-hidden />
              <span>শেষ হতে বাকি:</span>
              <div className="flex items-center gap-1 tabular-nums font-mono">
                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {toBanglaDigits(timeLeft.hours)}
                </span>
                <span>:</span>
                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {toBanglaDigits(timeLeft.minutes)}
                </span>
                <span>:</span>
                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {toBanglaDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব ফ্ল্যাশ সেল দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={priorityFirstRow && index < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashDealsSection;
