"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

export interface CompareVersion {
  id: string;
  versionNumber: number;
  costPrice: number;
  landedCost: number;
  supplier?: { supplierName?: string };
  reason: string;
  reasonText?: string;
  changedByName?: string;
  effectiveDate: string;
  currency: string;
  costPriceDisplay?: number;
  profitMargin?: number;
  profitAmount?: number;
}

interface Props {
  versionA: CompareVersion;
  versionB: CompareVersion;
  costDifference: number;
  costDifferencePercent: number;
  landedCostDifference: number;
  landedCostDifferencePercent: number;
  isIncrease: boolean;
  className?: string;
}

export default function CostCompare({
  versionA, versionB, costDifference, costDifferencePercent,
  landedCostDifference, landedCostDifferencePercent, isIncrease, className,
}: Props): React.ReactElement {
  const currency = versionB.currency;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Compare Versions
          <Badge variant="soft" size="xs">v{versionA.versionNumber} vs v{versionB.versionNumber}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Field</th>
              <th className="text-right py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">v{versionA.versionNumber}</th>
              <th className="text-right py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">v{versionB.versionNumber}</th>
              <th className="text-right py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <CompareRow label="Cost Price" a={versionA.costPrice} b={versionB.costPrice} currency={currency} />
            <CompareRow label="Landed Cost" a={versionA.landedCost} b={versionB.landedCost} currency={currency} />
            <CompareRow label="Profit" a={versionA.profitAmount ?? 0} b={versionB.profitAmount ?? 0} currency={currency} />
            <tr>
              <td className="py-2 font-medium">Profit Margin</td>
              <td className={cn("py-2 text-right font-mono", marginColor(versionA.profitMargin))}>{versionA.profitMargin?.toFixed(1)}%</td>
              <td className={cn("py-2 text-right font-mono", marginColor(versionB.profitMargin))}>{versionB.profitMargin?.toFixed(1)}%</td>
              <td className="py-2 text-right font-mono text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Supplier</td>
              <td className="py-2 text-right text-xs text-muted-foreground">{versionA.supplier?.supplierName ?? "—"}</td>
              <td className="py-2 text-right text-xs text-muted-foreground">{versionB.supplier?.supplierName ?? "—"}</td>
              <td className="py-2 text-right">—</td>
            </tr>
          </tbody>
        </table>

        <div className={cn(
          "rounded-lg p-3 text-sm flex items-center gap-2",
          isIncrease ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
        )}>
          {isIncrease ? <ArrowUp className="h-4 w-4 shrink-0" /> : costDifference < 0 ? <ArrowDown className="h-4 w-4 shrink-0" /> : <Minus className="h-4 w-4 shrink-0" />}
          <span>
            {isIncrease
              ? `খরচ ${formatCentsToCurrency(costDifference, currency)} বেড়েছে`
              : costDifference < 0
                ? `খরচ ${formatCentsToCurrency(Math.abs(costDifference), currency)} কমেছে`
                : "কোনো পরিবর্তন হয়নি"}
            . প্রতি ইউনিটে লাভ আনুমানিক {isIncrease
              ? `${formatCentsToCurrency(costDifference, currency)} কমবে`
              : costDifference < 0
                ? `${formatCentsToCurrency(Math.abs(costDifference), currency)} বাড়বে`
                : "অপরিবর্তিত"}
            .
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CompareRow({ label, a, b, currency }: { label: string; a: number; b: number; currency: string }) {
  const diff = b - a;
  const diffPct = a > 0 ? Math.round((diff / a) * 10000) / 100 : 0;
  const isPos = diff > 0;
  return (
    <tr>
      <td className="py-2 font-medium">{label}</td>
      <td className="py-2 text-right font-mono">{formatCentsToCurrency(a, currency)}</td>
      <td className="py-2 text-right font-mono font-semibold">{formatCentsToCurrency(b, currency)}</td>
      <td className={cn("py-2 text-right font-mono text-xs", isPos ? "text-rose-500" : diff < 0 ? "text-emerald-500" : "")}>
        {diff !== 0 ? `${isPos ? "+" : ""}${formatCentsToCurrency(Math.abs(diff), currency)} (${diffPct > 0 ? "+" : ""}${diffPct}%)` : "—"}
      </td>
    </tr>
  );
}

function marginColor(m?: number): string {
  if (m === undefined) return "";
  if (m > 20) return "text-success";
  if (m > 5) return "text-warning";
  return "text-destructive";
}
