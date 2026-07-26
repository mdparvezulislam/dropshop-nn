"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteProductAction,
  duplicateProductAction,
} from "@/features/catalog/actions/product-actions";
import {
  getCatalogSummaryStatsAction,
  inlineUpdateProductAction,
  listCatalogProductsAction,
  type CatalogSummaryStats,
} from "@/features/catalog/actions/product-catalog-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useCatalogWorkspace } from "@/features/catalog/hooks/use-catalog-workspace";
import { CatalogWorkspaceHeader } from "@/features/catalog/components/catalog-workspace-header";
import { CatalogSummaryCards } from "@/features/catalog/components/catalog-summary-cards";
import {
  CatalogTableView,
  type ProductCatalogItem,
} from "@/features/catalog/components/catalog-table-view";
import { CatalogGridView } from "@/features/catalog/components/catalog-grid-view";
import { CatalogAnalyticsView } from "@/features/catalog/components/catalog-analytics-view";
import { CatalogPreviewDrawer } from "@/features/catalog/components/catalog-preview-drawer";
import { CatalogBulkModal } from "@/features/catalog/components/modals/catalog-bulk-modal";
import { CatalogImportModal } from "@/features/catalog/components/modals/catalog-import-modal";
import { CatalogExportModal } from "@/features/catalog/components/modals/catalog-export-modal";

const PAGE_SIZE = 50;

export default function ProductsMasterWorkspacePage(): React.ReactElement {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    filters,
    updateFilter,
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
  } = useCatalogWorkspace();

  const [items, setItems] = React.useState<ProductCatalogItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [stats, setStats] = React.useState<CatalogSummaryStats>({
    total: 0,
    active: 0,
    draft: 0,
    archived: 0,
    outOfStock: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = React.useState(true);

  // Search previously re-queried the server on every keystroke.
  const debouncedSearch = useDebounce(filters.search, 350);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        listCatalogProductsAction({
          tab: activeTab,
          search: debouncedSearch || undefined,
          limit: PAGE_SIZE,
        }),
        getCatalogSummaryStatsAction(),
      ]);

      if (listRes.success && listRes.data) {
        setItems(listRes.data.items);
        setTotalCount(listRes.data.totalCount);
      } else {
        setItems([]);
        setTotalCount(0);
        toast.error(listRes.error || "Failed to load product catalog");
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else if (statsRes.error) {
        toast.error(statsRes.error);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load product catalog");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // A tab or search change invalidates the current selection.
  React.useEffect(() => {
    clearSelection();
  }, [activeTab, debouncedSearch, clearSelection]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProductAction(id);
      if (res.success) {
        toast.success("পণ্য মুছে ফেলা হয়েছে (Product deleted)");
        loadData();
      } else {
        toast.error(res.error || "Delete failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await duplicateProductAction(id);
      if (res.success) {
        toast.success("পণ্য কপি করা হয়েছে (Product duplicated)");
        loadData();
      } else {
        toast.error(res.error || "Duplicate failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    }
  };

  const handleInlineUpdate = async (id: string, field: string, val: string) => {
    try {
      const res = await inlineUpdateProductAction(id, field, val);
      if (res.success) {
        toast.success("পণ্য তথ্য আপডেট হয়েছে (Product updated)");
        loadData();
      } else {
        // Inline-edit failures used to be swallowed, leaving the old value on screen
        // with no indication the write never happened.
        toast.error(res.error || "Inline edit failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Inline edit failed");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      clearSelection();
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Workspace Header */}
      <CatalogWorkspaceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={filters.search}
        onSearchChange={(v) => updateFilter("search", v)}
        selectedCount={selectedIds.length}
        onOpenBulk={() => setBulkModalOpen(true)}
        onOpenImport={() => setImportModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
      />

      {/* KPI Summary Cards Bar */}
      <CatalogSummaryCards
        stats={stats}
        loading={loading}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main View Mode Content */}
      {viewMode === "table" || viewMode === "compact" ? (
        <CatalogTableView
          items={items}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onPreview={(id) => setPreviewProductId(id)}
          onInlineUpdate={handleInlineUpdate}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ) : viewMode === "grid" ? (
        <CatalogGridView
          items={items}
          loading={loading}
          onPreview={(id) => setPreviewProductId(id)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ) : (
        <CatalogAnalyticsView items={items} />
      )}

      {/* Slide-over Preview Drawer */}
      <CatalogPreviewDrawer
        productId={previewProductId}
        onClose={() => setPreviewProductId(null)}
      />

      {/* Modals */}
      <CatalogBulkModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        selectedIds={selectedIds}
        onComplete={() => {
          clearSelection();
          loadData();
        }}
      />

      <CatalogImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onComplete={loadData}
      />

      <CatalogExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        selectedIds={selectedIds}
      />
    </div>
  );
}
