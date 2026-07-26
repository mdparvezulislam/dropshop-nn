"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ProductGallery, type GalleryMedia } from "@/components/website/product-gallery";
import { VariantSelector } from "@/components/website/variant-selector";
import { SmartPricingPanel } from "@/components/website/smart-pricing-panel";
import { ResellerProfitCalculator } from "@/components/website/reseller-profit-calculator";
import { WholesaleQuotationSection } from "@/components/website/wholesale-quotation-section";
import { MarketingAssetsProvider } from "@/components/website/marketing-assets-provider";
import { ProductDeliveryInfo } from "@/components/website/product-delivery-info";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import { usePermissions } from "@/hooks/use-permissions";
import type { ProductVariantEntity } from "@/features/catalog/domain/product-dto";
import type {
  PublicProductPricing,
  PublicStockStatus,
} from "@/features/catalog/domain/public-catalog-types";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";

export interface ProductHeroData {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  productModel?: string;
  shortDescription?: string;
  notice?: string;
  isNew: boolean;
  isFlashSale: boolean;
  brandName?: string;
  brandSlug?: string;
  categoryName?: string;
  categorySlug?: string;
  media: GalleryMedia[];
  variants: ProductVariantEntity[];
  warranty?: string;
}

interface ProductHeroProps {
  data: ProductHeroData;
  pricing: PublicProductPricing;
  stockStatus: PublicStockStatus;
  /** Summed available stock; null = untracked. */
  stockTotal: number | null;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

/**
 * The PDP hero: gallery + information + purchase experience, sharing variant
 * state so image, price, stock ceiling, and cart line stay in sync.
 * Every value rendered here comes from the server payload — nothing invented.
 */
export function ProductHero({ data, pricing, stockStatus, stockTotal }: ProductHeroProps) {
  const router = useRouter();
  const cart = useLocalCart();
  const { userRole } = usePermissions();

  const [variant, setVariant] = React.useState<ProductVariantEntity | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [wishlisted, setWishlisted] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  const isReseller = userRole === "reseller";
  const isWholesaler = userRole === "wholesaler";

  // ── Derived commerce state ───────────────────────────────────────────
  const basePrice = pricing.campaignPrice ?? pricing.retailPrice;
  const adjustment = variant?.priceAdjustment ?? 0;
  const unitPrice = basePrice > 0 ? basePrice + adjustment : 0;
  const strikePrice =
    pricing.campaignPrice !== undefined
      ? pricing.retailPrice + adjustment
      : pricing.comparePrice !== undefined
        ? pricing.comparePrice + adjustment
        : undefined;
  const savings =
    strikePrice !== undefined && strikePrice > unitPrice ? strikePrice - unitPrice : undefined;
  const discountPercent =
    savings !== undefined && strikePrice ? Math.round((savings / strikePrice) * 100) : undefined;

  // Variant-aware stock: a selected variant with tracked stock overrides the
  // product-level inventory total; untracked (null) means dropship-sellable.
  const variantTracked = variant !== null && typeof variant.stock === "number";
  const effectiveStock = variantTracked ? (variant!.stock ?? 0) : stockTotal;
  const effectiveStatus: PublicStockStatus =
    effectiveStock === null
      ? stockStatus
      : effectiveStock <= 0
        ? "out_of_stock"
        : effectiveStock <= 10
          ? "low_stock"
          : "in_stock";
  const outOfStock = effectiveStatus === "out_of_stock";
  const maxQuantity = effectiveStock !== null && effectiveStock > 0 ? effectiveStock : undefined;

  React.useEffect(() => {
    // Re-clamp quantity when the variant (and its ceiling) changes.
    setQuantity((q) => Math.max(1, Math.min(q, maxQuantity ?? Number.MAX_SAFE_INTEGER)));
  }, [maxQuantity]);

  const variantLabel = variant?.attributes
    ? Object.values(variant.attributes).filter(Boolean).join(" / ")
    : undefined;

  const skuValue = variant?.sku || data.sku;
  const displaySku = skuValue && !skuValue.match(/^[0-9a-fA-F]{24}$/) ? skuValue : undefined;

  const featuredImage =
    data.media.find((m) => m.isFeatured)?.url ?? data.media[0]?.url ?? PRODUCT_IMAGE_PLACEHOLDER;

  // ── Actions ──────────────────────────────────────────────────────────
  const addToCart = React.useCallback((): boolean => {
    if (outOfStock) return false;
    if (unitPrice <= 0) {
      toast.error("এই প্রোডাক্টের মূল্য এখনো নির্ধারিত হয়নি। অর্ডারের জন্য যোগাযোগ করুন।");
      return false;
    }
    cart.addItem(
      {
        productId: data.id,
        slug: data.slug,
        name: data.name,
        image: variant?.image || featuredImage,
        unitPrice,
        variantSku: variant?.sku,
        variantLabel,
        maxQuantity,
      },
      quantity,
    );
    toast.success(
      `কার্টে যোগ হয়েছে — ${data.name}${variantLabel ? ` (${variantLabel})` : ""} × ${quantity}`,
    );
    return true;
  }, [
    outOfStock,
    unitPrice,
    cart,
    data,
    variant,
    variantLabel,
    maxQuantity,
    quantity,
    featuredImage,
  ]);

  const buyNow = React.useCallback(() => {
    if (addToCart()) router.push("/checkout");
  }, [addToCart, router]);

  const share = React.useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: data.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        toast.success("লিংক কপি হয়েছে");
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  }, [data.name]);

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(q + 1, maxQuantity ?? Number.MAX_SAFE_INTEGER));

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <ProductGallery
            media={data.media}
            title={data.name}
            selectedImage={variant?.image || undefined}
          />
        </div>

        {/* Information + purchase */}
        <div className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-slate-900">
          {/* Taxonomy row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {data.brandName && (
              <Link
                href={data.brandSlug ? `/brands/${data.brandSlug}` : "/brands"}
                className="font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 hover:bg-amber-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                {data.brandName}
              </Link>
            )}
            {data.categoryName && (
              <Link
                href={data.categorySlug ? `/category/${data.categorySlug}` : "/categories"}
                className="font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                {data.categoryName}
              </Link>
            )}
          </div>

          {/* Title + badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {data.isNew && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  নতুন আগমন
                </span>
              )}
              {data.isFlashSale && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  ফ্ল্যাশ সেল
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {data.name}
            </h1>
            {data.shortDescription && (
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {data.shortDescription}
              </p>
            )}
          </div>

          {/* Identity row — includes selected-variant physical data when it actually exists */}
          {(displaySku || data.productModel || variant?.weight || variant?.dimensions) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-bold border-b border-slate-200 pb-3">
              {displaySku && <span className="font-mono">SKU: {displaySku}</span>}
              {data.productModel && <span>মডেল: {data.productModel}</span>}
              {variant?.weight !== undefined && variant.weight > 0 && (
                <span>
                  ওজন: {variant.weight} {variant.weightUnit ?? "kg"}
                </span>
              )}
              {variant?.dimensions &&
                variant.dimensions.length !== undefined &&
                variant.dimensions.width !== undefined &&
                variant.dimensions.height !== undefined && (
                  <span>
                    মাপ: {variant.dimensions.length}×{variant.dimensions.width}×
                    {variant.dimensions.height} {variant.dimensions.unit ?? "cm"}
                  </span>
                )}
            </div>
          )}

          {/* Price block */}
          <div className="space-y-1.5">
            {unitPrice > 0 ? (
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {formatBdt(unitPrice)}
                </span>
                {strikePrice !== undefined && savings !== undefined && (
                  <>
                    <span className="text-base font-bold line-through text-slate-400 tabular-nums">
                      {formatBdt(strikePrice)}
                    </span>
                    <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      -{discountPercent}% • {formatBdt(savings)} সাশ্রয়
                    </span>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-500">দামের জন্য যোগাযোগ করুন</p>
            )}
            {pricing.campaignPrice !== undefined && (
              <p className="text-[11px] font-bold text-red-600">ক্যাম্পেইন মূল্য চলছে</p>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            {effectiveStatus === "out_of_stock" && (
              <span className="text-xs font-black text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                স্টক শেষ
              </span>
            )}
            {effectiveStatus === "low_stock" && (
              <span className="text-xs font-black text-orange-800 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-300">
                সীমিত স্টক{effectiveStock !== null ? ` — মাত্র ${effectiveStock} টি বাকি` : ""}
              </span>
            )}
            {effectiveStatus === "in_stock" && (
              <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300">
                স্টকে আছে
              </span>
            )}
          </div>

          {/* Role-gated pricing tools (server decides which tiers exist) */}
          {(pricing.resellerPrice !== undefined ||
            pricing.wholesalePrice !== undefined ||
            pricing.costPrice !== undefined) && (
            <SmartPricingPanel
              retailPrice={unitPrice > 0 ? unitPrice : pricing.retailPrice}
              campaignPrice={undefined}
              costPrice={pricing.costPrice}
              resellerPrice={pricing.resellerPrice}
              wholesalePrice={pricing.wholesalePrice}
              comparePrice={pricing.comparePrice}
              currency={pricing.currency}
              quantity={quantity}
            />
          )}

          {/* Variants */}
          {data.variants.length > 0 && (
            <VariantSelector variants={data.variants} onVariantChange={setVariant} />
          )}

          {/* Quantity + CTAs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs"
                role="group"
                aria-label="পরিমাণ নির্বাচন"
              >
                <button
                  type="button"
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                  className="h-11 w-11 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-l-xl transition-colors disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-amber-500"
                  aria-label="পরিমাণ কমান"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span
                  className="w-12 text-center text-sm font-black text-slate-900 tabular-nums"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQty}
                  disabled={maxQuantity !== undefined && quantity >= maxQuantity}
                  className="h-11 w-11 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-r-xl transition-colors disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-amber-500"
                  aria-label="পরিমাণ বাড়ান"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {maxQuantity !== undefined && quantity >= maxQuantity && (
                <span className="text-[11px] font-bold text-orange-700" role="status">
                  সর্বোচ্চ {maxQuantity} টি অর্ডার করা যাবে
                </span>
              )}

              {unitPrice > 0 && quantity > 1 && (
                <span className="text-xs font-black text-slate-700 tabular-nums ml-auto">
                  মোট: {formatBdt(unitPrice * quantity)}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={addToCart}
                disabled={outOfStock}
                className="flex-1 min-h-12 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-[0.98] disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4 mr-2" aria-hidden />
                কার্টে যোগ করুন
              </Button>
              <Button
                size="lg"
                onClick={buyNow}
                disabled={outOfStock}
                className="flex-1 min-h-12 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.98] disabled:opacity-40"
              >
                <Zap className="h-4 w-4 mr-2 text-amber-400" aria-hidden />
                এখনই কিনুন
              </Button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWishlisted(!wishlisted)}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
                className={cn(
                  "flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-amber-500",
                  wishlisted
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50",
                )}
              >
                <Heart className={cn("h-4 w-4", wishlisted && "fill-red-600")} aria-hidden />
                উইশলিস্ট
              </button>
              <button
                type="button"
                onClick={share}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
                aria-label="প্রোডাক্ট শেয়ার করুন"
              >
                {shared ? (
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : (
                  <Share2 className="h-4 w-4" aria-hidden />
                )}
                শেয়ার
              </button>
            </div>
          </div>

          {/* B2B tools for logged-in memberships with real tier prices */}
          {isReseller && pricing.resellerPrice !== undefined && (
            <>
              <ResellerProfitCalculator
                resellerPrice={pricing.resellerPrice}
                suggestedRetailPrice={unitPrice > 0 ? unitPrice : pricing.retailPrice}
                comparePrice={pricing.comparePrice}
              />
              <MarketingAssetsProvider
                productName={data.name}
                shortDescription={data.shortDescription}
                resellerPrice={pricing.resellerPrice}
                suggestedRetailPrice={unitPrice > 0 ? unitPrice : pricing.retailPrice}
                images={data.media.map((m) => ({ url: m.url, alt: m.alt }))}
              />
            </>
          )}
          {isWholesaler && pricing.wholesalePrice !== undefined && (
            <WholesaleQuotationSection
              productName={data.name}
              wholesalePrice={pricing.wholesalePrice}
            />
          )}

          {/* Delivery + notice */}
          <ProductDeliveryInfo notice={data.notice} />

          {/* Warranty summary — only when the product actually declares one */}
          {data.warranty && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
              <div className="text-xs">
                <span className="font-black text-slate-900 block">ওয়ারেন্টি</span>
                <span className="text-slate-600 font-medium">{data.warranty}</span>
              </div>
            </div>
          )}

          {/* Service points */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-[11px] font-black text-slate-900">
            <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" aria-hidden />
              <span>১০০% অরিজিনাল</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Truck className="h-4 w-4 text-amber-600 shrink-0" aria-hidden />
              <span>সারাদেশে ডেলিভারি</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" aria-hidden />
              <span>সহজ রিটার্ন</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky purchase bar — same state, same validation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-500 truncate">{data.name}</p>
            <p className="text-sm font-black text-slate-900 tabular-nums">
              {unitPrice > 0 ? formatBdt(unitPrice * quantity) : "দাম আসছে"}
            </p>
          </div>
          <Button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            className="min-h-11 px-4 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" aria-hidden />
            {outOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
          </Button>
          <Button
            type="button"
            onClick={buyNow}
            disabled={outOfStock}
            className="min-h-11 px-4 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md disabled:opacity-40"
          >
            <Zap className="w-4 h-4" aria-hidden />
            <span className="sr-only">এখনই কিনুন</span>
          </Button>
        </div>
      </div>
    </>
  );
}
