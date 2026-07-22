"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PriceDisplay } from "./price-display";
import { Badge } from "@/shared/components/ui/badge";
import { usePermissions } from "@/shared/hooks/use-permissions";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  image: string;
  retailPrice: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  moq?: number;
  isNew?: boolean;
  isFlashSale?: boolean;
}

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { userRole } = usePermissions();
  const comparePrice = product.comparePrice ?? 0;
  const hasDiscount = comparePrice > 0 && comparePrice > product.retailPrice;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - product.retailPrice) / comparePrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative rounded-xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between",
        className,
      )}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-muted/40 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs font-semibold uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">
            {product.image || "Product Image"}
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNew && (
              <Badge variant="default" size="xs" className="px-1.5 py-0.5">NEW</Badge>
            )}
            {product.isFlashSale && (
              <Badge variant="destructive" size="xs" className="px-1.5 py-0.5 animate-pulse">SALE</Badge>
            )}
            {hasDiscount && discountPercent > 0 && (
              <Badge variant="destructive" size="xs" className="px-1.5 py-0.5">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 border border-border/60 text-muted-foreground hover:text-primary hover:bg-card transition-all shadow-xs backdrop-blur-xs"
              aria-label="Add to wishlist"
            >
              <Heart className="h-3.5 w-3.5" />
            </button>
          </div>
          {product.stockStatus === "out_of_stock" && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-card/90 border border-border/60">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-3.5 space-y-2">
          {product.brand && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {product.brand}
            </p>
          )}
          <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.rating != null && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.round(product.rating!)
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/20",
                    )}
                  />
                ))}
              </div>
              {product.reviewCount != null && (
                <span className="text-[10px] font-medium text-muted-foreground">({product.reviewCount})</span>
              )}
            </div>
          )}

          <PriceDisplay
            retailPrice={product.retailPrice}
            resellerPrice={product.resellerPrice}
            wholesalePrice={product.wholesalePrice}
            costPrice={product.costPrice}
            comparePrice={product.comparePrice}
            showLabel={false}
          />

          {product.stockStatus === "low_stock" && (
            <p className="text-[10px] text-warning font-bold uppercase tracking-wider">Only few left in stock</p>
          )}

          {userRole === "wholesaler" && product.moq && (
            <p className="text-[10px] text-muted-foreground">MOQ: {product.moq} pcs</p>
          )}
        </div>
      </Link>

      <div className="px-3.5 pb-3.5 pt-1">
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center justify-center gap-2 w-full h-8.5 rounded-lg text-xs font-semibold transition-all duration-150 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          {product.stockStatus === "out_of_stock" ? "Notify Me" : "Add to Cart"}
        </Link>
      </div>
    </motion.div>
  );
}

export default ProductCard;
