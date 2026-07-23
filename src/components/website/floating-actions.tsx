"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageSquare, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Floating Cart Quick Link */}
      <Link
        href="/cart"
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all active:scale-95 group"
        aria-label="View Shopping Cart"
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Cart</span>
      </Link>

      {/* WhatsApp Hotline */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
        aria-label="Contact on WhatsApp"
        title="WhatsApp Support"
      >
        <MessageSquare className="h-5 w-5" />
      </a>

      {/* Phone Hotline */}
      <a
        href="tel:+8801700000000"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
        aria-label="Call Hotline"
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-border/80 text-foreground shadow-md hover:shadow-lg hover:bg-accent transition-all active:scale-95"
            aria-label="Back to top"
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
