"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/config/brand";

/**
 * DEV NOTE FOR PRODUCTION:
 * Replace these Unsplash placeholder avatars with authentic uploaded customer photos 
 * from the Review/Feedback DB model when available.
 */
const TESTIMONIALS = [
  {
    id: "testi-1",
    name: "মোসাব্বির হোসেন",
    role: "অনলাইন শপার ও সক্রিয় রিসেলার, ঢাকা",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    content:
      `${BRAND.publicName} এর সাথে কাজ করে আমি খুবই সন্তুষ্ট। প্রোডাক্ট কোয়ালিটি এবং ডেলিভারি সার্ভিস অসাধারণ!`,
  },
  {
    id: "testi-2",
    name: "ফারিয়া আক্তার",
    role: "ই-কমার্স এন্টারপ্রেনার, চট্টগ্রাম",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    content: "বাল্ক অর্ডারে সেরা পাইকারি দাম এবং ফাস্ট ডেলিভারি পাই। আমার কাস্টমাররা প্রোডাক্ট কোয়ালিটি নিয়ে খুবই হ্যাপি।",
  },
  {
    id: "testi-3",
    name: "মাহমুদুল হাসান রেজওয়ান",
    role: "বাল্ক সোর্সিং পার্টনার, সিলেট",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    content: `সরাসরি ইম্পোর্টার রেটে সোর্সিং সুবিধা পেয়েছি। ${BRAND.publicName} আমার ব্যবসাকে দ্রুত বড় করতে সাহায্য করেছে!`,
  },
];

export function TestimonialsSection(): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-label="Customer Reviews"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              কাস্টমার ফিডব্যাক
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              আমাদের কাস্টমারদের সত্য অনুভূতি
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              হাজারো সন্তুষ্ট শপার ও রিসেলারের রিয়েল রিভিউ
            </p>
          </div>

          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded shrink-0"
          >
            সব রিভিউ দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {/* Mobile Swipeable Carousel (1 card at a time with snap) | Desktop 3 Column Grid */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth ws-scroll pb-4 -mx-3 px-3 sm:mx-0 sm:px-0"
          onScroll={(e) => {
            const target = e.currentTarget;
            const index = Math.round(target.scrollLeft / target.clientWidth);
            if (index >= 0 && index < TESTIMONIALS.length) setActiveIndex(index);
          }}
        >
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="shrink-0 w-full sm:w-auto snap-center p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all duration-300 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-amber-400 dark:border-amber-500/60 shadow-xs">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{t.name}</h3>
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{t.role}</p>
                  </div>
                </div>

                {/* 5-Star Visual Rating Badge */}
                <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" aria-hidden />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold italic">
                &ldquo;{t.content}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile Dot Indicator */}
        <div className="flex sm:hidden justify-center items-center gap-1.5 mt-2">
          {TESTIMONIALS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-6 bg-amber-500" : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default TestimonialsSection;
