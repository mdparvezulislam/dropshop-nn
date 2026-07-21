"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Heart,
  Package,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PriceDisplay } from "@/shared/components/website/price-display";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAnalytics } from "@/shared/hooks/use-analytics";
import { ANALYTICS_EVENT_NAMES } from "@/features/analytics/domain/analytics-entity";

interface Variant {
  type: string;
  value: string;
  available: boolean;
}

interface ProductPagePanelProps {
  productId?: string;
  name: string;
  brand?: string;
  brandSlug?: string;
  sku: string;
  category?: string;
  retailPrice: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  currency?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  moq?: number;
  rating?: number;
  reviewCount?: number;
  marketingKit?: boolean;
  isNew?: boolean;
  isFlashSale?: boolean;
  variants?: {
    name: string;
    options: Variant[];
  }[];
}

export function ProductPagePanel({
  productId,
  name,
  brand,
  sku,
  retailPrice,
  resellerPrice,
  wholesalePrice,
  costPrice,
  comparePrice,
  currency = "BDT",
  stockStatus = "in_stock",
  moq,
  rating,
  reviewCount,
  marketingKit,
  isNew,
  isFlashSale,
  variants,
}: ProductPagePanelProps) {
  const { userRole } = usePermissions();
  const { track } = useAnalytics();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const isOutOfStock = stockStatus === "out_of_stock";
  const isLowStock = stockStatus === "low_stock";
  const isWholesaler = userRole === "wholesaler";
  const isReseller = userRole === "reseller";

  const effectiveMoq = isWholesaler ? (moq ?? 1) : 1;
  const qty = Math.max(quantity, effectiveMoq);

  useEffect(() => {
    track(ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED, {
      module: "catalog",
      entityType: "product",
      entityId: productId || sku,
      value: retailPrice,
      currency,
      metadata: { name, sku, brand: brand ?? "", category: "" },
    });
  }, [productId, sku, name, brand, retailPrice, currency, track]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {isNew && (
          <span className="inline-block px-2 py-0.5 rounded-md bg-info/10 text-info border border-info/20 text-[10px] font-semibold uppercase tracking-wider">
            New Arrival
          </span>
        )}
        {isFlashSale && (
          <span className="inline-block px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-semibold uppercase tracking-wider ml-2">
            Flash Sale
          </span>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {name}
        </h1>

        {brand && (
          <p className="text-sm text-foreground/50">
            by{" "}
            <span className="text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer">
              {brand}
            </span>
          </p>
        )}

        {rating != null && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(rating)
                      ? "text-amber-500 fill-amber-500"
                      : "text-foreground/20 fill-foreground/20",
                  )}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviewCount != null && (
              <span className="text-foreground/40">({reviewCount} reviews)</span>
            )}
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card">
        <PriceDisplay
          retailPrice={retailPrice}
          resellerPrice={resellerPrice}
          wholesalePrice={wholesalePrice}
          costPrice={costPrice}
          comparePrice={comparePrice}
          currency={currency}
          showLabel
          className="text-base"
        />
      </div>

      {variants && variants.length > 0 && (
        <div className="space-y-4">
          {variants.map((group) => (
            <div key={group.name}>
              <p className="text-sm font-medium text-foreground mb-2">
                {group.name}
                {selectedVariants[group.name] && (
                  <span className="text-foreground/50 font-normal ml-1">
                    : {selectedVariants[group.name]}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const isSelected = selectedVariants[group.name] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!opt.available}
                      onClick={() =>
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [group.name]: opt.value,
                        }))
                      }
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                        !opt.available && "opacity-30 cursor-not-allowed line-through",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-foreground/60 hover:border-border hover:text-foreground",
                      )}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-border/60 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(effectiveMoq, qty - 1))}
            disabled={qty <= effectiveMoq}
            className="flex h-10 w-10 items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="flex h-10 w-12 items-center justify-center text-sm font-semibold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(qty + 1)}
            className="flex h-10 w-10 items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {isWholesaler && moq && (
          <p className="text-xs text-foreground/50">
            MOQ: {moq} pcs
          </p>
        )}
      </div>

      {stockStatus && (
        <div className="flex items-center gap-2 text-sm">
          {isOutOfStock ? (
            <span className="text-destructive font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-warning font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              Only few left
            </span>
          ) : (
            <span className="text-success font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              In Stock
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={isOutOfStock}
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? "Notify Me" : "Add to Cart"}
        </button>

        {!isOutOfStock && (
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-foreground text-background font-semibold px-6 hover:bg-foreground/90 transition-all active:scale-[0.98]"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        )}

        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 text-foreground/50 hover:text-foreground hover:bg-muted/60 hover:border-border transition-all shrink-0"
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {(isReseller || userRole === "admin") && marketingKit && (
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
        >
          <Package className="h-4 w-4" />
          Marketing Kit
        </button>
      )}

      <div className="pt-4 border-t border-border/40">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-foreground/40">SKU</dt>
          <dd className="text-foreground/70 text-right font-mono text-xs">{sku}</dd>
        </dl>
      </div>
    </div>
  );
}
