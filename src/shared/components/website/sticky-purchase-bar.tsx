"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";

interface StickyPurchaseBarProps {
  name: string;
  price: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  currency?: string;
}

export function StickyPurchaseBar({
  name,
  price,
  stockStatus = "in_stock",
}: StickyPurchaseBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const productEnd = document.querySelector("[data-purchase-end]");
      if (!productEnd) return;
      const rect = productEnd.getBoundingClientRect();
      setVisible(rect.bottom < 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl shadow-lg"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-sm font-semibold text-primary">{price}</p>
        </div>

        {stockStatus !== "out_of_stock" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-5 hover:bg-primary/90 transition-colors active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <button
              type="button"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-foreground text-background text-sm font-semibold px-5 hover:bg-foreground/90 transition-colors active:scale-[0.98]"
            >
              <Zap className="h-4 w-4" />
              Buy Now
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center h-10 rounded-lg bg-muted text-foreground/50 text-sm font-semibold px-5 cursor-not-allowed"
            disabled
          >
            Out of Stock
          </button>
        )}
      </div>
    </motion.div>
  );
}
