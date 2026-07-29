"use client";

import * as React from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calculator,
  ShieldAlert,
  Percent,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface ResellerProfitCalculatorProps {
  mrp: number; // in cents
  wholesaleCost: number; // in cents
  minPrice: number; // in cents
  suggestedPrice: number; // in cents
  onPriceChange?: (isValid: boolean, priceInCents: number, profitInCents: number) => void;
}

export function ResellerProfitCalculator({
  mrp,
  wholesaleCost,
  minPrice,
  suggestedPrice,
  onPriceChange,
}: ResellerProfitCalculatorProps): React.ReactElement {
  // Input in BDT (Taka)
  const initialTaka = Math.round(suggestedPrice / 100);
  const minTaka = Math.round(minPrice / 100);
  const costTaka = Math.round(wholesaleCost / 100);
  const mrpTaka = Math.round(mrp / 100);

  const [sellingPriceInput, setSellingPriceInput] = React.useState<string>(String(initialTaka));
  const [deliveryArea, setDeliveryArea] = React.useState<"inside" | "outside">("inside");

  const currentPriceTaka = parseFloat(sellingPriceInput) || 0;
  const currentPriceCents = Math.round(currentPriceTaka * 100);

  // Business Rule: Custom Selling Price cannot be lower than Minimum Price
  const isValid = currentPriceTaka >= minTaka && currentPriceTaka > 0;

  // Live Math Calculations
  const grossProfitTaka = currentPriceTaka - costTaka;
  const grossProfitCents = Math.round(grossProfitTaka * 100);

  const marginPercent =
    currentPriceTaka > 0 ? Math.round((grossProfitTaka / currentPriceTaka) * 100) : 0;

  const roiPercent = costTaka > 0 ? Math.round((grossProfitTaka / costTaka) * 100) : 0;

  const deliveryCostTaka = deliveryArea === "inside" ? 80 : 150;

  React.useEffect(() => {
    if (!isValid && currentPriceTaka > 0) {
      toast.error("নূন্যতম বিক্রয় মূল্য (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)");
    }
    if (onPriceChange) {
      onPriceChange(isValid, currentPriceCents, grossProfitCents);
    }
  }, [currentPriceTaka, isValid, currentPriceCents, grossProfitCents, onPriceChange]);

  const handleReset = () => {
    setSellingPriceInput(String(initialTaka));
    toast.info("সাজেস্টেড মূল্যে রিসেট করা হয়েছে");
  };

  return (
    <Card className="border-primary/30 bg-card shadow-md overflow-hidden">
      <div className="bg-primary/10 border-b border-primary/20 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-black text-xs sm:text-sm uppercase tracking-wider">
          <Calculator className="w-4 h-4" /> রিসেলার প্রফিট ক্যালকুলেটর
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> রিসেট
        </button>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Price Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Custom Selling Price Entry */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-black text-foreground flex items-center justify-between">
              <span>আপনার বিক্রয় মূল্য (কাস্টমারের জন্য) ৳:</span>
              <span className="text-[11px] font-bold text-muted-foreground">
                নূন্যতম বিক্রয় মূল্য: ৳{minTaka}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-foreground text-sm">
                ৳
              </span>
              <input
                type="number"
                min={minTaka}
                step={10}
                value={sellingPriceInput}
                onChange={(e) => setSellingPriceInput(e.target.value)}
                placeholder={`নূন্যতম ৳${minTaka}`}
                className={cn(
                  "w-full h-12 pl-8 pr-4 rounded-xl border bg-background text-sm sm:text-base font-black text-foreground outline-none transition-colors",
                  !isValid
                    ? "border-destructive text-destructive bg-destructive/5 focus:border-destructive"
                    : "border-border focus:border-primary",
                )}
              />
            </div>

            {/* Validation Alert */}
            {!isValid && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-black flex items-center gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>নূন্যতম বিক্রয় মূল্য (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)</span>
              </div>
            )}
          </div>

          {/* Reference Price Readouts */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">
              হোলসেল কেনা মূল্য (Cost Basis)
            </span>
            <p className="text-sm sm:text-base font-black text-foreground tabular-nums">৳{costTaka}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">
              সাজেস্টেড মূল্যে বিক্রয়
            </span>
            <p className="text-sm sm:text-base font-black text-primary tabular-nums">৳{initialTaka}</p>
          </div>
        </div>

        {/* Live Earnings Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-success tracking-wider">
              নিট প্রফিট (Net Profit)
            </span>
            <p
              className={cn(
                "text-lg sm:text-xl font-black tabular-nums",
                grossProfitTaka >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {grossProfitTaka >= 0 ? `+৳${grossProfitTaka}` : `-৳${Math.abs(grossProfitTaka)}`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-primary tracking-wider">
              প্রফিট মার্জিন
            </span>
            <p className="text-lg sm:text-xl font-black text-primary tabular-nums">{marginPercent}%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
              রিটার্ন অন ইনভেস্টমেন্ট (ROI)
            </span>
            <p className="text-lg sm:text-xl font-black text-blue-500 tabular-nums">{roiPercent}%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
              কাস্টমার সেভিংস (MRP)
            </span>
            <p className="text-lg sm:text-xl font-black text-amber-500 tabular-nums">
              ৳{Math.max(0, mrpTaka - currentPriceTaka)}
            </p>
          </div>
        </div>

        {/* Delivery Impact Selector */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" /> ডেলিভারি চার্জ প্রভাব (কাস্টমার প্রদান করবে)
            </span>
            <span className="font-mono text-primary font-black">৳{deliveryCostTaka}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDeliveryArea("inside")}
              className={cn(
                "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center",
                deliveryArea === "inside"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground",
              )}
            >
              ঢাকার ভেতরে (৳৮০)
            </button>
            <button
              type="button"
              onClick={() => setDeliveryArea("outside")}
              className={cn(
                "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center",
                deliveryArea === "outside"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground",
              )}
            >
              ঢাকার বাইরে (৳১৫০)
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
