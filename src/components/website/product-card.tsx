"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, ArrowLeftRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

export interface ProductCardProps {
  product: PublicProductCard;
  className?: string;
  viewMode?: "grid" | "compact" | "list";
  /** Preload hint for above-the-fold cards (first row of a grid). */
  priority?: boolean;
  onQuickView?: (product: PublicProductCard) => void;
  onCompare?: (product: PublicProductCard) => void;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function CardPrice({ product, large }: { product: PublicProductCard; large?: boolean }) {
  if (product.price <= 0) {
    // No configured price is shown honestly — never an invented number.
    return <span className="text-xs font-bold text-slate-500">দামের জন্য যোগাযোগ করুন</span>;
  }
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={cn(
          "font-black text-slate-900 tabular-nums",
          large ? "text-base sm:text-lg" : "text-sm sm:text-base",
        )}
      >
        {formatBdt(product.price)}
      </span>
      {product.comparePrice !== undefined && (
        <span className="text-xs font-bold line-through text-slate-400 tabular-nums">
          {formatBdt(product.comparePrice)}
        </span>
      )}
    </div>
  );
}

function CardBadges({ product }: { product: PublicProductCard }) {
  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
      {product.isNew && (
        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
          নতুন
        </span>
      )}
      {product.isFlashSale && (
        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
          সেল
        </span>
      )}
      {product.discountPercent !== undefined && (
        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-2xs">
          -{product.discountPercent}%
        </span>
      )}
    </div>
  );
}

function StockChip({
  status,
  subtle,
}: {
  status: PublicProductCard["stockStatus"];
  subtle?: boolean;
}) {
  if (status === "out_of_stock") {
    return (
      <span className="text-[11px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
        স্টক শেষ
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="text-[11px] font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
        সীমিত স্টক
      </span>
    );
  }
  if (subtle) return null;
  return (
    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
      স্টকে আছে
    </span>
  );
}

function CardImage({
  product,
  sizes,
  priority,
}: {
  product: PublicProductCard;
  sizes: string;
  priority?: boolean;
}) {
  const [primaryError, setPrimaryError] = useState(false);
  const src = primaryError || !product.image ? PRODUCT_IMAGE_PLACEHOLDER : product.image;
  const showHover = !primaryError && Boolean(product.hoverImage);

  return (
    <>
      <Image
        src={src}
        alt={product.name}
        fill
        priority={priority}
        onError={() => setPrimaryError(true)}
        className={cn(
          "object-cover transition-all duration-300 group-hover:scale-105",
          showHover && "group-hover:opacity-0",
        )}
        sizes={sizes}
      />
      {showHover && (
        <Image
          src={product.hoverImage!}
          alt=""
          aria-hidden
          fill
          className="object-cover opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
          sizes={sizes}
        />
      )}
    </>
  );
}

export function ProductCard({
  product,
  className,
  viewMode = "grid",
  priority,
  onQuickView,
  onCompare,
}: ProductCardProps) {
  // Wishlist is a visual placeholder until the wishlist engine ships in a later phase.
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productUrl = `/product/${product.slug}`;
  const outOfStock = product.stockStatus === "out_of_stock";

  if (viewMode === "list") {
    return (
      <article
        className={cn(
          "group relative rounded-2xl border border-slate-300 bg-white p-4 transition-shadow duration-200 hover:shadow-lg hover:border-amber-400 flex flex-col sm:flex-row gap-5 items-center",
          className,
        )}
      >
        <div className="relative w-full sm:w-48 aspect-square rounded-xl bg-slate-100 overflow-hidden shrink-0">
          <CardImage
            product={product}
            sizes="(max-width: 640px) 100vw, 200px"
            priority={priority}
          />
          <CardBadges product={product} />
        </div>

        <div className="flex-1 space-y-2.5 w-full">
          <div className="flex items-center justify-between gap-2">
            {product.brandName ? (
              <Link
                href={product.brandSlug ? `/brands/${product.brandSlug}` : productUrl}
                className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                {product.brandName}
              </Link>
            ) : (
              <span />
            )}
            <StockChip status={product.stockStatus} />
          </div>

          <Link
            href={productUrl}
            className="block focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
          >
            <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.categoryName && (
            <p className="text-xs font-bold text-slate-600">{product.categoryName}</p>
          )}

          <CardPrice product={product} large />
        </div>

        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <Link
            href={productUrl}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            {outOfStock ? "বিস্তারিত দেখুন" : "অর্ডার করুন"}
          </Link>

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="p-2.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-amber-50 hover:border-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
              aria-label={`কুইক ভিউ: ${product.name}`}
            >
              <Eye className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-slate-300 bg-white overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:border-amber-400 flex flex-col justify-between",
        viewMode === "compact" ? "p-2.5" : "",
        className,
      )}
    >
      <div>
        <div className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden">
          <CardImage
            product={product}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            priority={priority}
          />

          <CardBadges product={product} />

          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 z-10">
            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-pressed={isWishlisted}
              aria-label={
                isWishlisted
                  ? `উইশলিস্ট থেকে সরান: ${product.name}`
                  : `উইশলিস্টে যোগ করুন: ${product.name}`
              }
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border shadow-xs transition-all backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-amber-500",
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white/90 border-slate-300 text-slate-800 hover:text-red-600 hover:bg-white",
              )}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-600")} aria-hidden />
            </button>

            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                aria-label={`কুইক ভিউ: ${product.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-slate-300 text-slate-800 hover:text-amber-600 hover:bg-white transition-all shadow-xs backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <Eye className="h-4 w-4" aria-hidden />
              </button>
            )}

            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(product)}
                aria-label={`তুলনা করুন: ${product.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-slate-300 text-slate-800 hover:text-amber-600 hover:bg-white transition-all shadow-xs backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="text-xs font-black uppercase tracking-wider text-red-700 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                স্টক শেষ
              </span>
            </div>
          )}
        </div>

        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-1">
            {product.brandName ? (
              <Link
                href={product.brandSlug ? `/brands/${product.brandSlug}` : productUrl}
                className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                {product.brandName}
              </Link>
            ) : (
              <span />
            )}
            <StockChip status={product.stockStatus} subtle />
          </div>

          <Link
            href={productUrl}
            className="block focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
          >
            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <CardPrice product={product} />
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pt-1">
        <Link
          href={productUrl}
          className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-extrabold transition-all duration-150 bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-600 hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
          {outOfStock ? "বিস্তারিত দেখুন" : "অর্ডার করুন"}
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
