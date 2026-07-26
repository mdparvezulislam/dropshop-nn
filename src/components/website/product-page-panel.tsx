"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SmartPricingPanel } from "@/components/website/smart-pricing-panel";
import { VariantSelector } from "@/components/website/variant-selector";
import { ResellerProfitCalculator } from "@/components/website/reseller-profit-calculator";
import { WholesaleQuotationSection } from "@/components/website/wholesale-quotation-section";
import { MarketingAssetsProvider } from "@/components/website/marketing-assets-provider";
import { ProductDeliveryInfo } from "@/components/website/product-delivery-info";
import { MobileStickyActionBar } from "@/components/website/mobile-sticky-action-bar";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ProductVariantEntity } from "@/features/catalog/domain/product-dto";

interface ProductPagePanelProps {
  productId?: string;
  name: string;
  brand?: string;
  brandSlug?: string;
  sku: string;
  category?: string;
  shortDescription?: string;
  notice?: string;
  warehouseLocation?: string;
  retailPrice: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  minResellerPrice?: number;
  currency?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  moq?: number;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  isNew?: boolean;
  isFlashSale?: boolean;
  variants?: ProductVariantEntity[];
  images?: Array<{ url: string; alt?: string }>;
  onVariantSelect?: (variant: ProductVariantEntity | null) => void;
}

export function ProductPagePanel({
  productId,
  name,
  brand,
  sku,
  category,
  shortDescription,
  notice,
  warehouseLocation,
  retailPrice,
  resellerPrice = Math.round(retailPrice * 0.75),
  wholesalePrice = Math.round(retailPrice * 0.65),
  costPrice = Math.round(retailPrice * 0.6),
  comparePrice,
  minResellerPrice,
  currency = "BDT",
  stockStatus = "in_stock",
  moq = 10,
  rating = 4.8,
  reviewCount = 34,
  salesCount = 285,
  isNew = true,
  isFlashSale,
  variants = [],
  images = [],
  onVariantSelect,
}: ProductPagePanelProps) {
  const { userRole } = usePermissions();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantEntity | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isOutOfStock = stockStatus === "out_of_stock";
  const isWholesaler = userRole === "wholesaler";
  const isReseller = userRole === "reseller";

  const effectiveMoq = isWholesaler ? Math.max(10, moq) : 1;
  const qty = Math.max(quantity, effectiveMoq);

  const handleVariantChange = (v: ProductVariantEntity | null) => {
    setSelectedVariant(v);
    if (onVariantSelect) onVariantSelect(v);
  };

  const handleAddToCart = () => {
    toast.success(`'${name}' কার্টে যোগ করা হয়েছে (${qty} টি)!`);
  };

  const currentPrice = selectedVariant
    ? retailPrice + (selectedVariant.priceAdjustment || 0)
    : retailPrice;

  // Clean SKU display (never print raw ObjectId)
  const displaySku =
    selectedVariant?.sku || (sku && !sku.match(/^[0-9a-fA-F]{24}$/) ? sku : "DS-PROD-001");

  return (
    <>
      <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-slate-900">
        {/* Product Title & Badges Header */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {isNew && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                নতুন আগমন
              </span>
            )}
            {isFlashSale && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                ফ্ল্যাশ সেল
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> ১০০% অরিজিনাল
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{name}</h1>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              {brand && (
                <span className="font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                  {brand}
                </span>
              )}
              <span className="text-slate-600 font-mono font-bold">SKU: {displaySku}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-black text-slate-900">{rating}</span>
              <span className="text-slate-600 font-bold">({reviewCount} রিভিউ)</span>
              <span className="text-slate-600 font-bold">• {salesCount}+ বিক্রি হয়েছে</span>
            </div>
          </div>
        </div>

        {/* Role-Based Smart Pricing Engine Component */}
        <SmartPricingPanel
          retailPrice={currentPrice}
          costPrice={costPrice}
          resellerPrice={resellerPrice}
          wholesalePrice={wholesalePrice}
          comparePrice={comparePrice}
          minResellerPrice={minResellerPrice}
          moq={moq}
          currency={currency}
          quantity={qty}
        />

        {/* Reseller Profit Calculator Widget */}
        {isReseller && (
          <ResellerProfitCalculator
            resellerPrice={resellerPrice}
            suggestedRetailPrice={currentPrice}
            comparePrice={comparePrice}
            minResellerPrice={minResellerPrice}
          />
        )}

        {/* Wholesale Quotation Section Widget */}
        {isWholesaler && (
          <WholesaleQuotationSection productName={name} wholesalePrice={wholesalePrice} moq={moq} />
        )}

        {/* Dynamic 5-Field Variant Selector */}
        {variants && variants.length > 0 && (
          <VariantSelector variants={variants} onVariantChange={handleVariantChange} />
        )}

        {/* Delivery & Notice Component */}
        <ProductDeliveryInfo notice={notice} warehouseLocation={warehouseLocation} />

        {/* Quantity & Stock Status */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900">পরিমাণ (Quantity):</span>
            {isWholesaler && (
              <span className="text-xs font-black text-red-900 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
                MOQ: {effectiveMoq} pcs
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(effectiveMoq, qty - 1))}
                disabled={qty <= effectiveMoq}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-l-xl transition-colors disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-xs font-black text-slate-900 tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(qty + 1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-r-xl transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1">
              {isOutOfStock ? (
                <span className="text-xs font-black text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200 inline-block">
                  স্টক শেষ
                </span>
              ) : (
                <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-300 inline-block">
                  স্টকে আছে (২৪-৪৮ ঘণ্টায় ডেলিভারি)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Desktop Layout) */}
        <div className="hidden md:flex gap-3 pt-2">
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 min-h-[48px] text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-[0.98] disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isOutOfStock ? "স্টক রিকোয়েস্ট" : "অর্ডার করুন"}
          </Button>

          {!isOutOfStock && (
            <Link href="/checkout" className="flex-1">
              <Button
                size="lg"
                className="w-full min-h-[48px] text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 mr-2 text-red-400" />
                এখনই কিনুন
              </Button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={cn(
              "min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl border transition-colors shrink-0",
              isWishlisted
                ? "bg-red-50 border-red-200 text-red-600"
                : "border-slate-300 text-slate-800 hover:bg-slate-100",
            )}
            title="Wishlist"
          >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-600")} />
          </button>
        </div>

        {/* Reseller Marketing Assets Provider */}
        {isReseller && (
          <MarketingAssetsProvider
            productName={name}
            shortDescription={shortDescription}
            resellerPrice={resellerPrice}
            suggestedRetailPrice={currentPrice}
            images={images}
          />
        )}

        {/* Trust Guarantee Badges */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-200 text-[11px] font-black text-slate-900">
          <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-red-600 shrink-0" />
            <span>১০০% অরিজিনাল</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
            <Truck className="h-4 w-4 text-red-600 shrink-0" />
            <span>দ্রুত ডেলিভারি</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
            <RotateCcw className="h-4 w-4 text-red-600 shrink-0" />
            <span>৭ দিনে রিটার্ন</span>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <MobileStickyActionBar
        productName={name}
        price={`৳${currentPrice.toLocaleString("en-BD")}`}
        isOutOfStock={isOutOfStock}
      />
    </>
  );
}

export default ProductPagePanel;
