"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Headphones, Watch, Laptop, Home, Video, Sparkles, Grid3x3 } from "lucide-react";
import type { Category } from "@/features/catalog/domain/classification-entity";

interface CategoryShowcaseProps {
  categories?: Category[];
}

const CATEGORY_ITEMS = [
  { name: "মোবাইল অ্যাক্সেসরিজ", count: "১,২৫০+ প্রোডাক্ট", icon: Smartphone, slug: "mobile-accessories" },
  { name: "অডিও & সাউন্ড", count: "৯৫০+ প্রোডাক্ট", icon: Headphones, slug: "audio-sound" },
  { name: "স্মার্ট গ্যাজেট", count: "১,১০০+ প্রোডাক্ট", icon: Watch, slug: "smart-gadgets" },
  { name: "কম্পিউটার অ্যাক্সেসরিজ", count: "৪৫০+ প্রোডাক্ট", icon: Laptop, slug: "computer-accessories" },
  { name: "হোম & কিচেন", count: "১,৫০০+ প্রোডাক্ট", icon: Home, slug: "home-kitchen" },
  { name: "সিকিউরিটি ক্যামেরা", count: "৩৫০+ প্রোডাক্ট", icon: Video, slug: "security-camera" },
  { name: "বিউটি & পার্সোনাল কেয়ার", count: "৭৫০+ প্রোডাক্ট", icon: Sparkles, slug: "beauty-care" },
  { name: "সব ক্যাটাগরি", count: "সব প্রোডাক্ট দেখুন", icon: Grid3x3, slug: "categories", isAll: true },
];

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-12 lg:py-16 bg-white border-b border-slate-200" aria-label="Popular Categories">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              জনপ্রিয় ক্যাটাগরি
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
              আপনার পছন্দের প্রোডাক্ট খুঁজে নিন
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {CATEGORY_ITEMS.map((cat) => {
            const Icon = cat.icon;
            const href = cat.isAll ? "/categories" : `/category/${cat.slug}`;
            return (
              <Link
                key={cat.name}
                href={href}
                className="group flex flex-col items-center text-center p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-amber-400 hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-amber-50 flex items-center justify-center mb-2.5 transition-colors">
                  <Icon className="h-6 w-6 text-slate-700 group-hover:text-amber-600 transition-colors" />
                </div>
                <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-600 mt-1">
                  {cat.count}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;
