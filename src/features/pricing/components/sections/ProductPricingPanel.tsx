"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Shield,
  Lock,
  Unlock,
  History,
  ExternalLink,
  Copy,
  RotateCcw,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";
import { cn } from "@/lib/utils/cn";

export interface ProductPricingData {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  image?: string;
  brandName?: string;
  categoryName?: string;
  supplierName?: string;
  baseCostPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  resellerPrice: number;
  comparePrice?: number;
  promotionalPrice?: number;
  profitMargin: number;
  profitAmount: number;
  currency: string;
  pricingRule: string;
  status: string;
  pricingProfile?: string;
  isOverridden: boolean;
  isLocked: boolean;
  availableStock: number;
  lastPriceUpdate?: string;
  productHealth: number;
}

interface Props {
  product: ProductPricingData;
  onRecalculate?: (productId: string) => void;
  onOverrideToggle?: (productId: string, locked: boolean) => void;
  className?: string;
}

export default function ProductPricingPanel({
  product,
  onRecalculate,
  onOverrideToggle,
  className,
}: Props): React.ReactElement {
  const [recalculating, setRecalculating] = React.useState(false);
  const [locked, setLocked] = React.useState(product.isLocked);

  const handleRecalculate = async () => {
    if (locked) {
      toast.error("Price is locked. Unlock first.");
      return;
    }
    setRecalculating(true);
    try {
      const { recalculatePricesAction } = await import("../../actions/pricing-engine-actions");
      const res = await recalculatePricesAction(product.productId);
      if (res.success) toast.success("Prices recalculated");
      else toast.error(res.error ?? "Failed");
      onRecalculate?.(product.productId);
    } catch {
      toast.error("Recalculation failed");
    } finally {
      setRecalculating(false);
    }
  };

  const stockLabel =
    product.availableStock > 10
      ? "in_stock"
      : product.availableStock > 0
        ? "low_stock"
        : "out_of_stock";
  const marginTone =
    product.profitMargin > 20 ? "success" : product.profitMargin > 5 ? "warning" : "danger";

  return (
    <Card className={cn("overflow-hidden border-primary/20", className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted relative shrink-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant={product.status === "active" ? "success" : "muted"} size="xs">
              {product.status}
            </Badge>
          </div>
          {locked && (
            <div className="absolute top-2 right-2">
              <Lock className="h-4 w-4 text-warning" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate">{product.name}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
                <span className="font-mono">{product.sku}</span>
                {product.barcode && <span className="font-mono">Barcode: {product.barcode}</span>}
                {product.brandName && <span>{product.brandName}</span>}
                {product.categoryName && <span>{product.categoryName}</span>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Link href={`/dashboard/products/${product.productId}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Open Product Studio">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(product.productId);
                  toast.success("ID copied");
                }}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                title="Copy Product ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PriceCell
              label="খরচ (Cost)"
              value={product.baseCostPrice}
              currency={product.currency}
            />
            <PriceCell
              label="Retail"
              value={product.sellingPrice}
              currency={product.currency}
              bold
            />
            <PriceCell
              label="Wholesale"
              value={product.wholesalePrice}
              currency={product.currency}
            />
            <PriceCell label="Reseller" value={product.resellerPrice} currency={product.currency} />
          </div>

          {product.promotionalPrice && product.promotionalPrice > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Percent className="h-4 w-4 text-warning shrink-0" />
              <span className="text-xs font-semibold">Campaign Price:</span>
              <span className="text-sm font-bold text-warning">
                {formatCentsToCurrency(product.promotionalPrice, product.currency)}
              </span>
              {product.comparePrice && product.comparePrice > product.sellingPrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatCentsToCurrency(product.comparePrice, product.currency)}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span
                className={cn(
                  "font-semibold",
                  marginTone === "success"
                    ? "text-success"
                    : marginTone === "warning"
                      ? "text-warning"
                      : "text-destructive",
                )}
              >
                {product.profitMargin.toFixed(1)}% মার্জিন
              </span>
              <span className="text-muted-foreground">
                ({formatCentsToCurrency(product.profitAmount, product.currency)})
              </span>
            </div>
            <StatusChip
              label={stockLabel.replace("_", " ")}
              tone={
                stockLabel === "in_stock"
                  ? "success"
                  : stockLabel === "low_stock"
                    ? "warning"
                    : "danger"
              }
            />
            {product.isOverridden && (
              <Badge variant="warning" size="xs">
                Manual Override
              </Badge>
            )}
            {product.pricingProfile && (
              <Badge variant="soft" size="xs">
                {product.pricingProfile}
              </Badge>
            )}
            {product.lastPriceUpdate && (
              <span className="text-muted-foreground">
                Updated {new Date(product.lastPriceUpdate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              loading={recalculating}
              disabled={locked}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Recalculate
            </Button>
            <Link href={`/dashboard/pricing/history?productId=${product.productId}`}>
              <Button variant="outline" size="sm">
                <History className="h-3.5 w-3.5" /> History
              </Button>
            </Link>
            <Link href={`/dashboard/pricing/${product.id}`}>
              <Button variant="outline" size="sm">
                <DollarSign className="h-3.5 w-3.5" /> Edit Pricing
              </Button>
            </Link>
            <button
              onClick={() => {
                setLocked(!locked);
                onOverrideToggle?.(product.productId, !locked);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors",
                locked
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-border hover:bg-muted",
              )}
            >
              {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              {locked ? "Locked" : "Lock Price"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PriceCell({
  label,
  value,
  currency,
  bold,
}: {
  label: string;
  value: number;
  currency: string;
  bold?: boolean;
}): React.ReactElement {
  if (!value) return <div />;
  return (
    <div>
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn(
          "tabular-nums mt-0.5",
          bold ? "text-base font-bold" : "text-sm font-semibold",
        )}
      >
        {formatCentsToCurrency(value, currency)}
      </div>
    </div>
  );
}
