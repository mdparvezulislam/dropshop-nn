"use client";

import * as React from "react";
import { z } from "zod";
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Percent,
  ShieldCheck,
} from "lucide-react";

interface ResellerProfitCalculatorProps {
  resellerPrice: number; // Base reseller cost (BDT)
  suggestedRetailPrice: number; // Suggested selling price (BDT)
  comparePrice?: number; // MSRP ceiling (BDT)
  minResellerPrice?: number; // Price floor (BDT)
}

export function ResellerProfitCalculator({
  resellerPrice,
  suggestedRetailPrice,
  comparePrice,
  minResellerPrice,
}: ResellerProfitCalculatorProps) {
  // Floor and Ceiling limits
  const floorPrice = minResellerPrice || Math.round(resellerPrice * 1.15);
  const ceilingPrice =
    comparePrice && comparePrice > suggestedRetailPrice
      ? comparePrice
      : Math.round(suggestedRetailPrice * 1.5);

  const [sellingPriceInput, setSellingPriceInput] = React.useState<string>(
    suggestedRetailPrice > 0
      ? String(suggestedRetailPrice)
      : String(Math.round(resellerPrice * 1.25)),
  );

  const currentVal = parseFloat(sellingPriceInput) || 0;

  // Zod Boundary Validation
  const priceValidationSchema = z
    .number()
    .min(floorPrice, `Selling Price cannot be lower than floor limit ৳${floorPrice}`)
    .max(ceilingPrice, `Selling Price cannot exceed maximum MSRP ceiling ৳${ceilingPrice}`);

  const validationResult = priceValidationSchema.safeParse(currentVal);
  const isValid = validationResult.success;
  const errorMessage = !isValid ? validationResult.error.issues[0]?.message : null;

  const netProfit = Math.max(0, currentVal - resellerPrice);
  const profitMarginPercent = currentVal > 0 ? Math.round((netProfit / currentVal) * 100) : 0;
  const roiPercent = resellerPrice > 0 ? Math.round((netProfit / resellerPrice) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-red-500/30 shadow-xl space-y-4 my-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <span>Reseller Live Profit Calculator</span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase">
                রিসেলার লাভ
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Set your custom selling price within platform limits
            </p>
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Base Reseller Price */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            আপনার কেনা মূল্য (Cost Price)
          </span>
          <span className="text-xl font-black text-red-400 mt-1 block">
            ৳{resellerPrice.toLocaleString("en-BD")}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Floor: ৳{floorPrice} | Max: ৳{ceilingPrice}
          </span>
        </div>

        {/* Reseller Custom Selling Price Input */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            আপনার বিক্রয় মূল্য (Selling Price BDT) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-xs">৳</span>
            <input
              type="number"
              min={floorPrice}
              max={ceilingPrice}
              value={sellingPriceInput}
              onChange={(e) => setSellingPriceInput(e.target.value)}
              placeholder="1500"
              className={`w-full min-h-[44px] pl-8 pr-3 py-2 bg-slate-950 border rounded-xl text-white font-extrabold text-sm focus:outline-none transition ${
                !isValid
                  ? "border-red-500 text-red-400 ring-2 ring-red-500/20"
                  : "border-red-500/40 focus:border-red-500 text-emerald-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Validation Error Box */}
      {!isValid && errorMessage && (
        <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-xl flex items-center space-x-2 text-xs text-red-400 font-semibold animate-pulse">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Calculated Stats Bar */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">
            নিট লাভ (Profit)
          </span>
          <span className="text-lg font-black text-emerald-400 flex items-center justify-center space-x-1 mt-0.5">
            <TrendingUp className="w-4 h-4" />
            <span>৳{isValid ? netProfit.toLocaleString("en-BD") : "0"}</span>
          </span>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl text-center">
          <span className="text-[10px] font-bold text-blue-400 uppercase block">
            মার্জিন (Margin)
          </span>
          <span className="text-lg font-black text-blue-400 flex items-center justify-center space-x-0.5 mt-0.5">
            <Percent className="w-4 h-4" />
            <span>{isValid ? profitMarginPercent : 0}%</span>
          </span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-center">
          <span className="text-[10px] font-bold text-amber-400 uppercase block">ROI</span>
          <span className="text-lg font-black text-amber-400 flex items-center justify-center space-x-0.5 mt-0.5">
            <ArrowUpRight className="w-4 h-4" />
            <span>{isValid ? roiPercent : 0}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
