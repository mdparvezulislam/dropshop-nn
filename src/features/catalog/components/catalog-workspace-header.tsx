"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Plus,
  Search,
  Upload,
  Download,
  Layers,
  Table,
  LayoutGrid,
  BarChart3,
  ListFilter,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
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

const TABS: { id: CatalogTabId; labelBangla: string; labelEn: string }[] = [
  { id: "all", labelBangla: "সকল পণ্য", labelEn: "All Products" },
  { id: "active", labelBangla: "সক্রিয়", labelEn: "Active" },
  { id: "draft", labelBangla: "খসড়া", labelEn: "Drafts" },
  { id: "low_stock", labelBangla: "কম স্টক", labelEn: "Low Stock" },
  { id: "out_of_stock", labelBangla: "স্টকে নেই", labelEn: "Out of Stock" },
  { id: "campaign", labelBangla: "ক্যাম্পেইন", labelEn: "Campaign" },
  { id: "archived", labelBangla: "আর্কাইভ", labelEn: "Archived" },
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
    <div className="space-y-4">
      {/* Title & Quick CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              পণ্য ক্যাটালগ <span className="text-muted-foreground font-semibold text-sm">(Product Catalog)</span>
            </h1>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              <Sparkles className="h-3 w-3 mr-1" /> Enterprise OS
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Master inventory matrix, multi-tier pricing, channels, and automated catalog operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={onOpenBulk}>
              <Layers className="h-3.5 w-3.5 text-primary" /> Bulk Actions ({selectedCount})
            </Button>
          )}

          <Button size="sm" variant="outline" className="gap-1 text-xs font-semibold" onClick={onOpenImport}>
            <Upload className="h-3.5 w-3.5" /> Import (CSV/Excel)
          </Button>

          <Button size="sm" variant="outline" className="gap-1 text-xs font-semibold" onClick={onOpenExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>

          <Link href="/dashboard/products/new">
            <Button size="sm" className="gap-1.5 font-extrabold shadow-xs">
              <Plus className="h-4 w-4" /> নতুন পণ্য (Add Product)
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Saved Views Tabs */}
        <div className="ws-scroll flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1",
                  active
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>{tab.labelBangla}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.labelEn})</span>
              </button>
            );
          })}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search title, SKU, brand, category…"
              className="h-8.5 pl-9 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "rounded-md p-1 text-xs transition-all",
                viewMode === "table" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Table View"
            >
              <Table className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("compact")}
              className={cn(
                "rounded-md p-1 text-xs transition-all",
                viewMode === "compact" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Compact View"
            >
              <ListFilter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "rounded-md p-1 text-xs transition-all",
                viewMode === "grid" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("analytics")}
              className={cn(
                "rounded-md p-1 text-xs transition-all",
                viewMode === "analytics" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Analytics View"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
