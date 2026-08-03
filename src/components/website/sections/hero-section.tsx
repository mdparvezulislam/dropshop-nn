"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Store,
  Building2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const HERO_SLIDES = [
  {
    id: "lifestyle-gadgets",
    badge: "🔥 হট কালেকশন ২০২৬",
    title: "অরিজিনাল গ্যাজেট ও স্মার্ট লাইফস্টাইল প্রোডাক্ট",
    subtitle: "সেরা দামে সেরা মানের ব্র্যান্ডেড ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্স শপিং করুন।",
    category: "গ্যাজেট ও ইলেকট্রনিক্স",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    accentColor: "bg-amber-500",
  },
  {
    id: "reseller-hub",
    badge: "💼 রিসেলারদের প্রথম পছন্দ",
    title: "স্টক ছাড়াই নিজের ই-কমার্স বিজনেস শুরু করুন",
    subtitle: "২,৫০০+ রিসেলারের সাথে যুক্ত হন। আমরা সামলাবো প্যাকেজিং ও ডেলিভারি।",
    category: "ড্রপশিপিং ও রিসেলিং",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    accentColor: "bg-amber-500",
  },
  {
    id: "wholesale-deals",
    badge: "📦 পাইকারি বাজার",
    title: "হোলসেলারদের জন্য আকর্ষণীয় ডায়রেক্ট ফ্যাক্টরি রেট",
    subtitle: "সরাসরি প্রস্তুতকারক ও ইম্পোর্টার থেকে কিনুন সর্বনিম্ন দামে বাল্ক অর্ডারে।",
    category: "হোলসেল সাপ্লাই",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    accentColor: "bg-amber-500",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-4 pb-8 lg:pt-10 lg:pb-16 border-b border-slate-200/60 dark:border-slate-800/60">
      {/* Background Decorative Blur & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Main Content Area (Text & CTA) */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-4 sm:gap-6 text-left">
            
            {/* Live Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-badge"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>{slide.badge}</span>
              </motion.div>
            </AnimatePresence>

            {/* Dynamic Animated Headline & Subtext */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-text"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.25]">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* SINGLE PROMINENT PRIMARY CTA */}
            <div className="pt-2 sm:pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 text-base sm:text-lg font-black shadow-md hover:shadow-lg transition-all touch-manipulation group"
              >
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>এখনই শপ করুন</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 2 SMALL SECONDARY CARDS (Low Visual Weight for Reseller & Wholesale) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <Link
                href="/become-reseller"
                className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-xs transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Store className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    রিসেলার হাব <span className="text-amber-500">→</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    স্টক ছাড়াই আয় করার সুযোগ
                  </span>
                </div>
              </Link>

              <Link
                href="/become-wholesale-partner"
                className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-xs transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    হোলসেল পার্টনার <span className="text-amber-500">→</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    পাইকারি দামে বাল্ক অর্ডার
                  </span>
                </div>
              </Link>
            </div>

          </div>

          {/* Hero Banner Carousel (Right Side on Desktop / Stacked Bottom on Mobile) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-white to-slate-100 dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-950 border border-amber-500/20 shadow-md">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 text-xs font-bold shadow-2xs border border-slate-200 dark:border-slate-800">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      {slide.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      0{currentSlide + 1} / 0{HERO_SLIDES.length}
                    </span>
                  </div>

                  {/* Creative Illustration Card */}
                  <div className="my-auto py-4 text-center">
                    <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-amber-500 text-slate-950 shadow-lg font-black text-3xl sm:text-4xl mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
                      NN
                    </div>
                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 max-w-xs mx-auto leading-tight">
                      {slide.title}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <ShieldCheck className="h-4 w-4" />
                      ১০০% অরিজিনাল ও দ্রুত ডেলিভারি
                    </div>
                  </div>

                  {/* Carousel Dots & Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      {HERO_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            idx === currentSlide
                              ? "w-7 bg-amber-500"
                              : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400",
                          )}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevSlide}
                        className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors"
                        aria-label="আগের স্লাইড"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextSlide}
                        className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors"
                        aria-label="পরের স্লাইড"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
