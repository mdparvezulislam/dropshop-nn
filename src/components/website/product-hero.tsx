"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductGallery, type GalleryMedia } from "@/components/website/product-gallery";
import { VariantSelector } from "@/components/website/variant-selector";
import { SmartPricingPanel } from "@/components/website/smart-pricing-panel";
import { ResellerProfitCalculator } from "@/components/website/reseller-profit-calculator";
import { WholesaleQuotationSection } from "@/components/website/wholesale-quotation-section";
import { MarketingAssetsProvider } from "@/components/website/marketing-assets-provider";
import { ProductDeliveryInfo } from "@/components/website/product-delivery-info";
import { CompactRating } from "@/components/website/reviews/rating-stars";
import { WishlistButton } from "@/components/website/wishlist/wishlist-button";
import { ShareMenu } from "@/components/website/share/share-menu";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import { usePermissions } from "@/hooks/use-permissions";
import { PricingValidationService } from "@/features/pricing/services/pricing-validation-service";
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
  /** Real published-review aggregate; omitted entirely when there are none. */
  rating?: { average: number; count: number };
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

  const [resellerCustomPrice, setResellerCustomPrice] = React.useState<number | null>(null);

  const effectiveUnitPrice =
    isReseller && resellerCustomPrice !== null && resellerCustomPrice > 0
      ? resellerCustomPrice
      : unitPrice;

  const validation = PricingValidationService.validateResellerSellingPrice({
    customSellingPrice: effectiveUnitPrice,
    resellerPrice: pricing.resellerPrice,
    minResellerPrice: pricing.minResellerPrice,
    retailPrice: unitPrice > 0 ? unitPrice : pricing.retailPrice,
  });

  const effectiveResellerMinPrice = validation.floorPrice;
  const isResellerInvalidPrice = isReseller && pricing.resellerPrice !== undefined && !validation.isValid;

  // ── Actions ──────────────────────────────────────────────────────────
  const addToCart = React.useCallback((): boolean => {
    if (outOfStock) return false;
    if (effectiveUnitPrice <= 0) {
      toast.error("এই প্রোডাক্টের মূল্য এখনো নির্ধারিত হয়নি। অর্ডারের জন্য যোগাযোগ করুন।");
      return false;
    }
    if (isReseller && isResellerInvalidPrice) {
      toast.error(
        validation.error ??
          `নূন্যতম বিক্রয় মূল্য ৳${effectiveResellerMinPrice} (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)`,
      );
      const inputEl = document.getElementById("reseller-selling-price");
      if (inputEl) {
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        inputEl.focus();
      }
      return false;
    }
    cart.addItem(
      {
        productId: data.id,
        slug: data.slug,
        name: data.name,
        image: variant?.image || featuredImage,
        unitPrice: effectiveUnitPrice,
        resellerPrice: pricing.resellerPrice,
        customSellingPrice: isReseller ? effectiveUnitPrice : undefined,
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
    effectiveUnitPrice,
    isReseller,
    isResellerInvalidPrice,
    effectiveResellerMinPrice,
    pricing.resellerPrice,
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

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(q + 1, maxQuantity ?? Number.MAX_SAFE_INTEGER));

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <ProductGallery
            media={data.media}
            title={data.name}
            selectedImage={variant?.image || undefined}
          />
        </div>

        {/* Information + purchase.
            On mobile the card chrome is dropped entirely — it bleeds to the
            viewport edges (cancelling the page's px-3) so content gets the full
            width instead of paying 16px page padding + 24px card padding on a
            390px screen. The card returns from `sm:` up. */}
        <div className="space-y-4 sm:space-y-5 bg-white -mx-3 sm:mx-0 px-4 py-5 sm:p-8 rounded-none sm:rounded-3xl border-y sm:border border-slate-200 sm:shadow-xs text-slate-900">
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
                  New Arrival
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
            {/* Only rendered when real published reviews exist — never a default. */}
            {data.rating && (
              <CompactRating
                average={data.rating.average}
                count={data.rating.count}
                size="md"
                href="#reviews"
                className="text-slate-600"
              />
            )}
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
              onPriceChange={(customPrice) => setResellerCustomPrice(customPrice)}
            />
          )}

          {/* Variants */}
          {data.variants.length > 0 && (
            <VariantSelector variants={data.variants} onVariantChange={setVariant} />
          )}

          {/* Quantity + CTAs.
              Hidden on mobile: the sticky bottom bar carries the identical
              stepper and both CTAs, and two live copies of the same controls on
              one screen is a duplicate the user has to reason about. */}
          <div className="space-y-3 pt-1">
            <div className="hidden md:flex items-center gap-3 flex-wrap">
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

            <div className="hidden md:flex gap-3">
              <Button
                size="lg"
                onClick={addToCart}
                disabled={outOfStock || isResellerInvalidPrice}
                className="flex-1 min-h-12 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-[0.98] disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4 mr-2" aria-hidden />
                কার্টে যোগ করুন
              </Button>
              <Button
                size="lg"
                onClick={buyNow}
                disabled={outOfStock || isResellerInvalidPrice}
                className="flex-1 min-h-12 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.98] disabled:opacity-40"
              >
                <Zap className="h-4 w-4 mr-2 text-amber-400" aria-hidden />
                এখনই কিনুন
              </Button>
            </div>

            <div className="flex gap-2">
              <WishlistButton productId={data.id} productName={data.name} className="flex-1" />
              <ShareMenu
                path={`/product/${data.slug}`}
                title={data.name}
                text={data.shortDescription}
                className="flex-1"
              />
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

          {/* Service points — icon over label on mobile so three items fit
              without wrapping or shrinking the text below readable size. */}
          <ul className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-3 border-t border-slate-200 text-[10px] sm:text-[11px] font-black text-slate-900">
            {[
              { icon: ShieldCheck, label: "১০০% অরিজিনাল" },
              { icon: Truck, label: "সারাদেশে ডেলিভারি" },
              { icon: RotateCcw, label: "সহজ রিটার্ন" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 py-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center"
              >
                <Icon className="h-4 w-4 text-amber-600 shrink-0" aria-hidden />
                <span className="leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile sticky purchase bar.
          Carries the quantity stepper as well as the price and both CTAs, so a
          shopper can set the quantity and buy without scrolling back up — the
          in-page stepper sits far above the fold on a phone. Same state and the
          same validation as the desktop controls; nothing is duplicated but the
          layout. Bottom padding respects the iOS home indicator. */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
        role="region"
        aria-label="ক্রয় অপশন"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-lg font-black text-slate-900 tabular-nums leading-none">
              {unitPrice > 0 ? formatBdt(unitPrice * quantity) : "দাম আসছে"}
            </p>
            {unitPrice > 0 && quantity > 1 && (
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                {quantity} × {formatBdt(unitPrice)}
              </p>
            )}
          </div>

          <div
            className="flex items-center border border-slate-300 rounded-xl bg-white shrink-0 overflow-hidden"
            role="group"
            aria-label="পরিমাণ নির্বাচন"
          >
            <button
              type="button"
              onClick={decreaseQty}
              disabled={quantity <= 1}
              aria-label="পরিমাণ কমান"
              className="h-10 w-10 flex items-center justify-center text-slate-800 active:bg-slate-100 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-500"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span
              className="w-9 text-center text-sm font-black text-slate-900 tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={increaseQty}
              disabled={maxQuantity !== undefined && quantity >= maxQuantity}
              aria-label="পরিমাণ বাড়ান"
              className="h-10 w-10 flex items-center justify-center text-slate-800 active:bg-slate-100 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-500"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={addToCart}
            disabled={outOfStock || isResellerInvalidPrice}
            className="flex-1 h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-sm transition-transform disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" aria-hidden />
            {outOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
          </Button>
          <Button
            type="button"
            onClick={buyNow}
            disabled={outOfStock || isResellerInvalidPrice}
            aria-label="এখনই কিনুন"
            className="h-12 px-4 text-sm font-black bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl shadow-sm transition-transform disabled:opacity-40"
          >
            <Zap className="w-4 h-4 mr-1.5" aria-hidden />
            কিনুন
          </Button>
        </div>
      </div>
    </>
  );
}
