"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, AlertTriangle, Building2, Store, Info, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { PricingValidationService } from "@/features/pricing/services/pricing-validation-service";

export interface SmartPricingPanelProps {
  retailPrice: number;
  campaignPrice?: number;
  comparePrice?: number;
  costPrice?: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  minResellerPrice?: number;
  moq?: number;
  currency?: string;
  quantity?: number;
  onPriceChange?: (customSellingPriceBdt: number) => void;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function SmartPricingPanel({
  retailPrice,
  campaignPrice,
  comparePrice,
  resellerPrice,
  wholesalePrice,
  minResellerPrice,
  moq,
  quantity = 1,
  onPriceChange,
}: SmartPricingPanelProps) {
  const currentPrice = campaignPrice ?? retailPrice;
  const strikePrice =
    campaignPrice !== undefined
      ? retailPrice
      : comparePrice !== undefined && comparePrice > retailPrice
        ? comparePrice
        : undefined;
  const hasDiscount = strikePrice !== undefined && strikePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((strikePrice - currentPrice) / strikePrice) * 100)
    : 0;

  const [customSellingPrice, setCustomSellingPrice] = useState<number>(Math.round(currentPrice));

  const handlePriceInput = (val: string) => {
    const parsed = parseInt(val, 10);
    const num = Number.isNaN(parsed) ? 0 : parsed;
    setCustomSellingPrice(num);
    onPriceChange?.(num);

    const floor = PricingValidationService.getResellerFloorPrice({ resellerPrice, minResellerPrice });
    if (resellerPrice !== undefined && (num < floor || num <= 0)) {
      toast.error(`নূন্যতম বিক্রয় মূল্য ৳${floor} (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)`, {
        id: "reseller-min-price-toast",
      });
    }
  };

  if (currentPrice <= 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
        <span className="text-sm font-bold text-slate-600">
          দামের জন্য যোগাযোগ করুন — এই প্রোডাক্টের মূল্য শীঘ্রই যুক্ত হবে।
        </span>
      </div>
    );
  }

  const validation = PricingValidationService.validateResellerSellingPrice({
    customSellingPrice,
    resellerPrice,
    minResellerPrice,
  });

  const { isValid, floorPrice: effectiveMinPrice, profit, marginPercent } = validation;
  const isBelowFloor = resellerPrice !== undefined && !isValid;

  return (
    <div className="space-y-4">
      {/* Retail price — every viewer */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {resellerPrice !== undefined
              ? "প্রস্তাবিত বিক্রয় মূল্য (MRP):"
              : "খুচরা বিক্রয় মূল্য:"}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {formatBdt(currentPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  {formatBdt(strikePrice)}
                </span>
                <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>
        </div>
        {campaignPrice !== undefined && (
          <p className="text-[11px] font-bold text-red-600">ক্যাম্পেইন মূল্য চলছে</p>
        )}
        {resellerPrice !== undefined && (
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            এই দামেই কাস্টমাররা প্রোডাক্টটি দেখছেন — আপনি চাইলে নিজের দাম নির্ধারণ করতে পারেন।
          </p>
        )}
      </div>

      {/* Guest/Customer CTA for Reseller / Wholesale Rates */}
      {resellerPrice === undefined && wholesalePrice === undefined && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              হোলসেল রেট ও রিসেলার মার্জিন পেতে লগইন করুন
            </span>
          </div>
          <Link
            href="/login"
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-2xs"
          >
            লগইন করুন
          </Link>
        </div>
      )}

      {/* Reseller pricing tools — real reseller price only */}
      {resellerPrice !== undefined && (
        <div
          className={cn(
            "p-4 rounded-2xl border space-y-3 transition-colors",
            isBelowFloor
              ? "bg-red-50/50 border-red-300"
              : "bg-emerald-50/50 border-emerald-200",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
              <Store className="h-4 w-4 text-emerald-700" aria-hidden /> রিসেলার মূল্য
            </span>
            <span className="text-lg font-black text-emerald-900 tabular-nums">
              {formatBdt(resellerPrice)}
            </span>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="reseller-selling-price"
              className="text-[11px] font-bold text-slate-700"
            >
              আপনার বিক্রয় মূল্য নির্ধারণ করুন (৳)
            </label>
            <input
              id="reseller-selling-price"
              type="number"
              inputMode="numeric"
              min={effectiveMinPrice ?? resellerPrice}
              value={customSellingPrice || ""}
              onChange={(e) => handlePriceInput(e.target.value)}
              className={cn(
                "w-full h-10 px-3 rounded-xl border bg-white text-sm font-black tabular-nums transition-colors",
                isBelowFloor
                  ? "border-red-500 text-red-900 bg-red-50/30 focus-visible:outline-2 focus-visible:outline-red-500 ring-2 ring-red-500/20"
                  : "border-emerald-300 text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-500",
              )}
            />
            {isBelowFloor && (
              <p
                className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-100/80 px-2.5 py-1.5 rounded-lg border border-red-200"
                role="alert"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
                নূন্যতম বিক্রয় মূল্য {formatBdt(effectiveMinPrice ?? resellerPrice)} (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border bg-white",
              isBelowFloor ? "border-red-200" : "border-emerald-200",
            )}
          >
            <span className="text-[11px] font-bold text-slate-600">
              {quantity > 1 ? `${quantity} টি বিক্রিতে প্রফিট` : "আপনার প্রফিট"}
            </span>
            {isBelowFloor ? (
              <span className="flex items-center gap-1 text-xs font-black tabular-nums text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                ৳০ (লস সম্ভব নয়)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-black tabular-nums text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                {formatBdt(profit * quantity)}
                <span className="text-[11px] font-bold text-slate-500">({marginPercent}%)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Wholesale pricing — real wholesale price & MOQ */}
      {wholesalePrice !== undefined && (
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black text-blue-900">
              <Building2 className="h-4 w-4 text-blue-700" aria-hidden /> পাইকারি মূল্য (Wholesale Price)
            </span>
            <span className="text-lg font-black text-blue-900 tabular-nums">
              {formatBdt(wholesalePrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-xl bg-white border border-blue-100 flex flex-col">
              <span className="text-[10px] font-bold text-slate-500">সর্বনিম্ন পরিমাণ (MOQ)</span>
              <span className="font-black text-slate-900">{moq && moq > 1 ? moq : 20} পিস</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 flex flex-col">
              <span className="text-[10px] font-bold text-slate-500">মোট মূল্য ({Math.max(quantity, moq && moq > 1 ? moq : 20)} পিস)</span>
              <span className="font-black text-blue-700">{formatBdt(wholesalePrice * Math.max(quantity, moq && moq > 1 ? moq : 20))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartPricingPanel;
