"use client";

import * as React from "react";
import type { CatalogSummaryStats } from "../actions/product-catalog-actions";

export type CatalogViewMode = "table" | "compact" | "grid" | "analytics";

export type CatalogTabId =
  | "all"
  | "active"
  | "draft"
  | "low_stock"
  | "out_of_stock"
  | "campaign"
  | "archived";

export interface CatalogFilterState {
  search: string;
  category: string;
  brand: string;
  status: string;
  stockStatus: string;
  minPrice: string;
  maxPrice: string;
}

const INITIAL_FILTERS: CatalogFilterState = {
  search: "",
  category: "all",
  brand: "all",
  status: "all",
  stockStatus: "all",
  minPrice: "",
  maxPrice: "",
};

export function useCatalogWorkspace() {
  const [activeTab, setActiveTab] = React.useState<CatalogTabId>("all");
  const [viewMode, setViewMode] = React.useState<CatalogViewMode>("table");
  const [filters, setFilters] = React.useState<CatalogFilterState>(INITIAL_FILTERS);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [previewProductId, setPreviewProductId] = React.useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);

  const updateFilter = React.useCallback((field: keyof CatalogFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    filters,
    updateFilter,
    resetFilters,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    clearSelection,
    previewProductId,
    setPreviewProductId,
    bulkModalOpen,
    setBulkModalOpen,
    importModalOpen,
    setImportModalOpen,
    exportModalOpen,
    setExportModalOpen,
  };
}
