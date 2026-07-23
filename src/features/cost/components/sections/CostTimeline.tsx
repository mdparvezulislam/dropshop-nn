"use client";

import * as React from "react";
import { Clock, ArrowUp, ArrowDown, Building2, User, CheckCircle, XCircle } from "lucide-react";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";
import { formatRelativeTime } from "@/lib/utils/date-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface TimelineEntry {
  id: string;
  versionNumber: number;
  costPrice: number;
  landedCost: number;
  previousCostPrice?: number;
  previousLandedCost?: number;
  supplier?: { supplierName?: string };
  reason: string;
  reasonText?: string;
  changedByName?: string;
  approvalStatus: string;
  effectiveDate: string;
  createdAt: string;
  currency: string;
}

interface Props {
  entries: TimelineEntry[];
  className?: string;
}

const reasonLabels: Record<string, string> = {
  supplier_price_increased: "Supplier Price Increased",
  supplier_price_decreased: "Supplier Price Decreased",
  new_shipment: "New Shipment",
  import_cost_updated: "Import Cost Updated",
  manual_correction: "Manual Correction",
  currency_adjustment: "Currency Adjustment",
  promotion: "Promotion",
  replacement_supplier: "Replacement Supplier",
  other: "Other",
};

export default function CostTimeline({ entries, className }: Props): React.ReactElement {
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm font-semibold">No cost history yet</p>
        <p className="text-xs mt-1">Cost updates will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {entries.map((entry, idx) => {
        const diff = entry.previousCostPrice ? entry.costPrice - entry.previousCostPrice : 0;
        const diffPct = entry.previousCostPrice && entry.previousCostPrice > 0
          ? Math.round((diff / entry.previousCostPrice) * 10000) / 100
          : 0;
        const isIncrease = diff > 0;
        const isLast = idx === entries.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6">
            {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />}

            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-2 ring-background",
              isIncrease ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" :
              diff < 0 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
              "bg-muted text-muted-foreground",
            )}>
              {isIncrease ? <ArrowUp className="h-3 w-3" /> :
               diff < 0 ? <ArrowDown className="h-3 w-3" /> :
               <Clock className="h-3 w-3" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold">v{entry.versionNumber}</span>
                <Badge variant={entry.approvalStatus === "approved" ? "success" : entry.approvalStatus === "rejected" ? "destructive" : "warning"} size="xs">
                  {entry.approvalStatus}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(new Date(entry.createdAt))}
                </span>
              </div>

              <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-[11px] text-muted-foreground">Old Cost</span>
                  <div className="font-mono text-xs text-destructive">
                    {entry.previousCostPrice !== undefined ? formatCentsToCurrency(entry.previousCostPrice, entry.currency) : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">New Cost</span>
                  <div className="font-mono text-xs font-semibold text-success">
                    {formatCentsToCurrency(entry.costPrice, entry.currency)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Difference</span>
                  <div className={cn("font-mono text-xs font-semibold", isIncrease ? "text-rose-500" : diff < 0 ? "text-emerald-500" : "")}>
                    {diff !== 0 ? `${isIncrease ? "+" : ""}${formatCentsToCurrency(Math.abs(diff), entry.currency)} (${diffPct > 0 ? "+" : ""}${diffPct}%)` : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Landed Cost</span>
                  <div className="font-mono text-xs">{formatCentsToCurrency(entry.landedCost, entry.currency)}</div>
                </div>
              </div>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                <span>{reasonLabels[entry.reason] ?? entry.reason}</span>
                {entry.supplier?.supplierName && (
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{entry.supplier.supplierName}</span>
                )}
                {entry.changedByName && (
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{entry.changedByName}</span>
                )}
              </div>

              {entry.reasonText && (
                <div className="mt-0.5 text-[11px] text-muted-foreground italic">&ldquo;{entry.reasonText}&rdquo;</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
