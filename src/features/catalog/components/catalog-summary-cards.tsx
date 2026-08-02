"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, FileEdit, AlertTriangle, XCircle, Archive } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CatalogSummaryStats } from "../actions/product-catalog-actions";
import type { CatalogTabId } from "../hooks/use-catalog-workspace";

export interface CatalogSummaryCardsProps {
  stats: CatalogSummaryStats;
  loading: boolean;
  activeTab: CatalogTabId;
  onSelectTab: (tab: CatalogTabId) => void;
}

export function CatalogSummaryCards({
  stats,
  loading,
  activeTab,
  onSelectTab,
}: CatalogSummaryCardsProps): React.ReactElement {
  const items = [
    {
      id: "all" as CatalogTabId,
      label: "Total Products",
      count: stats.total,
      icon: Package,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "active" as CatalogTabId,
      label: "Active",
      count: stats.active,
      icon: CheckCircle2,
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "draft" as CatalogTabId,
      label: "Drafts",
      count: stats.draft,
      icon: FileEdit,
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "low_stock" as CatalogTabId,
      label: "Low Stock",
      count: stats.lowStock,
      icon: AlertTriangle,
      accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      id: "out_of_stock" as CatalogTabId,
      label: "Out of Stock",
      count: stats.outOfStock,
      icon: XCircle,
      accent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      id: "archived" as CatalogTabId,
      label: "Archived",
      count: stats.archived,
      icon: Archive,
      accent: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <Card
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={cn(
              "cursor-pointer transition-all border shadow-2xs group active:scale-95 touch-manipulation",
              isActive
                ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                : "border-border hover:border-primary/40 bg-card",
            )}
          >
            <CardContent className="p-2.5 sm:p-3 flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105",
                  item.accent,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                  {item.label}
                </p>
                <p className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                  {loading ? "-" : item.count.toLocaleString("en-US")}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
