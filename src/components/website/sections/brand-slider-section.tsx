"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  badge: string;
  slug: string;
}

const BRANDS: BrandItem[] = [
  { id: "1", name: "Anker", badge: "অরিজিনাল গ্যাজেট", slug: "anker" },
  { id: "2", name: "Baseus", badge: "প্রিমিয়াম চার্জিং", slug: "baseus" },
  { id: "3", name: "Haylou", badge: "স্মার্ট ওয়াচ", slug: "haylou" },
  { id: "4", name: "Joyroom", badge: "অডিও অ্যান্ড সাউন্ড", slug: "joyroom" },
  { id: "5", name: "Oraimo", badge: "স্মার্ট এক্সেসরিজ", slug: "oraimo" },
  { id: "6", name: "Realme", badge: "স্মার্ট ডিভাইসেস", slug: "realme" },
];

export function BrandSliderSection(): React.ReactElement {
  return (
    <section
      className="w-full py-8 sm:py-12 lg:py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-labelledby="brands-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" aria-hidden />
              <h2
                id="brands-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                অফিসিয়াল ব্র্যান্ড পার্টনার
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              বিশ্বস্ত ও জনপ্রিয় ব্র্যান্ডসমূহের অরিজিনাল ক্যাটালগ
            </p>
          </div>

          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব ব্র্যান্ড দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {BRANDS.map((brand) => (
            <motion.div
              key={brand.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all text-center h-28 group"
              >
                <span className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {brand.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {brand.badge}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandSliderSection;
