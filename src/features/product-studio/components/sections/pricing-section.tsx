"use client";

import * as React from "react";
import { CurrencyInput } from "@/shared/components/forms/currency-input";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { StudioSection } from "../studio-layout";

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
}

export function PricingSection({
  costPrice, onCostPriceChange,
  sellingPrice, onSellingPriceChange,
  wholesalePrice, onWholesalePriceChange,
  resellerPrice, onResellerPriceChange,
  comparePrice, onComparePriceChange,
}: PricingSectionProps): React.ReactElement {
  const cost = parseFloat(costPrice) || 0;
  const sell = parseFloat(sellingPrice) || 0;
  const wholesale = parseFloat(wholesalePrice) || 0;
  const reseller = parseFloat(resellerPrice) || 0;
  const compare = parseFloat(comparePrice) || 0;

  const profit = sell - cost;
  const margin = sell > 0 ? (profit / sell) * 100 : 0;
  const hasDiscount = compare > 0 && sell < compare;
  const discountPct = compare > 0 ? ((compare - sell) / compare) * 100 : 0;

  return (
    <StudioSection id="pricing" title="Pricing" description="Price tiers, profit preview, and rules">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Cost price" hint="What you pay">
          <CurrencyInput value={costPrice} onChange={onCostPriceChange} currency="$" />
        </FormField>
        <FormField label="Compare at" hint="Original / crossed-out price">
          <CurrencyInput value={comparePrice} onChange={onComparePriceChange} currency="$" />
        </FormField>
        <FormField label="Selling price" required hint="Customer checkout price">
          <CurrencyInput value={sellingPrice} onChange={onSellingPriceChange} currency="$" />
        </FormField>
        <FormField label="Wholesale price" hint="B2B partner price">
          <CurrencyInput value={wholesalePrice} onChange={onWholesalePriceChange} currency="$" />
        </FormField>
        <FormField label="Reseller price" hint="Reseller catalog price">
          <CurrencyInput value={resellerPrice} onChange={onResellerPriceChange} currency="$" />
        </FormField>
      </div>

      {sell > 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profit</span>
              <span className={profit >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                ${profit.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Margin</span>
              <span className={margin >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                {margin.toFixed(1)}%
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Wholesale margin</span>
              <span className={wholesale > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                {wholesale > 0 ? `${(((sell - wholesale) / sell) * 100).toFixed(1)}%` : "—"}
              </span>
            </div>
            {hasDiscount ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <Badge variant="success">-{discountPct.toFixed(0)}% off</Badge>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </StudioSection>
  );
}
