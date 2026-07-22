"use client";

import * as React from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, Package, Building2, ExternalLink, RefreshCw, ChevronRight } from "lucide-react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";
import { cn } from "@/shared/utils/cn";

interface CostData {
  costPrice: number;
  landedCost: number;
  versionNumber: number;
  currency: string;
  supplier?: { supplierName?: string; supplierSku?: string };
  importCost?: number;
  shippingCost?: number;
  packagingCost?: number;
  handlingCost?: number;
  otherExpenses?: number;
  reason?: string;
  previousCostPrice?: number;
  previousLandedCost?: number;
  createdBy?: string;
}

interface Props {
  productId: string;
  className?: string;
}

export function CostStudioSection({ productId, className }: Props): React.ReactElement {
  const [costData, setCostData] = React.useState<CostData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const loadCost = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { getCurrentCostAction } = await import("@/features/cost/actions/cost-actions");
      const res = await getCurrentCostAction(productId);
      if (res.success && res.data) {
        setCostData({
          costPrice: res.data.costPrice,
          landedCost: res.data.landedCost,
          versionNumber: res.data.versionNumber,
          currency: res.data.currency ?? "BDT",
          supplier: res.data.supplier,
          importCost: res.data.importCost,
          shippingCost: res.data.shippingCost,
          packagingCost: res.data.packagingCost,
          handlingCost: res.data.handlingCost,
          otherExpenses: res.data.otherExpenses,
          reason: res.data.reason,
          previousCostPrice: res.data.previousCostPrice,
          previousLandedCost: res.data.previousLandedCost,
          createdBy: res.data.createdBy,
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    loadCost();
  }, [loadCost]);

  const costDiff = costData?.previousCostPrice
    ? costData.costPrice - costData.previousCostPrice
    : 0;

  const landedDiff = costData?.previousLandedCost
    ? costData.landedCost - costData.previousLandedCost
    : 0;

  const expenseFields = [
    { label: "Import Cost", value: costData?.importCost },
    { label: "Shipping Cost", value: costData?.shippingCost },
    { label: "Packaging Cost", value: costData?.packagingCost },
    { label: "Handling Cost", value: costData?.handlingCost },
    { label: "Other Expenses", value: costData?.otherExpenses },
  ];

  return (
    <StudioCollapsibleSection
      id="cost-intelligence"
      title="Cost Intelligence"
      description="পণ্যের খরচ ও ব্যয় বিশ্লেষণ (Current cost & landed cost breakdown)"
      className={className}
      badge={costData ? <Badge variant="outline" size="xs">v{costData.versionNumber}</Badge> : undefined}
      action={
        <Button variant="outline" size="sm">
          <Link href={`/dashboard/costs?history=${productId}`} className="flex items-center gap-1">
            Full History <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Spinner size="sm" /> <span className="ml-2 text-xs">Loading cost data…</span>
        </div>
      ) : error || !costData ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
          <DollarSign className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs font-semibold">No cost version recorded yet</p>
              <Button variant="outline" size="sm">
                <Link href={`/dashboard/costs?update=${productId}`} className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Record First Cost
                </Link>
              </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Current Cost</p>
              <p className="text-lg font-extrabold text-foreground">
                {formatCentsToCurrency(costData.costPrice, costData.currency)}
              </p>
              {costDiff !== 0 && (
                <span className={cn("text-[11px] font-bold mt-0.5 flex items-center gap-0.5",
                  costDiff > 0 ? "text-destructive" : "text-success"
                )}>
                  {costDiff > 0 ? "+" : ""}{formatCentsToCurrency(costDiff, costData.currency)}
                </span>
              )}
            </div>
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Landed Cost</p>
              <p className="text-lg font-extrabold text-foreground">
                {formatCentsToCurrency(costData.landedCost, costData.currency)}
              </p>
              {landedDiff !== 0 && (
                <span className={cn("text-[11px] font-bold mt-0.5 flex items-center gap-0.5",
                  landedDiff > 0 ? "text-destructive" : "text-success"
                )}>
                  {landedDiff > 0 ? "+" : ""}{formatCentsToCurrency(landedDiff, costData.currency)}
                </span>
              )}
            </div>
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Reason</p>
              <p className="text-sm font-bold text-foreground capitalize">
                {costData.reason?.replace(/_/g, " ") ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Supplier</p>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground truncate">
                  {costData.supplier?.supplierName ?? "—"}
                </p>
              </div>
              {costData.supplier?.supplierSku && (
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  SKU: {costData.supplier.supplierSku}
                </p>
              )}
            </div>
          </div>

          {expenseFields.some((f) => (f.value ?? 0) > 0) && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">Landed Cost Breakdown</p>
              <div className="grid gap-2 sm:grid-cols-5">
                {expenseFields.map((f) => (
                  <div key={f.label} className="rounded-lg bg-muted/30 px-3 py-2 border border-border/60 text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground">{f.label}</p>
                    <p className="text-xs font-extrabold text-foreground mt-0.5">
                      {formatCentsToCurrency(f.value ?? 0, costData.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadCost}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Link href={`/dashboard/costs?update=${productId}`} className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Update Cost
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Link href={`/dashboard/costs?history=${productId}`} className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> Timeline
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Link href={`/dashboard/costs?compare=${productId}`} className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Compare
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </StudioCollapsibleSection>
  );
}
