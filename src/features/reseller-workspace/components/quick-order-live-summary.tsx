"use client";

import * as React from "react";
import { TrendingUp, Truck, Plus, ShieldAlert, DollarSign, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectedOrderProduct } from "./quick-order-product-search";
import { CustomerFormData } from "./quick-order-customer-form";

export interface QuickOrderLiveSummaryProps {
  products: SelectedOrderProduct[];
  customer: CustomerFormData;
  deliveryChargeTaka: number;
  onDeliveryChargeChange: (val: number) => void;
  advancePaidTaka: number;
  onAdvancePaidChange: (val: number) => void;
  submitting: boolean;
  onSubmitOrder: () => void;
}

export function QuickOrderLiveSummary({
  products,
  customer,
  deliveryChargeTaka,
  onDeliveryChargeChange,
  advancePaidTaka,
  onAdvancePaidChange,
  submitting,
  onSubmitOrder,
}: QuickOrderLiveSummaryProps): React.ReactElement {
  const isDhaka = (customer.district || "Dhaka").toLowerCase().includes("dhaka");
  const standardCourierCostTaka = isDhaka ? 60 : 120;

  let subtotalTaka = 0;
  let costSubtotalTaka = 0;
  let totalItemsCount = 0;
  let allPricesValid = products.length > 0;

  for (const item of products) {
    const unitSelling = Math.round(item.customSellingPrice / 100);
    const unitCost = Math.round(item.wholesaleCost / 100);
    const qty = item.quantity || 1;

    subtotalTaka += unitSelling * qty;
    costSubtotalTaka += unitCost * qty;
    totalItemsCount += qty;

    if (item.customSellingPrice < item.minPrice) {
      allPricesValid = false;
    }
  }

  const grandTotalTaka = subtotalTaka > 0 ? subtotalTaka + deliveryChargeTaka : 0;
  const dueTaka = Math.max(0, grandTotalTaka - advancePaidTaka);

  const profitTaka = (subtotalTaka - costSubtotalTaka) + (deliveryChargeTaka - standardCourierCostTaka);

  const marginPercent = subtotalTaka > 0 ? Math.round((profitTaka / subtotalTaka) * 100) : 0;
  const roiPercent = costSubtotalTaka > 0 ? Math.round((profitTaka / costSubtotalTaka) * 100) : 0;

  const hasCustomerInfo = Boolean(customer.name.trim() && customer.phone.trim() && customer.fullAddress.trim());
  const isReadyToSubmit = products.length > 0 && allPricesValid && hasCustomerInfo && !submitting;

  return (
    <Card className="border-amber-300 dark:border-amber-500/30 bg-white dark:bg-slate-900 shadow-xl overflow-hidden rounded-2xl">
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-500/20 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-amber-900 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Receipt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> ৩. লাইভ সেলস সামারি
          </h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
            {totalItemsCount} টি আইটেম
          </span>
        </div>
      </div>

      <CardContent className="p-2.5 sm:p-5 space-y-2.5 sm:space-y-4">
        {/* Selected Products Breakdown List */}
        {products.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {products.map((item, idx) => {
              const unitSelling = Math.round(item.customSellingPrice / 100);
              const lineTotal = unitSelling * item.quantity;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                      ৳{unitSelling} × {item.quantity} টি
                    </p>
                  </div>
                  <p className="font-black text-slate-900 dark:text-slate-100 text-xs tabular-nums shrink-0">
                    ৳{lineTotal}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            কোনো প্রোডাক্ট নির্বাচন করা হয়নি...
          </div>
        )}



        {/* Financial Breakdown */}
        <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-semibold">
            <span>পণ্যের সাবটোটাল ({totalItemsCount} টি আইটেম):</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">৳{subtotalTaka}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> কুরিয়ার ফি (স্ট্যান্ডার্ড {isDhaka ? "৳৬০" : "৳১২০"}):
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">৳{deliveryChargeTaka}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">সর্বমোট কাস্টমার বিল:</span>
            <span className="font-black text-amber-600 dark:text-amber-400 text-lg sm:text-xl tabular-nums">৳{grandTotalTaka}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
            <span className="font-black text-slate-900 dark:text-slate-100 text-xs">বাকি বকেয়া (Due Collection):</span>
            <span className="font-black text-rose-600 dark:text-rose-400 text-base tabular-nums">৳{grandTotalTaka}</span>
          </div>
        </div>

        {/* Reseller Earnings & Profit Card */}
        <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> আপনার নিট প্রফিট
              </span>
              {deliveryChargeTaka !== standardCourierCostTaka && (
                <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400">
                  ({deliveryChargeTaka < standardCourierCostTaka ? `কুরিয়ার খরচ ৳${standardCourierCostTaka - deliveryChargeTaka} লাভ থেকে বাদ` : `অতিরিক্ত ৳${deliveryChargeTaka - standardCourierCostTaka} লাভে যোগ`})
                </span>
              )}
            </div>
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full">
              {marginPercent}% MARGIN
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                {profitTaka >= 0 ? `+৳${profitTaka}` : `-৳${Math.abs(profitTaka)}`}
              </p>
              <p className="text-[10px] font-bold text-emerald-800/80 dark:text-emerald-300/80">
                মোট Resell Price: ৳{costSubtotalTaka} • ROI: {roiPercent}%
              </p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-300 dark:text-emerald-600 shrink-0" />
          </div>
        </div>

        {/* Warnings */}
        {products.length > 0 && !allPricesValid && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>বিক্রয় মূল্য Resell Price এর চেয়ে কম রাখা যাবে না!</span>
          </div>
        )}

        {!hasCustomerInfo && (
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 text-center">
            ⚠️ কাস্টমারের নাম, ফোন নম্বর ও সম্পূর্ণ ঠিকানা প্রদান করুন।
          </p>
        )}

        {/* Action Button */}
        <Button
          onClick={onSubmitOrder}
          disabled={!isReadyToSubmit}
          className="w-full h-11 sm:h-12 text-xs sm:text-sm font-black gap-1.5 shadow-md bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          {submitting ? "অর্ডার প্রসেসিং হচ্ছে..." : "অর্ডার নিশ্চিত করুন (Create Order)"}
        </Button>
      </CardContent>
    </Card>
  );
}
