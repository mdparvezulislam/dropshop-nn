"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { TrendingUp, DollarSign, Warehouse, BarChart2, ShieldCheck, AlertTriangle } from "lucide-react";
import type { ProductCatalogItem } from "./catalog-table-view";

export interface CatalogAnalyticsViewProps {
  items: ProductCatalogItem[];
}

export function CatalogAnalyticsView({ items }: CatalogAnalyticsViewProps): React.ReactElement {
  const totalValue = React.useMemo(() => {
    return items.reduce((acc, p) => acc + p.price * p.stock, 0);
  }, [items]);

  const avgPrice = React.useMemo(() => {
    if (items.length === 0) return 0;
    return items.reduce((acc, p) => acc + p.price, 0) / items.length;
  }, [items]);

  const categoryBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
            <span>ক্যাটালগ মোট মূল্য (Inventory Value)</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-extrabold font-mono text-foreground mt-2">
            ৳{totalValue.toLocaleString()}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground mt-1">
            Total physical inventory valuation across warehouses.
          </p>
        </Card>

        <Card className="border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
            <span>গড় পণ্য মূল্য (Average Price)</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-xl font-extrabold font-mono text-foreground mt-2">
            ৳{Math.round(avgPrice).toLocaleString()}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground mt-1">
            Average retail listed price per catalog SKU.
          </p>
        </Card>

        <Card className="border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
            <span>স্টক টার্নওভার স্বাস্থ্য (Stock Health)</span>
            <Warehouse className="h-4 w-4 text-warning" />
          </div>
          <p className="text-xl font-extrabold font-mono text-success mt-2">
            94.2%
          </p>
          <p className="text-[11px] font-medium text-muted-foreground mt-1">
            In-stock ratio across active sales channels.
          </p>
        </Card>
      </div>

      {/* Category Breakdown Matrix */}
      <Card className="border-border bg-card shadow-2xs p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BarChart2 className="h-4 w-4 text-primary" /> ক্যাটাগরিভিত্তিক বণ্টন (Category Breakdown)
        </h3>

        <div className="space-y-2">
          {categoryBreakdown.map(([cat, count]) => {
            const pct = items.length > 0 ? (count / items.length) * 100 : 0;
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>{cat}</span>
                  <span className="font-mono text-muted-foreground">{count} items ({pct.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${pct}%` }} className="h-full bg-primary" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
