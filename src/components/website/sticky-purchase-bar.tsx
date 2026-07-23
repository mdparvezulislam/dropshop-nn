"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Zap, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

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
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    toast.success(`'${name}' কার্টে যোগ করা হয়েছে (${qty} টি)!`);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-white/95 backdrop-blur-xl shadow-2xl py-2"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-900 truncate">{name}</p>
          <p className="text-sm font-black text-amber-600 tabular-nums">{price}</p>
        </div>

        {stockStatus !== "out_of_stock" ? (
          <div className="flex items-center gap-2 shrink-0">
            {/* Quantity Selector on Mobile Bar */}
            <div className="hidden sm:flex items-center border border-border/80 rounded-xl bg-white">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-1.5 text-foreground hover:bg-muted rounded-l-xl"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-xs font-extrabold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="p-1.5 text-foreground hover:bg-muted rounded-r-xl"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              অর্ডার করুন
            </button>

            <Link href="/checkout" className="shrink-0">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                কিনুন
              </button>
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center h-10 rounded-xl bg-slate-200 text-slate-500 text-xs font-extrabold px-4 cursor-not-allowed"
            disabled
          >
            স্টক আউট
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default StickyPurchaseBar;
