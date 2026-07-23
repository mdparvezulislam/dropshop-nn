"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Filter, RotateCcw } from "lucide-react";
import type { CatalogFilterState } from "../hooks/use-catalog-workspace";

export interface CatalogFilterPopoverProps {
  filters: CatalogFilterState;
  onUpdateFilter: (field: keyof CatalogFilterState, value: string) => void;
  onResetFilters: () => void;
}

export function CatalogFilterPopover({
  filters,
  onUpdateFilter,
  onResetFilters,
}: CatalogFilterPopoverProps): React.ReactElement {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card shadow-lg space-y-3 w-72">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" /> Advanced Filters
        </span>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="space-y-3">
        <FormField label="Status">
          <select
            value={filters.status}
            onChange={(e) => onUpdateFilter("status", e.target.value)}
            className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (সক্রিয়)</option>
            <option value="draft">Draft (খসড়া)</option>
            <option value="archived">Archived (আর্কাইভ)</option>
          </select>
        </FormField>

        <FormField label="Stock Status">
          <select
            value={filters.stockStatus}
            onChange={(e) => onUpdateFilter("stockStatus", e.target.value)}
            className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            <option value="all">All Inventory Levels</option>
            <option value="in_stock">In Stock (&gt; 10 pcs)</option>
            <option value="low_stock">Low Stock (&le; 10 pcs)</option>
            <option value="out_of_stock">Out of Stock (0 pcs)</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-2">
          <FormField label="Min Price (৳)">
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onUpdateFilter("minPrice", e.target.value)}
              placeholder="0"
              className="h-8 text-xs font-mono"
            />
          </FormField>
          <FormField label="Max Price (৳)">
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onUpdateFilter("maxPrice", e.target.value)}
              placeholder="50000"
              className="h-8 text-xs font-mono"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
