"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageSquare } from "lucide-react";

function WhatsAppBrandIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

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
        isStickyPage ? "bottom-28" : "bottom-20 md:bottom-8"
      } right-4 sm:right-6 z-45 flex flex-col items-end gap-2.5 pointer-events-auto transition-all duration-300`}
    >
      {/* Direct WhatsApp Support Floating Button */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:shadow-xl hover:bg-emerald-600 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation border border-white/20"
        aria-label="WhatsApp সাপোর্ট"
        title="WhatsApp Support"
      >
        <WhatsAppBrandIcon className="h-6 w-6" />
      </a>

      {/* 24/7 Phone Hotline */}
      <a
        href="tel:+8801700000000"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-800 shadow-md hover:shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 touch-manipulation border border-slate-700"
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-md hover:shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 touch-manipulation"
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
