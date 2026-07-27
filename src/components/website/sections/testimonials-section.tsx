"use client";

import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "মোহাব্বাত চৌধুরী",
    role: "রিসেলার, ঢাকা",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    content:
      "DropshopNN এর সাথে কাজ করে আমি খুবই সন্তুষ্ট। প্রোডাক্ট কোয়ালিটি এবং ডেলিভারি সার্ভিস অসাধারণ!",
  },
  {
    name: "ফারিয়া আক্তার",
    role: "এন্টারপ্রেনার, চট্টগ্রাম",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    content: "বাল্ক অর্ডারে সেরা দাম এবং ফাস্ট ডেলিভারি পাই। আমার ব্যবসা অনেক সহজে চলছে।",
  },
  {
    name: "মাহমুদুল হাসান রেজওয়ান",
    role: "ড্রপশিপার, সিলেট",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    content: "স্টক ছাড়াই ব্যবসা শুরু করেছি। DropshopNN আমার জন্য গেম চেঞ্জার!",
  },
];

export function TestimonialsSection(): React.ReactElement {
  return (
    <section
      className="py-8 sm:py-12 lg:py-16 bg-white border-b border-slate-200"
      aria-label="Client Testimonials"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              আমাদের ক্লায়েন্টদের মতামত
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">তাদের অভিজ্ঞতা জানুন</p>
          </div>

          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-slate-300 hover:border-amber-400 hover:shadow-md transition-all duration-300 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-amber-200">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{t.name}</h3>
                  <p className="text-[11px] font-bold text-slate-600">{t.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-bold">
                &ldquo;{t.content}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
