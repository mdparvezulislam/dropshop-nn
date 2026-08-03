"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Sparkles, PhoneCall } from "lucide-react";
import Link from "next/link";

const ANNOUNCEMENTS = [
  {
    id: "free-shipping",
    icon: Truck,
    text: "২,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি!",
    ctaText: "এখনই শপ করুন",
    href: "/products",
    badge: "ফ্রি ডেলিভারি",
  },
  {
    id: "reseller-offer",
    icon: Sparkles,
    text: "স্টক ছাড়াই ই-কমার্স ব্যবসা শুরু করুন — রিসেলারদের জন্য স্পেশাল পাইকারি রেট!",
    ctaText: "রিসেলার হন",
    href: "/become-reseller",
    badge: "রিসেলার অফার",
  },
  {
    id: "support-hotline",
    icon: PhoneCall,
    text: "যেকোনো সহায়তায় কল করুন: 01700-000000 (সকাল ৯টা - রাত ১০টা)",
    ctaText: "যোগাযোগ",
    href: "/contact",
    badge: "হটলাইন",
  },
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [visible, nextSlide]);

  if (!visible) return null;

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative bg-slate-900 text-slate-100 text-xs border-b border-amber-500/20 z-50 overflow-hidden shadow-2xs"
        >
          <div className="mx-auto max-w-(--content-max) px-4 py-2 pr-10 flex items-center justify-center min-h-[36px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-center text-xs sm:text-sm font-medium tracking-tight truncate max-w-full"
              >
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[11px] font-bold shrink-0 border border-amber-500/30">
                  {current.badge}
                </span>

                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />

                <span className="truncate text-slate-200">{current.text}</span>

                <Link
                  href={current.href}
                  className="inline-flex items-center text-amber-400 font-bold hover:underline shrink-0 ml-1 bg-amber-400/10 px-2 py-0.5 rounded text-xs hover:bg-amber-400/20 transition-colors"
                >
                  {current.ctaText} →
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="অ্যানাউন্সমেন্ট বন্ধ করুন"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementBar;
