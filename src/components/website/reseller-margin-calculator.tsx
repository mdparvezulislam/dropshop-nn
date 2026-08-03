"use client";

import { useState } from "react";
import { Calculator, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

const PRESET_EXAMPLES = [
  { name: "ওয়্যারলেস ইয়ারবাড (AirBuds)", wholesale: 650, selling: 1200 },
  { name: "স্মার্টওয়াচ (T800 Ultra)", wholesale: 850, selling: 1450 },
  { name: "পাওয়ার ব্যাংক (20,000mAh)", wholesale: 1100, selling: 1850 },
];

export function ResellerMarginCalculator() {
  const [wholesalePrice, setWholesalePrice] = useState<number>(850);
  const [sellingPrice, setSellingPrice] = useState<number>(1450);

  const profit = Math.max(0, sellingPrice - wholesalePrice);
  const marginPercent = wholesalePrice > 0 ? Math.round((profit / wholesalePrice) * 100) : 0;

  const handlePresetSelect = (wholesale: number, selling: number) => {
    setWholesalePrice(wholesale);
    setSellingPrice(selling);
  };

  const formatBdt = (val: number) => `৳${val.toLocaleString("en-BD")}`;

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
            <Calculator className="h-3.5 w-3.5" /> মার্জিন ক্যালকুলেটর
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            আপনার সম্ভাব্য লাভ হিসাব করুন
          </h2>
          <p className="text-xs text-slate-300 font-semibold">
            আপনি পাইকারি দামে কিনে নিজের নির্ধারিত দামে কাস্টমারের কাছে বিক্রি করবেন।
          </p>
        </div>

        {/* Preset sample buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(item.wholesale, item.selling)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-700 text-slate-200 transition-all active:scale-95 touch-manipulation"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Controls */}
        <div className="space-y-5">
          {/* Wholesale buying price */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-black text-slate-200">
              <span>আপনার পাইকারি কেনা দাম (Wholesale Cost)</span>
              <span className="text-amber-400 font-extrabold text-sm">{formatBdt(wholesalePrice)}</span>
            </label>
            <input
              type="range"
              min={200}
              max={5000}
              step={50}
              value={wholesalePrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setWholesalePrice(val);
                if (sellingPrice <= val) setSellingPrice(val + 200);
              }}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Selling price */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-black text-slate-200">
              <span>আপনার নির্ধারিত বিক্রয় মূল্য (Selling Price)</span>
              <span className="text-emerald-400 font-extrabold text-sm">{formatBdt(sellingPrice)}</span>
            </label>
            <input
              type="range"
              min={wholesalePrice + 50}
              max={wholesalePrice + 3000}
              step={50}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Display Output Card */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 sm:p-6 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              প্রতি পিসে নিট লাভ (Profit)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <TrendingUp className="h-3.5 w-3.5" /> +{marginPercent}% লাভ
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums">
            {formatBdt(profit)}
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-300 pt-3 border-t border-slate-700">
            <div className="flex justify-between">
              <span>১০ টি পিস বিক্রি করলে মোট লাভ:</span>
              <span className="font-black text-amber-400 tabular-nums">{formatBdt(profit * 10)}</span>
            </div>
            <div className="flex justify-between">
              <span>৫০ টি পিস বিক্রি করলে মোট লাভ:</span>
              <span className="font-black text-amber-400 tabular-nums">{formatBdt(profit * 50)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>ডেলিভারি সম্পন্ন হওয়ামাত্র আপনার বিকাশ/নগদে প্রফিট জমা হয়ে যাবে!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResellerMarginCalculator;
