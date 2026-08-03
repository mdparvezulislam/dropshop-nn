"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Heart, Eye, ArrowLeftRight, ShoppingBag, Zap, Bell, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CompactRating } from "@/components/website/reviews/rating-stars";
import { useWishlist } from "@/components/website/wishlist/wishlist-provider";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import { formatCurrency } from "@/lib/utils/currency-utils";
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

/** Clean up overly long SEO-keyword-heavy titles for card grid display */
function formatShortTitle(name: string): string {
  if (!name) return "";
  // If title has separators like '|' or ' - ', pick the main brand/product title prefix
  const parts = name.split(/\s+[|]\s+/);
  const mainPart = parts[0].trim();
  return mainPart.length > 55 ? mainPart.slice(0, 52) + "..." : mainPart;
}

function CardPrice({ product, large }: { product: PublicProductCard; large?: boolean }) {
  const { data: session } = useSession();
  const rawRole = (session?.user as { role?: string })?.role ?? "";
  const role = rawRole.toLowerCase().replace(/[\s-]+/g, "_");

  if (product.price <= 0) {
    return (
      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
        দামের জন্য যোগাযোগ করুন
      </span>
    );
  }

  // 1. Logged-in Reseller Price
  if (role === "reseller" && product.resellerPrice && product.resellerPrice > 0) {
    const profit = Math.max(0, product.price - product.resellerPrice);
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            আপনার রেট:
          </span>
          <span className={cn("font-black text-amber-600 dark:text-amber-400 tabular-nums", large ? "text-base sm:text-lg" : "text-sm sm:text-base")}>
            {formatCurrency(product.resellerPrice)}
          </span>
          <span className="text-xs font-bold line-through text-slate-400 tabular-nums">
            {formatCurrency(product.price)}
          </span>
        </div>
        {profit > 0 && (
          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
            ✨ আনুমানিক লাভ: {formatCurrency(profit)} / পিস
          </span>
        )}
      </div>
    );
  }

  // 2. Logged-in Wholesaler Price
  if (role === "wholesaler" && product.wholesalePrice && product.wholesalePrice > 0) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
            পাইকারি রেট:
          </span>
          <span className={cn("font-black text-blue-600 dark:text-blue-400 tabular-nums", large ? "text-base sm:text-lg" : "text-sm sm:text-base")}>
            {formatCurrency(product.wholesalePrice)}
          </span>
          <span className="text-xs font-bold line-through text-slate-400 tabular-nums">
            {formatCurrency(product.price)}
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
          📦 সর্বনিম্ন ৫ পিসে বিশেষ মূল্য ছাড়
        </span>
      </div>
    );
  }

  // 3. Guest / Regular Customer Price
  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span
        className={cn(
          "font-black text-slate-900 dark:text-slate-100 tabular-nums",
          large ? "text-base sm:text-lg" : "text-sm sm:text-base",
        )}
      >
        {formatCurrency(product.price)}
      </span>
      {product.comparePrice !== undefined && product.comparePrice > product.price && (
        <span className="text-xs font-bold line-through text-slate-400 dark:text-slate-500 tabular-nums">
          {formatCurrency(product.comparePrice)}
        </span>
      )}
    </div>
  );
}

function CardRating({
  product,
  countLabel,
}: {
  product: PublicProductCard;
  countLabel?: "full" | "bare";
}) {
  if (product.rating === undefined || !product.reviewCount) return null;
  return (
    <CompactRating
      average={product.rating}
      count={product.reviewCount}
      size="xs"
      countLabel={countLabel}
      className="text-[11px]"
    />
  );
}

function CardBadges({ product }: { product: PublicProductCard }) {
  const discount =
    product.discountPercent ??
    (product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : undefined);

  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
      {/* Combined Single Sleek Badge to avoid visual clutter */}
      {discount !== undefined && discount > 0 ? (
        <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-black tracking-tight shadow-md flex items-center gap-1">
          {product.isFlashSale && <Zap className="h-3 w-3 fill-amber-300 text-amber-300 shrink-0" />}
          <span>-{discount}% ছাড়</span>
        </span>
      ) : product.isFlashSale ? (
        <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
          ⚡ ফ্ল্যাশ সেল
        </span>
      ) : product.isNew ? (
        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
          নতুন
        </span>
      ) : null}
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
      <span className="text-[10px] font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
        স্টক শেষ
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
        সীমিত স্টক
      </span>
    );
  }
  if (subtle) return null;
  return (
    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
      স্টকে আছে
    </span>
  );
}

