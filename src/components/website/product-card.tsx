"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Eye, ArrowLeftRight, Star, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PriceDisplay } from "./price-display";
import { usePermissions } from "@/hooks/use-permissions";

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
  viewMode?: "grid" | "compact" | "list";
  onQuickView?: (product: ProductCardData) => void;
  onCompare?: (product: ProductCardData) => void;
}

export function ProductCard({
  product,
  className,
  viewMode = "grid",
  onQuickView,
  onCompare,
}: ProductCardProps) {
  const { userRole } = usePermissions();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const comparePrice = product.comparePrice ?? 0;
  const hasDiscount = comparePrice > 0 && comparePrice > product.retailPrice;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - product.retailPrice) / comparePrice) * 100)
    : 0;

  const resellerProfit = product.resellerPrice && product.retailPrice > product.resellerPrice
    ? product.retailPrice - product.resellerPrice
    : 0;

  // Fallback image URL
  const displayImage = imageError || !product.image || product.image === "Product Image"
    ? "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80"
    : product.image;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          "group relative rounded-2xl border border-slate-300 bg-white p-4 transition-all duration-200 hover:shadow-lg hover:border-amber-400 flex flex-col sm:flex-row gap-5 items-center",
          className
        )}
      >
        <div className="relative w-full sm:w-48 aspect-square rounded-xl bg-slate-100 overflow-hidden shrink-0">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="200px"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNew && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                নতুন
              </span>
            )}
            {product.isFlashSale && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                সেল
              </span>
            )}
            {hasDiscount && discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2.5 w-full">
          <div className="flex items-center justify-between gap-2">
            {product.brand && (
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {product.brand}
              </span>
            )}
            {product.stockStatus === "in_stock" ? (
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                স্টকে আছে
              </span>
            ) : (
              <span className="text-[11px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                স্টক আউট
              </span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.rating != null && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.round(product.rating!)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-slate-800">{product.rating}</span>
              {product.reviewCount != null && (
                <span className="text-xs font-bold text-slate-600">({product.reviewCount} রিভিউ)</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <PriceDisplay
              retailPrice={product.retailPrice}
              resellerPrice={product.resellerPrice}
              wholesalePrice={product.wholesalePrice}
              comparePrice={product.comparePrice}
              showLabel={false}
            />
            {resellerProfit > 0 && (
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                মুনাফা: ৳{(resellerProfit > 10000 ? resellerProfit / 100 : resellerProfit).toFixed(0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            অর্ডার করুন
          </Link>

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="p-2.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-amber-50 hover:border-amber-400 transition-colors"
              title="Quick View"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative rounded-2xl border border-slate-300 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-amber-400 flex flex-col justify-between",
        viewMode === "compact" ? "p-2.5" : "",
        className
      )}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNew && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                নতুন
              </span>
            )}
            {product.isFlashSale && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs animate-pulse">
                সেল
              </span>
            )}
            {hasDiscount && discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-2xs">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick Action Icons Hover Stack */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border shadow-xs transition-all backdrop-blur-xs",
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white/90 border-slate-300 text-slate-800 hover:text-red-600 hover:bg-white"
              )}
              aria-label="Add to wishlist"
            >
              <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-red-600")} />
            </button>

            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-slate-300 text-slate-800 hover:text-amber-600 hover:bg-white transition-all shadow-xs backdrop-blur-xs"
                title="Quick View"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}

            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(product)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-slate-300 text-slate-800 hover:text-amber-600 hover:bg-white transition-all shadow-xs backdrop-blur-xs"
                title="Compare"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stock Overlay */}
          {product.stockStatus === "out_of_stock" && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="text-xs font-black uppercase tracking-wider text-red-600 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                স্টক শেষ
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-1">
            {product.brand && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {product.brand}
              </span>
            )}
            {userRole === "wholesaler" && product.moq && (
              <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                MOQ: {product.moq} pcs
              </span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
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
                        : "text-slate-300"
                    )}
                  />
                ))}
              </div>
              {product.reviewCount != null && (
                <span className="text-[10px] font-extrabold text-slate-600">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* BDT Price Display */}
          <PriceDisplay
            retailPrice={product.retailPrice}
            resellerPrice={product.resellerPrice}
            wholesalePrice={product.wholesalePrice}
            comparePrice={product.comparePrice}
            showLabel={false}
          />

          {/* Reseller Profit Margin Badge */}
          {resellerProfit > 0 && (
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span>প্রফিট মার্জিন: ৳{(resellerProfit > 10000 ? resellerProfit / 100 : resellerProfit).toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Button */}
      <div className="px-3.5 pb-3.5 pt-1">
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-extrabold transition-all duration-150 bg-amber-500 text-white shadow-xs hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {product.stockStatus === "out_of_stock" ? "স্টক রিকোয়েস্ট" : "অর্ডার করুন"}
        </Link>
      </div>
    </motion.div>
  );
}

export default ProductCard;
