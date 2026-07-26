"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative bg-[#111827] text-white text-xs font-semibold overflow-hidden border-b border-white/10"
        >
          <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-center text-xs text-slate-200">
            <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              ২,০০০ টাকা এর বেশি অর্ডারে ফ্রি ডেলিভারি —{" "}
              <Link href="/products" className="text-amber-400 font-bold hover:underline ml-1">
                এখনই শপিং করুন
              </Link>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementBar;