function FallbackProductIllustration() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-400 p-4">
      <Package className="h-9 w-9 mb-1 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
      <span className="text-[9px] font-bold tracking-wider text-slate-400 text-center uppercase">
        NN Enterprise
      </span>
    </div>
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
  const isOutOfStock = product.stockStatus === "out_of_stock";

  if (primaryError || !product.image) {
    return <FallbackProductIllustration />;
  }

  const showHover = !primaryError && Boolean(product.hoverImage);

  return (
    <>
      <Image
        src={product.image}
        alt={product.name}
        fill
        priority={priority}
        onError={() => setPrimaryError(true)}
        className={cn(
          "object-cover transition-all duration-300 group-hover:scale-105",
          isOutOfStock && "grayscale opacity-60",
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
          className={cn(
            "object-cover opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105",
            isOutOfStock && "grayscale opacity-60",
          )}
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
  const wishlist = useWishlist();
  const cart = useLocalCart();
  const router = useRouter();
  const isWishlisted = wishlist.has(product.id);
  const productUrl = `/product/${product.slug}`;
  const outOfStock = product.stockStatus === "out_of_stock";
  const displayTitle = formatShortTitle(product.name);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (outOfStock) {
      toast.info("পণ্যটি বর্তমানে স্টকে নেই। স্টক এলে নোটিফিকেশন পাবেন!");
      return;
    }
    cart.addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image ?? "",
        unitPrice: product.price,
      },
      1,
    );
    toast.success("প্রোডাক্ট কার্টে যোগ করা হয়েছে!", {
      action: {
        label: "কার্ট দেখুন",
        onClick: () => router.push("/cart"),
      },
    });
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (outOfStock) {
      router.push(productUrl);
      return;
    }
    cart.addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image ?? "",
        unitPrice: product.price,
      },
      1,
    );
    router.push("/checkout");
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await wishlist.toggle(product.id);
    if (res.status === "unauthenticated") {
      toast.error("উইশলিস্টে যোগ করতে লগইন করুন");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    } else if (res.status === "added") {
      toast.success("উইশলিস্টে যোগ করা হয়েছে");
    } else if (res.status === "removed") {
      toast.info("উইশলিস্ট থেকে সরানো হয়েছে");
    } else if (res.status === "error") {
      toast.error(res.error || "উইশলিস্ট আপডেট ব্যর্থ হয়েছে");
    }
  };

  if (viewMode === "list") {
    return (
      <article
        className={cn(
          "group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-500 flex flex-col sm:flex-row gap-5 items-center",
          className,
        )}
      >
        <Link
          href={productUrl}
          className="relative w-full sm:w-48 aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 block focus-visible:outline-2 focus-visible:outline-amber-500"
          aria-label={product.name}
        >
          <CardImage
            product={product}
            sizes="(max-width: 640px) 100vw, 200px"
            priority={priority}
          />
          <CardBadges product={product} />
        </Link>

        <div className="flex-1 space-y-2.5 w-full">
          <div className="flex items-center justify-between gap-2">
            {product.brandName ? (
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {product.brandName}
              </span>
            ) : (
              <span />
            )}
            <StockChip status={product.stockStatus} />
          </div>

          <Link
            href={productUrl}
            className="block focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              {displayTitle}
            </h3>
          </Link>

          {product.categoryName && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{product.categoryName}</p>
          )}

          <CardRating product={product} />

          <CardPrice product={product} large />
        </div>

        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-amber-500 hover:text-slate-950 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            {outOfStock ? <Bell className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            {outOfStock ? "নোটিফাই মি" : "কার্টে যোগ করুন"}
          </button>

          {!outOfStock && (
            <button
              type="button"
              onClick={handleQuickBuy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              <Zap className="h-3.5 w-3.5 fill-slate-950" aria-hidden />
              কিনুন
            </button>
          )}

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-amber-50 hover:border-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
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
        "group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 flex flex-col justify-between active:scale-[0.99] touch-manipulation",
        viewMode === "compact" ? "p-2" : "",
        className,
      )}
    >
      <div>
        {/* Square Aspect Ratio Image Container */}
        <div className="relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <Link
            href={productUrl}
            className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-amber-500"
            aria-label={product.name}
          >
            <CardImage
              product={product}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              priority={priority}
            />
          </Link>

          {/* Top-Left Badges (Discount % Prominent) */}
          <CardBadges product={product} />

          {/* Top-Right Overlay Actions (Wishlist Heart + QuickView) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-pressed={isWishlisted}
              aria-label={
                isWishlisted
                  ? `উইশলিস্ট থেকে সরান: ${product.name}`
                  : `উইশলিস্টে যোগ করুন: ${product.name}`
              }
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border shadow-xs transition-all backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-amber-500 active:scale-95",
                isWishlisted
                  ? "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                  : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-red-600 hover:bg-white",
              )}
            >
              <Heart className={cn("h-3.5 w-3.5 transition-transform active:scale-125", isWishlisted && "fill-red-600 text-red-600")} aria-hidden />
            </button>

            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                aria-label={`কুইক ভিউ: ${product.name}`}
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-amber-600 hover:bg-white transition-all shadow-xs backdrop-blur-xs opacity-0 group-hover:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-500 active:scale-95"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}

            {onCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(product);
                }}
                aria-label={`তুলনা করুন: ${product.name}`}
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-amber-600 hover:bg-white transition-all shadow-xs backdrop-blur-xs opacity-0 group-hover:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-500 active:scale-95"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                স্টক শেষ
              </span>
            </div>
          )}
        </div>

        {/* Product Information Body */}
        <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-1.5">
          {/* Brand Name (Small & Muted below image) */}
          <div className="flex items-center justify-between gap-1">
            {product.brandName ? (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {product.brandName}
              </span>
            ) : (
              <span />
            )}
            <StockChip status={product.stockStatus} subtle />
          </div>

          {/* Clean Short Product Title (Truncated 2 Lines) */}
          <Link
            href={productUrl}
            className="block focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
          >
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {displayTitle}
            </h3>
          </Link>

          {/* Rating */}
          <CardRating product={product} countLabel="bare" />

          {/* Dynamic Role-Based Pricing Display */}
          <CardPrice product={product} />
        </div>
      </div>

      {/* Responsive Dual Action Buttons */}
      <div className="px-2 sm:px-3.5 pb-2 sm:pb-3.5 pt-0.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-1 h-8 sm:h-9 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-150 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-amber-600 touch-manipulation truncate px-1.5"
        >
          {outOfStock ? <Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> : <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />}
          <span className="truncate">{outOfStock ? "নোটিফাই" : "কার্টে যোগ"}</span>
        </button>

        {!outOfStock && (
          <button
            type="button"
            onClick={handleQuickBuy}
            className="flex-1 flex items-center justify-center gap-1 h-8 sm:h-9 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-150 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs hover:shadow-xs active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-amber-600 touch-manipulation truncate px-1.5"
          >
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-slate-950 shrink-0" aria-hidden />
            <span className="truncate">কিনুন</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
