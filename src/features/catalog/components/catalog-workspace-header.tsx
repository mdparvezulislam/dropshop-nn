"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Upload,
  Download,
  Layers,
  Table,
  LayoutGrid,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CatalogTabId, CatalogViewMode } from "../hooks/use-catalog-workspace";

export interface CatalogWorkspaceHeaderProps {
  activeTab: CatalogTabId;
  onTabChange: (tab: CatalogTabId) => void;
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  search: string;
  onSearchChange: (search: string) => void;
  selectedCount: number;
  onOpenBulk: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
}

const TABS: { id: CatalogTabId; label: string }[] = [
  { id: "all", label: "All Products" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Drafts" },
  { id: "low_stock", label: "Low Stock" },
  { id: "out_of_stock", label: "Out of Stock" },
  { id: "campaign", label: "Campaign" },
  { id: "archived", label: "Archived" },
];

export function CatalogWorkspaceHeader({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  selectedCount,
  onOpenBulk,
  onOpenImport,
  onOpenExport,
}: CatalogWorkspaceHeaderProps): React.ReactElement {
  return (
    <div className="space-y-3">
      {/* Title & Primary Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Product Catalog
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" /> Inventory Matrix
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {selectedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold shrink-0"
              onClick={onOpenBulk}
            >
              <Layers className="h-3.5 w-3.5 text-primary" /> Bulk ({selectedCount})
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs font-semibold shrink-0"
            onClick={onOpenImport}
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs font-semibold shrink-0"
            onClick={onOpenExport}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>

          <Link href="/dashboard/products/new" className="shrink-0">
            <Button size="sm" className="gap-1.5 text-xs font-bold shadow-xs">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Touch-Friendly Swipeable Filter Tabs */}
      <div className="flex items-center overflow-x-auto border-b border-border/80 pb-px scrollbar-none gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              "px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px rounded-t-lg touch-manipulation",
              activeTab === t.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar & Desktop View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by title, SKU, brand..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-card border-border shadow-2xs"
          />
        </div>

        {/* View Mode Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-1 rounded-xl border border-border bg-card p-1 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
              viewMode === "table" || viewMode === "compact"
                ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Table className="h-3.5 w-3.5" /> Table
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("analytics")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
              viewMode === "analytics"
                ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
