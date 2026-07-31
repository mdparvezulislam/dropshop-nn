"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, Bookmark } from "lucide-react";
import { StockChip } from "@/shared/components/mobile/stock-chip";
import { PriceDisplay } from "@/components/website/price-display";

export interface CartItemData {
  index: number;
  productId: string;
  name: string;
  slug: string;
  image: string;
  variant?: string;
  sku?: string;
  quantity: number;
  resolvedPrice: number;
  retailPrice: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  currency?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  profitPreview?: { costBasis: number; profitAmount: number; profitMargin: number };
}

interface CartItemRowProps {
  item: CartItemData;
  onQuantityChange: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
}

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const [removing, setRemoving] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.index), 250);
  };

  const itemStockStatus = item.stockStatus ?? "in_stock";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? -30 : 0, scale: removing ? 0.95 : 1 }}
      transition={{ duration: 0.2 }}
      className="relative flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
    >
      {/* 1:1 Square Product Image */}
      <Link
        href={`/product/${item.slug}`}
        className="relative aspect-square w-20 sm:w-24 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden block focus-visible:outline-2 focus-visible:outline-amber-500 active:scale-95 transition-transform"
        aria-label={item.name}
      >
        <div
          className="w-full h-full bg-cover bg-center transition-transform hover:scale-105"
          style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
        />
      </Link>

      {/* Item Information */}
      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/product/${item.slug}`}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2 leading-snug"
            >
              {item.name}
            </Link>

            {/* Remove Action Button */}
            <button
              type="button"
              onClick={handleRemove}
              className="touch-target h-8 w-8 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 active:scale-90"
              aria-label={`কার্ট থেকে ${item.name} মুছে ফেলুন`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Variant & Stock Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {item.variant && (
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {item.variant}
              </span>
            )}
            <StockChip status={itemStockStatus} />
          </div>
        </div>

        {/* Quantity Controls & Price Display */}
        <div className="flex flex-wrap items-end justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {/* 40px Touch Target Quantity Controls */}
          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-0.5">
            <button
              type="button"
              onClick={() => onQuantityChange(item.index, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-9 w-9 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-950 transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-90 touch-manipulation"
              aria-label="পরিমাণ কমান"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden />
            </button>

            <span className="flex h-9 w-9 min-w-[36px] items-center justify-center text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onQuantityChange(item.index, item.quantity + 1)}
              className="h-9 w-9 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-950 transition-all active:scale-90 touch-manipulation"
              aria-label="পরিমাণ বাড়ান"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          {/* Pricing & Subtotal */}
          <div className="text-right">
            <PriceDisplay
              retailPrice={item.resolvedPrice}
              resellerPrice={item.resellerPrice}
              wholesalePrice={item.wholesalePrice}
              costPrice={item.costPrice}
              comparePrice={item.comparePrice}
              currency={item.currency}
              showLabel={false}
            />
            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">
              সাবটোটাল: ৳{(item.resolvedPrice * item.quantity).toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        {/* Save for later future-ready toggle */}
        <div className="flex items-center justify-end pt-0.5">
          <button
            type="button"
            onClick={() => setSavedForLater(!savedForLater)}
            className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
              savedForLater
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Bookmark className={`h-3 w-3 ${savedForLater ? "fill-amber-500" : ""}`} aria-hidden />
            <span>{savedForLater ? "পরে কেনার জন্য সংরক্ষিত" : "পরে কিনবো (Save for later)"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default CartItemRow;
