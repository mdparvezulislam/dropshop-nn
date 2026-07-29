"use client";

import * as React from "react";
import {
  ShoppingCart,
  TrendingUp,
  Truck,
  Plus,
  ShieldAlert,
  DollarSign,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { SelectedOrderProduct } from "./quick-order-product-search";
import { CustomerFormData } from "./quick-order-customer-form";

export interface QuickOrderLiveSummaryProps {
  product: SelectedOrderProduct | null;
  customer: CustomerFormData;
  submitting: boolean;
  onSubmitOrder: () => void;
}

export function QuickOrderLiveSummary({
  product,
  customer,
  submitting,
  onSubmitOrder,
}: QuickOrderLiveSummaryProps): React.ReactElement {
  const isDhaka = (customer.district || "Dhaka").toLowerCase().includes("dhaka");
  const deliveryChargeTaka = isDhaka ? 80 : 150;

  const unitSellingPriceTaka = product ? Math.round(product.customSellingPrice / 100) : 0;
  const unitCostTaka = product ? Math.round(product.wholesaleCost / 100) : 0;
  const minPriceTaka = product ? Math.round(product.minPrice / 100) : 0;
  const qty = product ? product.quantity : 1;

  const isPriceValid = product ? product.customSellingPrice >= product.minPrice : false;
  const hasCustomerInfo = Boolean(customer.name.trim() && customer.phone.trim() && customer.fullAddress.trim());

  const subtotalTaka = unitSellingPriceTaka * qty;
  const grandTotalTaka = subtotalTaka + deliveryChargeTaka;
  const costSubtotalTaka = unitCostTaka * qty;
  const profitTaka = subtotalTaka - costSubtotalTaka;

  const marginPercent = subtotalTaka > 0 ? Math.round((profitTaka / subtotalTaka) * 100) : 0;
  const roiPercent = costSubtotalTaka > 0 ? Math.round((profitTaka / costSubtotalTaka) * 100) : 0;

  const isReadyToSubmit = product && isPriceValid && hasCustomerInfo && !submitting;

  return (
    <Card className="border-primary/30 bg-card shadow-md overflow-hidden">
      <div className="bg-primary/10 border-b border-primary/20 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-wider">
            <Receipt className="w-4 h-4" /> ৩. লাইভ সেলস সামারি (Step 6)
          </h3>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
            Sales Desk
          </span>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Selected Product Line */}
        {product ? (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-black text-foreground truncate">{product.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                ৳{unitSellingPriceTaka} × {qty} টি
              </p>
            </div>
            <p className="font-black text-foreground text-sm tabular-nums">
              ৳{subtotalTaka}
            </p>
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-semibold text-muted-foreground border border-dashed border-border/80 rounded-xl">
            পণ্য নির্বাচন করুন...
          </div>
        )}

        {/* Financial Breakdown Table */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span>পণ্য সাবটোটাল:</span>
            <span className="text-foreground font-bold tabular-nums">৳{subtotalTaka}</span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-primary" /> ডেলিভারি চার্জ ({isDhaka ? "ঢাকা" : "ঢাকার বাইরে"}):
            </span>
            <span className="text-foreground font-bold tabular-nums">৳{deliveryChargeTaka}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="font-black text-foreground text-sm">কাস্টমার পরিশোধ করবে:</span>
            <span className="font-black text-primary text-lg tabular-nums">৳{grandTotalTaka}</span>
          </div>
        </div>

        {/* Reseller Earnings & Profit Card */}
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-success tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> আপনার নিট ইনকাম (Earnings)
            </span>
            <span className="text-[11px] font-black text-success uppercase">
              {marginPercent}% Margin
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <p className="text-2xl font-black text-success tabular-nums">
                {profitTaka >= 0 ? `+৳${profitTaka}` : `-৳${Math.abs(profitTaka)}`}
              </p>
              <p className="text-[10px] font-bold text-success/80">
                কেনা খরচ: ৳{costSubtotalTaka} • ROI: {roiPercent}%
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-success/40" />
          </div>
        </div>

        {/* Price Integrity Warning Alert */}
        {product && !isPriceValid && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>নূন্যতম বিক্রয় মূল্য (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)</span>
          </div>
        )}

        {!hasCustomerInfo && (
          <p className="text-[11px] font-bold text-amber-500 text-center">
            ⚠️ কাস্টমারের নাম, ফোন নম্বর ও সম্পূর্ণ ঠিকানা প্রদান করুন।
          </p>
        )}

        {/* Action Button */}
        <Button
          onClick={onSubmitOrder}
          disabled={!isReadyToSubmit}
          className="w-full h-12 text-sm font-black gap-2 shadow-md disabled:opacity-50"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          {submitting ? "অর্ডার প্রসেসিং হচ্ছে..." : "অর্ডার নিশ্চিত করুন (Create Order)"}
        </Button>
      </CardContent>
    </Card>
  );
}
