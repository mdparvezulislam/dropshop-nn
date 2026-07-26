"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Package,
  History,
  ExternalLink,
  RefreshCw,
  Building2,
  Hash,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";
import { cn } from "@/lib/utils/cn";

export interface CostPanelProduct {
  productId: string;
  name: string;
  sku: string;
  image?: string;
  currentCost: number;
  currentLandedCost: number;
  currentVersion: number;
  supplierName?: string;
  lastUpdated?: string;
  currency: string;
  sellingPrice?: number;
  profitMargin?: number;
  profitAmount?: number;
}

interface Props {
  product: CostPanelProduct;
  onRefresh?: () => void;
  className?: string;
}

export default function CostPanel({ product, onRefresh, className }: Props): React.ReactElement {
  return (
    <Card className={cn("overflow-hidden border-primary/20", className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-44 h-44 sm:h-auto bg-muted relative shrink-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="176px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate">{product.name}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
                <span className="font-mono">{product.sku}</span>
                {product.supplierName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {product.supplierName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Link href={`/dashboard/products/${product.productId}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Open Product Studio">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  title="Refresh"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CostValue
              label="বর্তমান খরচ (Cost)"
              value={product.currentCost}
              currency={product.currency}
              bold
            />
            <CostValue
              label="Landed Cost"
              value={product.currentLandedCost}
              currency={product.currency}
            />
            {product.sellingPrice !== undefined && (
              <CostValue
                label="Retail Price"
                value={product.sellingPrice}
                currency={product.currency}
              />
            )}
            <div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Version
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-bold">v{product.currentVersion}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {product.profitMargin !== undefined && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span
                  className={cn(
                    "font-semibold",
                    product.profitMargin > 20
                      ? "text-success"
                      : product.profitMargin > 5
                        ? "text-warning"
                        : "text-destructive",
                  )}
                >
                  {product.profitMargin.toFixed(1)}% মার্জিন
                </span>
                {product.profitAmount !== undefined && (
                  <span className="text-muted-foreground">
                    ({formatCentsToCurrency(product.profitAmount, product.currency)})
                  </span>
                )}
              </div>
            )}
            {product.lastUpdated && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(product.lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
            <Link href={`/dashboard/costs?update=${product.productId}`}>
              <Button size="sm">
                <DollarSign className="h-3.5 w-3.5" /> Update Cost
              </Button>
            </Link>
            <Link href={`/dashboard/costs?history=${product.productId}`}>
              <Button variant="outline" size="sm">
                <History className="h-3.5 w-3.5" /> History
              </Button>
            </Link>
            <Link href={`/dashboard/costs?compare=${product.productId}`}>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5" /> Compare
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CostValue({
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
  if (!value && value !== 0) return <div />;
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
