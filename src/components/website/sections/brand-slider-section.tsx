"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  badge: string;
  slug: string;
}

const BRANDS: BrandItem[] = [
  { id: "1", name: "ANKER", badge: "অরিজিনাল গ্যাজেট", slug: "anker" },
  { id: "2", name: "BASEUS", badge: "প্রিমিয়াম চার্জিং", slug: "baseus" },
  { id: "3", name: "HAYLOU", badge: "স্মার্ট ওয়াচ", slug: "haylou" },
  { id: "4", name: "JOYROOM", badge: "অডিও অ্যান্ড সাউন্ড", slug: "joyroom" },
  { id: "5", name: "ORAIMO", badge: "স্মার্ট এক্সেসরিজ", slug: "oraimo" },
  { id: "6", name: "REALME", badge: "স্মার্ট ডিভাইসেস", slug: "realme" },
];

export function BrandSliderSection(): React.ReactElement {
  return (
    <section
      className="w-full py-8 sm:py-12 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      aria-labelledby="brands-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </div>
              <h2
                id="brands-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                অফিসিয়াল ব্র্যান্ড পার্টনার
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              বিশ্বস্ত ও ১০০% অরিজিনাল অফিশিয়াল ব্র্যান্ড সোর্সিং
            </p>
          </div>

          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded shrink-0"
          >
            সব ব্র্যান্ড দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {/* Grayscale on default -> Vibrant Color on Hover & Mobile Horizontal Scroll */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth ws-scroll pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
          {BRANDS.map((brand) => (
            <motion.div
              key={brand.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 w-36 sm:w-auto snap-start"
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-300 text-center h-28 grayscale opacity-75 hover:grayscale-0 hover:opacity-100"
              >
                <span className="text-base font-black tracking-wider text-slate-700 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {brand.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
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
