"use client";

import * as React from "react";
import { CurrencyInput } from "@/components/forms/currency-input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  AlertTriangle,
  Wand2,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
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

type PriceField =
  | "costPrice"
  | "sellingPrice"
  | "wholesalePrice"
  | "resellerPrice"
  | "comparePrice"
  | "campaignPrice";

export function PricingSection({
  costPrice,
  onCostPriceChange,
  sellingPrice,
  onSellingPriceChange,
  wholesalePrice,
  onWholesalePriceChange,
  resellerPrice,
  onResellerPriceChange,
  comparePrice,
  onComparePriceChange,
  campaignPrice = "",
  onCampaignPriceChange,
  onApplyAutoPricing,
  showResetButton = false,
  onResetAutoPricing,
}: PricingSectionProps): React.ReactElement {
  const smartPricing = useSmartPricing({
    costPrice,
    sellingPrice,
    wholesalePrice,
    resellerPrice,
    comparePrice,
    campaignPrice,
  });

  const [focusedField, setFocusedField] = React.useState<PriceField | null>(null);

  const handleAutoCalculate = () => {
    if (smartPricing.cost <= 0) return;
    const generated = smartPricing.calculateAutoPrices(smartPricing.cost);
    if (onApplyAutoPricing && generated) {
      onApplyAutoPricing(generated as Record<string, string>);
    }
  };

  const handleFieldFocus = (field: PriceField) => setFocusedField(field);
  const handleFieldBlur = () => setFocusedField(null);

  /* ── Price rows — spreadsheet-like grid ── */
  const priceRows: {
    key: PriceField;
    label: string;
    value: string;
    onChange: (v: string) => void;
    hint: string;
    required?: boolean;
  }[] = [
    {
      key: "costPrice",
      label: "Cost Price",
      value: costPrice,
      onChange: onCostPriceChange,
      hint: "Supplier cost",
      required: true,
    },
    {
      key: "sellingPrice",
      label: "Retail Price",
      value: sellingPrice,
      onChange: onSellingPriceChange,
      hint: "Customer price",
      required: true,
    },
    {
      key: "wholesalePrice",
      label: "Wholesale Price",
      value: wholesalePrice,
      onChange: onWholesalePriceChange,
      hint: "B2B bulk price",
    },
    {
      key: "resellerPrice",
      label: "Reseller Price",
      value: resellerPrice,
      onChange: onResellerPriceChange,
      hint: "Reseller cost",
    },
    {
      key: "comparePrice",
      label: "Compare-at Price",
      value: comparePrice,
      onChange: onComparePriceChange,
      hint: "Strikethrough list",
    },
    {
      key: "campaignPrice",
      label: "Campaign Price",
      value: campaignPrice,
      onChange: onCampaignPriceChange ?? (() => {}),
      hint: "Flash sale promo",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Pricing Grid ── */}

      {/* Mobile: Card per price tier */}
      <div className="sm:hidden space-y-2.5">
        {priceRows.map((row) => {
          const numVal = parseFloat(row.value) || 0;
          const markupPct =
            smartPricing.cost > 0 && row.key !== "costPrice" && numVal > 0
              ? ((numVal - smartPricing.cost) / smartPricing.cost) * 100
              : 0;
          const marginPct =
            numVal > 0 && row.key !== "costPrice"
              ? ((numVal - smartPricing.cost) / numVal) * 100
              : 0;
          const isCost = row.key === "costPrice";

          return (
            <div
              key={row.key}
              className={cn(
                "rounded-xl border border-border bg-card p-3.5 space-y-2.5",
                row.key === "campaignPrice" ? "border-dashed" : "",
              )}
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">
                  {row.label}
                  {row.required && <span className="text-destructive ml-0.5">*</span>}
                </label>
                <span className="text-[11px] font-semibold text-muted-foreground">{row.hint}</span>
              </div>

              <CurrencyInput
                value={row.value}
                onChange={row.onChange}
                currency="৳"
                className={cn(
                  "h-11 text-base",
                  isCost ? "font-extrabold text-amber-600 dark:text-amber-400" : "font-semibold",
                )}
                onFocus={() => handleFieldFocus(row.key)}
                onBlur={handleFieldBlur}
              />

              {!isCost && numVal > 0 && (
                <div className="flex gap-4 text-xs font-semibold">
                  <span
                    className={cn(
                      markupPct > 0
                        ? "text-success"
                        : markupPct < 0
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    Markup: {markupPct >= 0 ? "+" : ""}
                    {markupPct.toFixed(0)}%
                  </span>
                  <span
                    className={cn(
                      marginPct > 15
                        ? "text-success"
                        : marginPct > 0
                          ? "text-warning"
                          : marginPct < 0
                            ? "text-destructive"
                            : "text-muted-foreground",
                    )}
                  >
                    Margin: {marginPct.toFixed(1)}%
                  </span>
                </div>
              )}
              {isCost && (
                <span className="text-xs text-muted-foreground font-medium">
                  Markup: — Margin: —
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet: Spreadsheet grid */}
      <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_2rem] gap-3 px-4 py-2.5 bg-muted/30 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Price Tier</span>
          <span>Amount (৳)</span>
          <span>Markup %</span>
          <span>Margin %</span>
          <span />
        </div>

        {/* Body rows */}
        {priceRows.map((row) => {
          const numVal = parseFloat(row.value) || 0;
          const markupPct =
            smartPricing.cost > 0 && row.key !== "costPrice" && numVal > 0
              ? ((numVal - smartPricing.cost) / smartPricing.cost) * 100
              : 0;
          const marginPct =
            numVal > 0 && row.key !== "costPrice"
              ? ((numVal - smartPricing.cost) / numVal) * 100
              : 0;
          const isCost = row.key === "costPrice";
          const isFocused = focusedField === row.key;

          return (
            <div
              key={row.key}
              className={cn(
                "grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_2rem] gap-3 items-center px-4 py-2 transition-colors",
                isFocused ? "bg-primary/5" : "hover:bg-muted/20",
                row.key === "campaignPrice" ? "border-t border-dashed border-border/50" : "",
              )}
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                {isCost && <span className="text-[10px] font-bold text-muted-foreground">1.</span>}
                {row.label}
                {row.required && <span className="text-destructive">*</span>}
              </label>

              <CurrencyInput
                value={row.value}
                onChange={row.onChange}
                currency="৳"
                className={cn(
                  "h-8 text-sm",
                  isCost ? "font-extrabold text-amber-600 dark:text-amber-400" : "font-semibold",
                )}
                onFocus={() => handleFieldFocus(row.key)}
                onBlur={handleFieldBlur}
              />

              <span
                className={cn(
                  "text-sm font-mono font-semibold",
                  markupPct > 0
                    ? "text-success"
                    : markupPct < 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                )}
              >
                {isCost
                  ? "—"
                  : numVal > 0
                    ? `${markupPct >= 0 ? "+" : ""}${markupPct.toFixed(0)}%`
                    : "—"}
              </span>

              <span
                className={cn(
                  "text-sm font-mono font-semibold",
                  marginPct > 15
                    ? "text-success"
                    : marginPct > 0
                      ? "text-warning"
                      : marginPct < 0
                        ? "text-destructive"
                        : "text-muted-foreground",
                )}
              >
                {isCost ? "—" : numVal > 0 ? `${marginPct.toFixed(1)}%` : "—"}
              </span>

              <div />
            </div>
          );
        })}
      </div>

      {/* ── Smart Price Assistant Warnings ── */}
      {smartPricing.warnings.length > 0 && (
        <div className="space-y-1.5">
          {smartPricing.warnings.map((warn, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-xl border border-warning/30 bg-warning/10 text-warning text-xs font-bold shadow-2xs"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
          {smartPricing.retail > 0 &&
            smartPricing.marginPct < 10 &&
            smartPricing.marginPct >= 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-info/30 bg-info/10 text-info text-xs font-bold shadow-2xs">
                <Info className="h-4 w-4 shrink-0" />
                <span>Low margin alert. Consider increasing retail price or reducing cost.</span>
              </div>
            )}
        </div>
      )}

      {/* ── Live Sticky Summary Bar ── */}
      {smartPricing.retail > 0 && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/[0.02] rounded-xl shadow-xs sm:sticky sm:bottom-2 z-10">
          <CardContent className="p-4 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-primary" /> Live Pricing Summary
              </span>
              <div className="flex items-center gap-2">
                {smartPricing.cost > 0 && onApplyAutoPricing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs font-semibold h-7"
                    onClick={handleAutoCalculate}
                  >
                    <Wand2 className="h-3 w-3 text-primary" /> Auto
                  </Button>
                )}
                {showResetButton && onResetAutoPricing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs font-semibold text-warning h-7"
                    onClick={onResetAutoPricing}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <SummaryCell
                label="Cost"
                value={`৳${smartPricing.cost.toFixed(0)}`}
                className="text-amber-600 dark:text-amber-400"
              />
              <SummaryCell
                label="Retail"
                value={`৳${smartPricing.retail.toFixed(0)}`}
                className="text-foreground font-extrabold"
              />
              <SummaryCell
                label="Profit"
                value={`৳${smartPricing.profit.toFixed(0)}`}
                className={smartPricing.profit >= 0 ? "text-success" : "text-destructive"}
                icon={
                  smartPricing.profit > 0
                    ? TrendingUp
                    : smartPricing.profit < 0
                      ? TrendingDown
                      : Minus
                }
              />
              <SummaryCell
                label="Margin"
                value={`${smartPricing.marginPct.toFixed(1)}%`}
                positive={smartPricing.marginPct > 10}
              />
              <SummaryCell
                label="Markup"
                value={`${smartPricing.markupPct.toFixed(1)}%`}
                positive={smartPricing.markupPct > 15}
              />
              <SummaryCell label="Break-even" value={`৳${smartPricing.breakEven.toFixed(0)}`} />
            </div>

            {/* Channel Diffs */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
              {smartPricing.wholesale > 0 && (
                <ChannelDiff
                  label="Wholesale vs Retail"
                  diff={smartPricing.retail - smartPricing.wholesale}
                />
              )}
              {smartPricing.reseller > 0 && (
                <ChannelDiff
                  label="Reseller vs Retail"
                  diff={smartPricing.retail - smartPricing.reseller}
                />
              )}
              {smartPricing.compare > 0 && (
                <ChannelDiff
                  label="Compare-at vs Retail"
                  diff={smartPricing.compare - smartPricing.retail}
                  negative
                />
              )}
              {smartPricing.campaign > 0 && (
                <ChannelDiff
                  label="Campaign vs Retail"
                  diff={smartPricing.campaign - smartPricing.retail}
                  negative
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Summary Cell ── */

function SummaryCell({
  label,
  value,
  className,
  icon: Icon,
  positive,
}: {
  label: string;
  value: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  positive?: boolean;
}): React.ReactElement {
  return (
    <div className="p-3 sm:p-2 rounded-xl sm:rounded-lg border border-border bg-card/80">
      <p className="text-xs sm:text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
        {Icon && (
          <Icon
            className={cn(
              "h-3.5 w-3.5 sm:h-3 sm:w-3",
              positive !== undefined && (positive ? "text-success" : "text-destructive"),
            )}
          />
        )}
        {label}
      </p>
      <p className={cn("text-base sm:text-sm font-extrabold font-mono mt-0.5", className)}>
        {value}
      </p>
    </div>
  );
}

/* ── Channel Diff Badge ── */

function ChannelDiff({
  label,
  diff,
  negative,
}: {
  label: string;
  diff: number;
  negative?: boolean;
}): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      {label}:{" "}
      <span className={cn("font-bold", diff > 0 ? "text-success" : "text-destructive")}>
        {negative ? "" : "৳"}
        {diff > 0 ? "+" : ""}{" "}
        {negative ? `${diff > 0 ? "+" : ""}${diff > 0 ? "higher" : "lower"}` : `৳${diff}`}
      </span>
    </span>
  );
}

export default PricingSection;
