"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Store,
  DollarSign,
  Info,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";

export interface SmartPricingPanelProps {
  retailPrice: number; // in poisha (e.g. 175000 = 1750 BDT)
  costPrice?: number; // in poisha (e.g. 100000 = 1000 BDT)
  resellerPrice?: number; // in poisha (e.g. 120000 = 1200 BDT)
  wholesalePrice?: number; // in poisha (e.g. 110000 = 1100 BDT)
  comparePrice?: number; // in poisha
  minResellerPrice?: number; // in poisha (e.g. 145000 = 1450 BDT)
  moq?: number;
  currency?: string;
  quantity?: number;
  onPriceChange?: (customSellingPrice: number) => void;
}

export function SmartPricingPanel({
  retailPrice,
  costPrice = Math.round(retailPrice * 0.6),
  resellerPrice = Math.round(retailPrice * 0.75),
  wholesalePrice = Math.round(retailPrice * 0.65),
  comparePrice,
  minResellerPrice = Math.round(resellerPrice * 1.15), // e.g. min selling price = 115% of reseller cost
  moq = 10,
  currency = "BDT",
  quantity = 1,
  onPriceChange,
}: SmartPricingPanelProps) {
  const { userRole } = usePermissions();

  const isReseller = userRole === "reseller" || userRole === "admin";
  const isWholesaler = userRole === "wholesaler";

  // Reseller Custom Selling Price State (in BDT)
  const defaultSellingPriceBdt = Math.round(retailPrice / 100);
  const resellerCostBdt = Math.round(resellerPrice / 100);
  const minSellingPriceBdt = Math.round(minResellerPrice / 100);

  const [customSellingPriceBdt, setCustomSellingPriceBdt] = useState<number>(defaultSellingPriceBdt);

  // Handle Quick Price Adder (+50, +100, +200, Recommended)
  const handleQuickAdd = (bonus: number) => {
    const newPrice = defaultSellingPriceBdt + bonus;
    setCustomSellingPriceBdt(newPrice);
    if (onPriceChange) onPriceChange(newPrice * 100);
  };

  const handlePriceInput = (val: string) => {
    const parsed = parseInt(val, 10);
    const num = isNaN(parsed) ? 0 : parsed;
    setCustomSellingPriceBdt(num);
    if (onPriceChange) onPriceChange(num * 100);
  };

  // Calculations for Reseller
  const profitBdt = customSellingPriceBdt - resellerCostBdt;
  const isBelowMin = customSellingPriceBdt < minSellingPriceBdt;
  const marginPercent = customSellingPriceBdt > 0 ? Math.round((profitBdt / customSellingPriceBdt) * 100) : 0;
  const totalRevenueBdt = customSellingPriceBdt * quantity;
  const totalProfitBdt = profitBdt * quantity;

  // Price Status Chip Logic
  const priceStatus = useMemo(() => {
    if (isBelowMin) return { label: "অমান্য মূল্য", color: "bg-red-500 text-white border-red-600" };
    if (marginPercent < 15) return { label: "Low Profit", color: "bg-amber-100 text-amber-900 border-amber-300" };
    if (marginPercent >= 15 && marginPercent < 25) return { label: "Recommended", color: "bg-emerald-100 text-emerald-900 border-emerald-300" };
    if (marginPercent >= 25 && marginPercent < 35) return { label: "High Conversion", color: "bg-blue-100 text-blue-900 border-blue-300" };
    return { label: "Premium Profit", color: "bg-purple-100 text-purple-900 border-purple-300" };
  }, [isBelowMin, marginPercent]);

  // Wholesale Tiers Matrix Data
  const wholesaleUnitBdt = Math.round(wholesalePrice / 100);
  const wholesaleTiers = [
    { minQty: 12, maxQty: 23, priceBdt: Math.round(wholesaleUnitBdt * 0.95), discount: "৫% অতিরিক্ত ছাড়" },
    { minQty: 24, maxQty: 49, priceBdt: Math.round(wholesaleUnitBdt * 0.9), discount: "১০% অতিরিক্ত ছাড়" },
    { minQty: 50, maxQty: 99, priceBdt: Math.round(wholesaleUnitBdt * 0.85), discount: "১৫% অতিরিক্ত ছাড়" },
    { minQty: 100, maxQty: "+", priceBdt: Math.round(wholesaleUnitBdt * 0.8), discount: "২০% মেগা ডিসকাউন্ট" },
  ];

  // 1. PUBLIC GUEST USER VIEW
  if (!isReseller && !isWholesaler) {
    const hasDiscount = comparePrice && comparePrice > retailPrice;
    const discountPercent = hasDiscount ? Math.round(((comparePrice - retailPrice) / comparePrice) * 100) : 0;

    return (
      <div className="space-y-4">
        {/* Retail Price Display */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500">খুচরা বিক্রয় মূল্য:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                ৳{(retailPrice / 100).toLocaleString("en-BD")}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  ৳{(comparePrice / 100).toLocaleString("en-BD")}
                </span>
              )}
            </div>
          </div>

          {hasDiscount && (
            <div className="flex items-center justify-end gap-2 text-xs font-extrabold text-red-600">
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                -{discountPercent}% ছাড়
              </span>
              <span>আপনি সাশ্রয় করছেন ৳{((comparePrice - retailPrice) / 100).toLocaleString("en-BD")}</span>
            </div>
          )}
        </div>

        {/* Public Protected Wholesale Callout */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
              <Building2 className="h-4 w-4" />
              <span>পাইকারি বা বাল্ক সোর্সিং করতে চান?</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
              MOQ: {moq}+ Pcs
            </span>
          </div>
          <p className="text-xs text-slate-300">
            বিশেষ পাইকারি রেট ও মিনিমাম অর্ডার কোয়ান্টিটি (MOQ) ফিচার আনলক করতে বি২বি হোলসেলার অ্যাকাউন্ট খুলুন।
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Link href="/become-wholesale-partner" className="flex-1">
              <Button size="sm" className="w-full h-8.5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs">
                হোলসেলার অ্যাকাউন্ট করুন
              </Button>
            </Link>
            <Link href="/auth/login" className="shrink-0">
              <Button size="sm" variant="outline" className="h-8.5 px-3 text-xs font-bold border-white/30 text-white hover:bg-white/10">
                লগইন
              </Button>
            </Link>
          </div>
        </div>

        {/* Public Protected Reseller Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
            <Store className="h-4 w-4 text-amber-600" />
            <span>জিরো ইনভেস্টমেন্টে ড্রপশিপিং রিসেলিং শুরু করুন</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            নিজের দামে বিক্রি করুন এবং প্রতিটি অর্ডারে আকর্ষণীয় প্রফিট ইনকাম করুন।
          </p>
          <Link href="/become-reseller" className="inline-block pt-1">
            <Button size="sm" variant="outline" className="h-8 text-xs font-extrabold border-amber-500 text-amber-800 hover:bg-amber-100">
              রিসেলার মেম্বারশিপ নিন →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. RESELLER ROLE WORKSPACE & LIVE PROFIT CALCULATOR
  if (isReseller) {
    return (
      <div className="space-y-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        {/* Reseller Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
            <Store className="h-4 w-4" />
            <span>রিসেলার স্মার্ট প্রাইসিং ও লাইভ প্রফিট ক্যালকুলেটর</span>
          </div>
          <span className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full border", priceStatus.color)}>
            {priceStatus.label}
          </span>
        </div>

        {/* Reseller Cost & Recommended Price Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block">আপনার কেনা রেট (Cost)</span>
            <span className="text-lg font-black text-amber-400">৳{resellerCostBdt.toLocaleString("en-BD")}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block">সুপারিশকৃত রেট (MRP)</span>
            <span className="text-lg font-black text-white">৳{defaultSellingPriceBdt.toLocaleString("en-BD")}</span>
          </div>
        </div>

        {/* Editable Selling Price Input Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-200">
              আপনার কাস্টম বিক্রয় মূল্য (Selling Price BDT):
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              সর্বনিম্ন মূল্য: ৳{minSellingPriceBdt}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-black text-amber-400">৳</span>
            <input
              type="number"
              value={customSellingPriceBdt || ""}
              onChange={(e) => handlePriceInput(e.target.value)}
              className={cn(
                "w-full h-11 pl-8 pr-4 text-base font-black rounded-xl bg-slate-950 border text-white outline-none transition-all",
                isBelowMin ? "border-red-500 focus:border-red-600 ring-2 ring-red-500/20" : "border-amber-500/60 focus:border-amber-400"
              )}
            />
          </div>

          {/* Validation Warning Alert */}
          {isBelowMin && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold animate-shake">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>সর্বনিম্ন বিক্রয় মূল্য ৳{minSellingPriceBdt}। অনুগ্রহ করে মূল্য বাড়ান।</span>
            </div>
          )}
        </div>

        {/* Quick Price Buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            কুইক প্রাইস বাটন (Quick Adjust):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickAdd(0)}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white"
            >
              Recommended (৳{defaultSellingPriceBdt})
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(50)}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300"
            >
              +৳৫০
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(100)}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300"
            >
              +৳১০০
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(200)}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300"
            >
              +৳২০০
            </button>
          </div>
        </div>

        {/* Live Profit Summary Box */}
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-200">আনুমানিক নিট লাভ (Profit / Pcs):</span>
            <span className={cn("text-lg font-black tabular-nums", profitBdt > 0 ? "text-emerald-400" : "text-red-400")}>
              ৳{profitBdt.toLocaleString("en-BD")} ({marginPercent}%)
            </span>
          </div>

          {quantity > 1 && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-800/60">
              <span className="font-bold text-slate-300">{quantity} টি পণ্যে মোট লাভ:</span>
              <span className="font-black text-amber-300">৳{totalProfitBdt.toLocaleString("en-BD")}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. WHOLESALE ROLE WORKSPACE & TIER PRICING MATRIX
  if (isWholesaler) {
    return (
      <div className="space-y-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        {/* Wholesale Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
            <Building2 className="h-4 w-4" />
            <span>বি২বি হোলসেল প্রাইসিং & টিয়ার ডিসকাউন্ট</span>
          </div>
          <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            MOQ: {moq}+ Pcs
          </span>
        </div>

        {/* Base Wholesale Unit Price */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">বেস পাইকারি মূল্য (Base Rate)</span>
            <span className="text-xs text-slate-400 font-medium">মিনিমাম {moq} পিস অর্ডারে</span>
          </div>
          <span className="text-2xl font-black text-amber-400">
            ৳{wholesaleUnitBdt.toLocaleString("en-BD")} <span className="text-xs font-normal text-slate-400">/ Pcs</span>
          </span>
        </div>

        {/* Wholesale Tier Pricing Table */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-slate-200 block">
            বাল্ক অর্ডার টিয়ার ডিসকাউন্ট ম্যাট্রিক্স (Tier Pricing):
          </span>

          <div className="rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800 text-xs">
            {wholesaleTiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-3 p-3 items-center bg-slate-950/60 hover:bg-slate-800/50 transition-colors">
                <span className="font-extrabold text-slate-200">
                  {tier.minQty} - {tier.maxQty} Pcs
                </span>
                <span className="font-black text-amber-400">
                  ৳{tier.priceBdt.toLocaleString("en-BD")} / Pcs
                </span>
                <span className="text-right text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {tier.discount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          বাল্ক অর্ডারে সরাসরি কোম্পানি পারচেজ অর্ডার (PO) দিয়ে ইনভয়েস করা সম্ভব।
        </p>
      </div>
    );
  }

  return null;
}

export default SmartPricingPanel;
