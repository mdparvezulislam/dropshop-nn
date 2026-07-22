"use client";

import * as React from "react";
import { CurrencyInput } from "@/shared/components/forms/currency-input";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Calculator, AlertTriangle, Wand2, TrendingUp } from "lucide-react";
import { useSmartPricing } from "../../hooks/use-smart-pricing";

export interface PricingSectionProps {
  costPrice: string;
  onCostPriceChange: (v: string) => void;
  sellingPrice: string;
  onSellingPriceChange: (v: string) => void;
  wholesalePrice: string;
  onWholesalePriceChange: (v: string) => void;
  resellerPrice: string;
  onResellerPriceChange: (v: string) => void;
  comparePrice: string;
  onComparePriceChange: (v: string) => void;
  campaignPrice?: string;
  onCampaignPriceChange?: (v: string) => void;
  onApplyAutoPricing?: (partial: Record<string, string>) => void;
  showResetButton?: boolean;
  onResetAutoPricing?: () => void;
}

export function PricingSection({
  costPrice, onCostPriceChange,
  sellingPrice, onSellingPriceChange,
  wholesalePrice, onWholesalePriceChange,
  resellerPrice, onResellerPriceChange,
  comparePrice, onComparePriceChange,
  campaignPrice = "", onCampaignPriceChange,
  onApplyAutoPricing,
  showResetButton = false, onResetAutoPricing,
}: PricingSectionProps): React.ReactElement {
  const smartPricing = useSmartPricing({
    costPrice,
    sellingPrice,
    wholesalePrice,
    resellerPrice,
    comparePrice,
    campaignPrice,
  });

  const handleAutoCalculate = () => {
    if (smartPricing.cost <= 0) return;
    const generated = smartPricing.calculateAutoPrices(smartPricing.cost);
    if (onApplyAutoPricing && generated) {
      onApplyAutoPricing(generated as Record<string, string>);
    }
  };

  return (
    <StudioCollapsibleSection
      id="pricing"
      title="Pricing & Smart Profit Engine"
      description="Multi-tier pricing matrix, cost margin tracking, and automated profit rules"
      defaultExpanded={true}
      action={
        smartPricing.cost > 0 && onApplyAutoPricing ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={handleAutoCalculate}
            >
              <Wand2 className="h-3.5 w-3.5 text-primary" /> Auto Pricing (+30%/+20%/+12%)
            </Button>
            {showResetButton && onResetAutoPricing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs font-semibold text-warning"
                onClick={onResetAutoPricing}
              >
                Reset Auto Pricing
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {/* Price Validation Warnings Banner */}
      {smartPricing.warnings.length > 0 && (
        <div className="space-y-1.5">
          {smartPricing.warnings.map((warn, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-warning/30 bg-warning/10 text-warning text-xs font-bold shadow-2xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Cost Price" required hint="Supplier / manufacturing cost">
          <CurrencyInput value={costPrice} onChange={onCostPriceChange} currency="৳" />
        </FormField>
        <FormField label="Retail Selling Price" required hint="Customer checkout price">
          <CurrencyInput value={sellingPrice} onChange={onSellingPriceChange} currency="৳" />
        </FormField>
        <FormField label="Compare-at Price" hint="Strikethrough list price">
          <CurrencyInput value={comparePrice} onChange={onComparePriceChange} currency="৳" />
        </FormField>
        <FormField label="Wholesale Price" hint="B2B bulk partner price">
          <CurrencyInput value={wholesalePrice} onChange={onWholesalePriceChange} currency="৳" />
        </FormField>
        <FormField label="Reseller Price" hint="Reseller store cost">
          <CurrencyInput value={resellerPrice} onChange={onResellerPriceChange} currency="৳" />
        </FormField>
        <FormField label="Campaign Special Price" hint="Flash sale promo price">
          <CurrencyInput value={campaignPrice} onChange={onCampaignPriceChange || (() => {})} currency="৳" />
        </FormField>
      </div>

      {/* Live Profit & Margin Summary Card */}
      {smartPricing.retail > 0 ? (
        <Card className="bg-accent/40 border border-primary/30 rounded-xl shadow-2xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-primary" /> Live Profit & Margin Matrix
              </span>
              {smartPricing.discountPct > 0 ? (
                <Badge variant="destructive" size="xs">-{smartPricing.discountPct.toFixed(0)}% Off</Badge>
              ) : null}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Net Profit</p>
                <p className={`text-base font-extrabold font-mono ${smartPricing.profit >= 0 ? "text-success" : "text-destructive"}`}>
                  ৳{smartPricing.profit.toFixed(0)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Retail Margin</p>
                <p className={`text-base font-extrabold font-mono ${smartPricing.marginPct >= 0 ? "text-success" : "text-destructive"}`}>
                  {smartPricing.marginPct.toFixed(1)}%
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Markup %</p>
                <p className={`text-base font-extrabold font-mono ${smartPricing.markupPct >= 0 ? "text-success" : "text-destructive"}`}>
                  {smartPricing.markupPct.toFixed(1)}%
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Reseller Margin</p>
                <p className="text-base font-extrabold font-mono text-primary">
                  {smartPricing.reseller > 0 ? `${(((smartPricing.retail - smartPricing.reseller) / smartPricing.retail) * 100).toFixed(1)}%` : "—"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Wholesale Margin</p>
                <p className="text-base font-extrabold font-mono text-foreground">
                  {smartPricing.wholesale > 0 ? `${(((smartPricing.retail - smartPricing.wholesale) / smartPricing.retail) * 100).toFixed(1)}%` : "—"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Break-even Price</p>
                <p className="text-base font-extrabold font-mono text-foreground">
                  ৳{smartPricing.breakEven.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </StudioCollapsibleSection>
  );
}
