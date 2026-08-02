"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Zap, Truck, RotateCcw, Award, Banknote, ShoppingCart, Store, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSlide {
  id: number;
  badge: string;
  cardTitle: string;
  cardSubtitle: string;
  cardCtaText: string;
  cardCtaHref: string;
  bannerImage: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "অনলাইন শপ",
    cardTitle: "আপনার পছন্দের সেরা প্রোডাক্টস",
    cardSubtitle: "স্মার্ট গ্যাজেট, ইয়ারফোন ও লাইফস্টাইল প্রোডাক্টস সরাসরি আপনার দোরগোড়ায়।",
    cardCtaText: "এখনই শপ করুন",
    cardCtaHref: "/products",
    bannerImage:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    badge: "রিসেলার প্রোগ্রাম",
    cardTitle: "স্টক ছাড়াই ব্যবসা শুরু করুন",
    cardSubtitle: "প্রোডাক্ট সোর্সিং ও ডেলিভারি সম্পূর্ণ ডিজিটাল সিস্টেমে অটোমেটেড।",
    cardCtaText: "রিসেলিং শুরু করুন",
    cardCtaHref: "/become-reseller",
    bannerImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    badge: "হোলসেল সাপ্লাই",
    cardTitle: "বাল্ক অর্ডারে কারখানার সরাসরি রেট",
    cardSubtitle: "যাচাইকৃত সোর্স ও সরাসরি ইম্পোর্টার থেকে নিশ্চিন্তে সোর্সিং।",
    cardCtaText: "পাইকারি দাম দেখুন",
    cardCtaHref: "/become-wholesale-partner",
    bannerImage:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
  },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "১০০% অরিজিনাল প্রোডাক্ট" },
  { icon: Truck, label: "৬৪ জেলায় দ্রুত ডেলিভারি" },
  { icon: Banknote, label: "ক্যাশ অন ডেলিভারি" },
] as const;

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
    <section
      className="w-full pt-4 pb-8 lg:pt-8 lg:pb-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800"
      aria-label="Hero Section"
    >
      {/* Soft geometric background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center min-h-[420px] sm:min-h-[480px]">
          {/* Left Column — Customer First Headline, CTAs, Trust Pills */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs font-black text-amber-800 dark:text-amber-300 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" aria-hidden />
              <span>বাংলাদেশের নির্ভরযোগ্য শপিং ও কমার্স প্ল্যাটফর্ম</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15]">
              সোর্স করুন, কিনুন, <br />
              ব্যবসা বাড়ান <span className="text-amber-500">NN Enterprise</span> এর সাথে
            </h1>

            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed max-w-xl">
              সেরা দামে অরিজিনাল গ্যাজেট ও লাইফস্টাইল প্রোডাক্ট শপ করুন। একই সাথে রিসেলার ও হোলসেল পার্টনারদের জন্য স্পেশাল বিজনেস সুবিধা!
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                <span>প্রিমিয়াম কোয়ালিটি</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <Truck className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                <span>ফাস্ট ডেলিভারি</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <RotateCcw className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                <span>সহজ রিটার্ন</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <Award className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                <span>অরিজিনাল ওয়ারেন্টি</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link href="/products">
                <Button
                  size="lg"
                  className="h-11 sm:h-12 px-6 sm:px-7 text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-[0.98] rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" aria-hidden />
                  এখনই শপ করুন
                  <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden />
                </Button>
              </Link>
              <Link href="/become-reseller">
                <Button
                  size="lg"
                  className="h-11 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-black bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 shadow-md rounded-xl"
                >
                  <Store className="h-4 w-4 mr-1.5 text-amber-400 dark:text-amber-600" aria-hidden />
                  রিসেলার হন
                </Button>
              </Link>
              <Link href="/become-wholesale-partner">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-black border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <Building2 className="h-4 w-4 mr-1.5 text-slate-500" aria-hidden />
                  হোলসেলার হন
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 max-w-xl">
              {TRUST_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.label} className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">{point.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column — Slide card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100/80 dark:from-slate-900 via-orange-50 dark:via-slate-900/90 to-amber-50 dark:to-slate-900 p-5 sm:p-7 border border-amber-200/60 dark:border-slate-800 shadow-xl min-h-[320px] sm:min-h-[360px] flex flex-col justify-between">
              <div className="space-y-2.5 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-xs font-black text-amber-800 dark:text-amber-300 shadow-2xs">
                  {slide.badge}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  {slide.cardTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold">{slide.cardSubtitle}</p>
                <div className="pt-1">
                  <Link href={slide.cardCtaHref}>
                    <Button
                      size="sm"
                      className="h-9 px-4 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs rounded-xl"
                    >
                      {slide.cardCtaText}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative w-full h-44 sm:h-52 my-2 rounded-2xl overflow-hidden border border-amber-200/50 dark:border-slate-800">
                <Image
                  src={slide.bannerImage}
                  alt={slide.cardTitle}
                  fill
                  priority={current === 0}
                  fetchPriority={current === 0 ? "high" : "auto"}
                  className="object-cover rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />
              </div>

              {/* Slide dots */}
              <div className="flex items-center justify-center gap-2 pt-2 relative z-10">
                {HERO_SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setCurrent(i);
                      setAutoPlay(false);
                    }}
                    className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                      i === current ? "w-6 bg-amber-500" : "w-2 bg-amber-300 hover:bg-amber-400"
                    }`}
                    aria-label={`স্লাইড ${i + 1} দেখুন`}
                    aria-current={i === current}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
