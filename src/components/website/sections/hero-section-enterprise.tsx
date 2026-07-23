"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Truck, RotateCcw, Award, Package, Users, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface HeroSlide {
  id: number;
  offerBadge: string;
  cardTitle: string;
  cardSubtitle: string;
  cardCtaText: string;
  cardCtaHref: string;
  bannerImage: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    offerBadge: "🔥 আজকের স্পেশাল অফার",
    cardTitle: "সেরা প্রোডাক্ট সেরা দামে",
    cardSubtitle: "আপনার ব্যবসার জন্য সেরা প্যাক।",
    cardCtaText: "এখনই শপ করুন",
    cardCtaHref: "/products",
    bannerImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    offerBadge: "⚡ রিসেলার হট ডিল",
    cardTitle: "জিরো ইনভেস্টমেন্ট ব্যবসা",
    cardSubtitle: "সবচেয়ে বেশি সেল হওয়া গ্যাজেট আইটেম।",
    cardCtaText: "রিসেলিং শুরু করুন",
    cardCtaHref: "/become-reseller",
    bannerImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    offerBadge: "📦 হোলসেল সুপার ডিল",
    cardTitle: "বাল্ক অর্ডারে মেগা ছাড়",
    cardSubtitle: "ডাইরেক্ট ফ্যাক্টরি ও ইম্পোর্টার রেট।",
    cardCtaText: "পাইকারি দাম দেখুন",
    cardCtaHref: "/become-wholesale-partner",
    bannerImage: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
  },
];

export function HeroSection(): React.ReactElement {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="w-full pt-4 pb-8 lg:pt-6 lg:pb-12 bg-white relative overflow-hidden" aria-label="Hero section">
      {/* Background Soft Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />

      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          {/* Left Column - Headline & Micro Pills matching reference image */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-black text-amber-800 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
              <span>বাংলাদেশের বিশ্বস্ত ড্রপশিপিং প্ল্যাটফর্ম</span>
            </div>

            {/* Main Headline (Pure Black text-slate-900) */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              সোর্স করুন, বিক্রি করুন, <br />
              ব্যবসা বাড়ান{" "}
              <span className="text-amber-500">DropshopNN</span> এর সাথে
            </h1>

            {/* Subtitle (Crisp Dark Gray text-slate-700) */}
            <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed max-w-xl">
              বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রোডাক্ট সাপ্লাই প্ল্যাটফর্ম। রিসেলার, হোলসেলার এবং ড্রপশিপারদের জন্য অল-ইন-ওয়ান সমাধান।
            </p>

            {/* 4 Micro Feature Pills matching reference */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span>প্রিমিয়াম কোয়ালিটি</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs">
                <Truck className="h-3.5 w-3.5 text-amber-500" />
                <span>ফাস্ট ডেলিভারি</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs">
                <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                <span>সহজ রিটার্ন</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>সেরা প্রফিট</span>
              </div>
            </div>

            {/* 3 CTA Buttons matching reference */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/products">
                <Button size="lg" className="h-11 px-6 text-sm font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-[0.98]">
                  প্রোডাক্ট দেখুন
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/become-reseller">
                <Button size="lg" className="h-11 px-6 text-sm font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-md">
                  রিসেলার হন
                </Button>
              </Link>
              <Link href="/become-wholesale-partner">
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-extrabold border-slate-300 text-slate-900 hover:bg-slate-100">
                  হোলসেলার করুন
                </Button>
              </Link>
            </div>

            {/* Stats Row (4 Columns matching reference) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">10,000+</p>
                  <p className="text-[11px] font-bold text-slate-600 mt-0.5">প্রোডাক্ট</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">5,000+</p>
                  <p className="text-[11px] font-bold text-slate-600 mt-0.5">রিসেলার</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">500+</p>
                  <p className="text-[11px] font-bold text-slate-600 mt-0.5">সাপ্লায়ার</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">99%</p>
                  <p className="text-[11px] font-bold text-slate-600 mt-0.5">সন্তুষ্ট গ্রাহক</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Soft Peach Gradient Card with Product Banner Graphic */}
          <div className="lg:col-span-5 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`slide-img-${current}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100/80 via-orange-50 to-amber-50 p-6 sm:p-8 border border-amber-200/60 shadow-lg min-h-[380px] flex flex-col justify-between"
              >
                <div className="space-y-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-black text-amber-800 shadow-2xs">
                    {slide.offerBadge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {slide.cardTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 font-bold">
                    {slide.cardSubtitle}
                  </p>
                  <div className="pt-1">
                    <Link href={slide.cardCtaHref}>
                      <Button size="sm" className="h-9 px-4 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs">
                        {slide.cardCtaText} →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Hero Product Graphics Container */}
                <div className="relative w-full h-44 sm:h-52 my-2 rounded-2xl overflow-hidden">
                  <Image
                    src={slide.bannerImage}
                    alt={slide.cardTitle}
                    fill
                    priority
                    className="object-cover rounded-2xl"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />
                </div>

                {/* Slider Dots Indicator */}
                <div className="flex items-center justify-center gap-2 pt-2 relative z-10">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCurrent(i);
                        setAutoPlay(false);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        i === current ? "w-6 bg-amber-500" : "w-2 bg-amber-300 hover:bg-amber-400"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
