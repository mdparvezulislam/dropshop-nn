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
  Download,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SmartPricingPanel } from "@/components/website/smart-pricing-panel";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  minResellerPrice?: number;
  currency?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  moq?: number;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
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
  minResellerPrice,
  currency = "BDT",
  stockStatus = "in_stock",
  moq = 10,
  rating = 4.8,
  reviewCount = 34,
  salesCount = 285,
  isNew = true,
  isFlashSale,
  variants,
}: ProductPagePanelProps) {
  const { userRole } = usePermissions();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [customPricePoisha, setCustomPricePoisha] = useState<number>(retailPrice);

  const isOutOfStock = stockStatus === "out_of_stock";
  const isWholesaler = userRole === "wholesaler";
  const isReseller = userRole === "reseller";

  const effectiveMoq = isWholesaler ? Math.max(10, moq) : 1;
  const qty = Math.max(quantity, effectiveMoq);

  const minSellingPoisha = minResellerPrice || Math.round((resellerPrice || retailPrice * 0.75) * 1.15);
  const isInvalidResellerPrice = isReseller && customPricePoisha < minSellingPoisha;

  const handleAddToCart = () => {
    if (isInvalidResellerPrice) {
      toast.error("বিক্রয় মূল্য সর্বনিম্ন লিমিটের নিচে! অনুগ্রহ করে মূল্য বাড়ান।");
      return;
    }
    toast.success(`'${name}' কার্টে যোগ করা হয়েছে (${qty} টি)!`);
  };

  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-300 shadow-xs text-slate-900">
      {/* Product Title & Brand Header */}
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

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {name}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {brand && (
              <span className="font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                {brand}
              </span>
            )}
            <span className="text-slate-600 font-mono font-bold">SKU: {sku}</span>
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
        retailPrice={retailPrice}
        costPrice={costPrice}
        resellerPrice={resellerPrice}
        wholesalePrice={wholesalePrice}
        comparePrice={comparePrice}
        minResellerPrice={minSellingPoisha}
        moq={moq}
        currency={currency}
        quantity={qty}
        onPriceChange={(newPrice) => setCustomPricePoisha(newPrice)}
      />

      {/* Variant Selector */}
      {variants && variants.length > 0 && (
        <div className="space-y-3 pt-2">
          {variants.map((group) => (
            <div key={group.name}>
              <p className="text-xs font-black text-slate-900 mb-2">
                {group.name}:{" "}
                <span className="text-amber-600 font-black">
                  {selectedVariants[group.name] || "পছন্দ করুন"}
                </span>
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
                        "px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all",
                        !opt.available && "opacity-30 cursor-not-allowed line-through",
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-2xs font-black"
                          : "border-slate-300 text-slate-800 hover:border-amber-400 hover:bg-slate-50"
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

      {/* Quantity & Stock Status */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900">পরিমাণ (Quantity):</span>
          {isWholesaler && (
            <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded">
              মিনিমাম অর্ডার কোয়ান্টিটি (MOQ): {effectiveMoq} pcs
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(effectiveMoq, qty - 1))}
              disabled={qty <= effectiveMoq}
              className="p-2.5 text-slate-800 hover:bg-slate-100 rounded-l-xl transition-colors disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-xs font-black text-slate-900 tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(qty + 1)}
              className="p-2.5 text-slate-800 hover:bg-slate-100 rounded-r-xl transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1">
            {isOutOfStock ? (
              <span className="text-xs font-black text-red-600 bg-red-50 px-3.5 py-1.5 rounded-xl border border-red-200 inline-block">
                স্টক শেষ
              </span>
            ) : (
              <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 inline-block shadow-2xs">
                স্টকে আছে (২-৩ দিনে ডেলিভারি)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isInvalidResellerPrice}
          className="flex-1 h-12 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {isOutOfStock ? "স্টক রিকোয়েস্ট" : "অর্ডার করুন"}
        </Button>

        {!isOutOfStock && (
          <Link href={isInvalidResellerPrice ? "#" : "/checkout"} className="flex-1">
            <Button
              size="lg"
              disabled={isInvalidResellerPrice}
              className="w-full h-12 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.98] disabled:opacity-40"
            >
              <Zap className="h-4 w-4 mr-2 text-amber-400" />
              এখনই কিনুন
            </Button>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={cn(
            "p-3 rounded-xl border transition-colors shrink-0",
            isWishlisted ? "bg-red-50 border-red-200 text-red-600" : "border-slate-300 text-slate-800 hover:bg-slate-100"
          )}
          title="Wishlist"
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-600")} />
        </button>
      </div>

      {/* Reseller Marketing Kit Download Button */}
      {isReseller && (
        <a
          href="/reseller/marketing-kit"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black hover:bg-amber-100 transition-colors"
        >
          <Download className="h-4 w-4 text-amber-600" />
          রিসেলার মার্কেটিং কিট (ছবি, ব্যানার, ভিডিও) ডাউনলোড করুন
        </a>
      )}

      {/* Trust Guarantee Items */}
      <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-200 text-[11px] font-black text-slate-900">
        <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 border border-slate-300 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
          <span>১০০% অরিজিনাল</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 border border-slate-300 shadow-2xs">
          <Truck className="h-4 w-4 text-amber-600 shrink-0" />
          <span>দ্রুত ডেলিভারি</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 border border-slate-300 shadow-2xs">
          <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
          <span>৭ দিনে রিটার্ন</span>
        </div>
      </div>
    </div>
  );
}

export default ProductPagePanel;
