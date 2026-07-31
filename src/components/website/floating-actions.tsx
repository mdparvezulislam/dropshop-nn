"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageSquare } from "lucide-react";

export function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isStickyPage = pathname?.startsWith("/checkout") || pathname?.startsWith("/cart");

  return (
    <div
      className={`fixed ${
        isStickyPage ? "bottom-28" : "bottom-20"
      } md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto transition-all duration-300`}
    >
      {/* WhatsApp Hotline */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 touch-manipulation"
        aria-label="WhatsApp সাপোর্ট"
        title="WhatsApp Support"
      >
        <MessageSquare className="h-5 w-5" />
      </a>

      {/* Phone Hotline */}
      <a
        href="tel:+8801700000000"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 touch-manipulation"
        aria-label="ফোন হটলাইন"
        title="24/7 Phone Support"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* Back To Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-800 shadow-md hover:shadow-lg hover:bg-slate-100 transition-all active:scale-95 touch-manipulation"
            aria-label="উপরে যান"
            title="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FloatingActions;
