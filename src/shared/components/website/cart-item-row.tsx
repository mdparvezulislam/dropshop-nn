"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, Heart } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PriceDisplay } from "@/shared/components/website/price-display";

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

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.index), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? 20 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted shrink-0 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
        />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <a
              href={`/product/${item.slug}`}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {item.name}
            </a>
            {item.variant && (
              <p className="text-xs text-foreground/40 mt-0.5">{item.variant}</p>
            )}
            {item.sku && (
              <p className="text-[11px] text-foreground/30 font-mono mt-0.5">SKU: {item.sku}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center border border-border/60 rounded-lg">
            <button
              type="button"
              onClick={() => onQuantityChange(item.index, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.index, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

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
            <p className="text-[11px] text-foreground/40 mt-0.5">
              Subtotal: {item.currency === "BDT" ? "৳" : "$"}
              {(item.resolvedPrice * item.quantity).toLocaleString("en-BD")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
