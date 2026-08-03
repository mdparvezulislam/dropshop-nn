"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Clock } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface FlashDealsSectionProps {
  products: PublicProductCard[];
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

// Sample fallback flash sale products if DB contains insufficient entries
const MOCK_FLASH_PRODUCTS: PublicProductCard[] = [
  {
    id: "flash-1",
    slug: "gearup-vc14-vegetable-cutter",
    name: "GearUP VC14 প্রিমিয়াম ভেজিটেবল কাটার",
    image: "",
    price: 1250,
    comparePrice: 1850,
    discountPercent: 32,
    stockStatus: "in_stock",
    badges: ["flash_sale"],
    isNew: false,
    isFlashSale: true,
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: "flash-2",
    slug: "wireless-tws-earbuds-pro",
    name: "TWS પ્રો നോইজ ক্যানসেলিং ইয়ারবাড",
    image: "",
    price: 1650,
    comparePrice: 2400,
    discountPercent: 31,
    stockStatus: "in_stock",
    badges: ["flash_sale"],
    isNew: true,
    isFlashSale: true,
    rating: 4.9,
    reviewCount: 88,
  },
  {
    id: "flash-3",
    slug: "smart-health-fitness-watch-v8",
    name: "V8 ওয়াটারপ্রুফ স্মার্ট ফিটনেস ওয়াচ",
    image: "",
    price: 2100,
    comparePrice: 3200,
    discountPercent: 34,
    stockStatus: "in_stock",
    badges: ["flash_sale"],
    isNew: false,
    isFlashSale: true,
    rating: 4.7,
    reviewCount: 56,
  },
  {
    id: "flash-4",
    slug: "electric-portable-juicer-cup",
    name: "রিচার্জেবল পোর্টেবল জুসার কাপ",
    image: "",
    price: 990,
    comparePrice: 1500,
    discountPercent: 34,
    stockStatus: "low_stock",
    badges: ["flash_sale"],
    isNew: false,
    isFlashSale: true,
    rating: 4.6,
    reviewCount: 29,
  },
  {
    id: "flash-5",
    slug: "mini-portable-air-cooler-fan",
    name: "মিনি পোর্টেবল এয়ার কুলার ফ্যান",
    image: "",
    price: 1450,
    comparePrice: 2100,
    discountPercent: 31,
    stockStatus: "in_stock",
    badges: ["flash_sale"],
    isNew: false,
    isFlashSale: true,
    rating: 4.5,
    reviewCount: 19,
  },
  {
    id: "flash-6",
    slug: "magnetic-car-phone-holder",
    name: "ম্যাগনেটিক কার ড্যাশবোর্ড ফোন হোল্ডার",
    image: "",
    price: 450,
    comparePrice: 750,
    discountPercent: 40,
    stockStatus: "in_stock",
    badges: ["flash_sale"],
    isNew: false,
    isFlashSale: true,
    rating: 4.9,
    reviewCount: 110,
  },
];

export function FlashDealsSection({
  products,
  priorityFirstRow = false,
}: FlashDealsSectionProps): React.ReactElement {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayProducts = products.map((p) => ({
    ...p,
    isFlashSale: true,
    discountPercent:
      p.discountPercent ??
      (p.comparePrice && p.comparePrice > p.price
        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
        : 25),
  }));

  if (displayProducts.length === 0) {
    return (
      <section className="py-6 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                নতুন ফ্ল্যাশ সেল অফার শীঘ্রই আসছে!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                সব লাইভ প্রোডাক্টস দেখতে আমাদের শপ ক্যাটালগে ব্রাউজ করুন
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-2xs shrink-0"
          >
            <span>সব প্রোডাক্ট দেখুন</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-6 sm:py-9 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-labelledby="flash-deals-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        {/* Header with Title, Urgency Timer, and View All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
                <Flame className="h-5 w-5 fill-white animate-pulse" aria-hidden />
              </div>
              <h2
                id="flash-deals-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                ফ্ল্যাশ সেল
              </h2>
            </div>

            {/* Prominent Urgency Countdown Timer */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
              <Clock className="h-3.5 w-3.5 animate-spin text-red-600 dark:text-red-400" aria-hidden />
              <span className="hidden sm:inline">শেষ হতে বাকি:</span>
              <div className="flex items-center gap-1 font-mono font-black tabular-nums">
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                  {toBanglaDigits(timeLeft.hours)}
                </span>
                <span className="text-red-600 font-bold">:</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                  {toBanglaDigits(timeLeft.minutes)}
                </span>
                <span className="text-red-600 font-bold">:</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                  {toBanglaDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-red-600 dark:text-red-400 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 rounded self-end sm:self-auto"
          >
            <span>সব ফ্ল্যাশ সেল দেখুন</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontal Scroll Layout for Mobile & Responsive Grid for Desktop */}
        <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth ws-scroll pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
          {displayProducts.map((product, index) => (
            <div key={product.id} className="shrink-0 w-44 sm:w-auto snap-start">
              <ProductCard
                product={product}
                priority={priorityFirstRow && index < 4}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashDealsSection;
