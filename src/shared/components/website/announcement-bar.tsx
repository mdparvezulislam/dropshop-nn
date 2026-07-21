"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative bg-primary/10 border-b border-primary/20 overflow-hidden"
        >
          <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm text-primary-foreground/90">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-foreground/80">
              Free shipping on orders over ৳2,000 —{" "}
              <a href="/flash-sale" className="text-primary font-medium hover:underline">
                Shop now
              </a>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/70 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
