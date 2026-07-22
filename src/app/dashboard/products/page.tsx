"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  listProductsAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/features/catalog/actions/product-actions";
import {
  getCatalogSummaryStatsAction,
  inlineUpdateProductAction,
  type CatalogSummaryStats,
} from "@/features/catalog/actions/product-catalog-actions";
import { useCatalogWorkspace } from "@/features/catalog/hooks/use-catalog-workspace";
import { CatalogWorkspaceHeader } from "@/features/catalog/components/catalog-workspace-header";
import { CatalogSummaryCards } from "@/features/catalog/components/catalog-summary-cards";
import { CatalogTableView, type ProductCatalogItem } from "@/features/catalog/components/catalog-table-view";
import { CatalogGridView } from "@/features/catalog/components/catalog-grid-view";
import { CatalogAnalyticsView } from "@/features/catalog/components/catalog-analytics-view";
import { CatalogPreviewDrawer } from "@/features/catalog/components/catalog-preview-drawer";
import { CatalogBulkModal } from "@/features/catalog/components/modals/catalog-bulk-modal";
import { CatalogImportModal } from "@/features/catalog/components/modals/catalog-import-modal";
import { CatalogExportModal } from "@/features/catalog/components/modals/catalog-export-modal";

export default function ProductsMasterWorkspacePage(): React.ReactElement {
  const router = useRouter();
  const {
    activeTab, setActiveTab,
    viewMode, setViewMode,
    filters, updateFilter,
    selectedIds, setSelectedIds, toggleSelect, clearSelection,
    previewProductId, setPreviewProductId,
    bulkModalOpen, setBulkModalOpen,
    importModalOpen, setImportModalOpen,
    exportModalOpen, setExportModalOpen,
  } = useCatalogWorkspace();

  const [items, setItems] = React.useState<ProductCatalogItem[]>([]);
  const [stats, setStats] = React.useState<CatalogSummaryStats>({
    total: 0, active: 0, draft: 0, outOfStock: 0, lowStock: 0, campaign: 0,
  });
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        listProductsAction(
          {
            ...(activeTab === "active" ? { status: "active" } : {}),
            ...(activeTab === "draft" ? { status: "draft" } : {}),
            ...(activeTab === "archived" ? { status: "archived" } : {}),
            ...(filters.search ? { search: filters.search } : {}),
          },
          { limit: 100 },
        ),
        getCatalogSummaryStatsAction(),
      ]);

      if (listRes.success && listRes.data) {
        const d = listRes.data as any;
        const mapped: ProductCatalogItem[] = (d.items ?? []).map((p: any) => ({
          id: p.id,
          name: p.title ?? p.name ?? "Untitled Product",
          sku: p.sku ?? "SKU-PROD",
          category: p.category?.name ?? p.category ?? "General",
          brand: p.brand?.name ?? p.brand ?? "Default Brand",
          price: p.retailPrice ?? p.price ?? 1200,
          costPrice: p.costPrice ?? 800,
          stock: p.stockQuantity ?? p.stock ?? 25,
          status: p.status ?? "draft",
          image: p.images?.[0]?.url || (typeof p.images?.[0] === "string" ? p.images[0] : "") || p.image || "",
          updatedAt: p.updatedAt,
        }));

        let filtered = mapped;
        if (activeTab === "low_stock") {
          filtered = mapped.filter((x) => x.stock > 0 && x.stock <= 10);
        } else if (activeTab === "out_of_stock") {
          filtered = mapped.filter((x) => x.stock <= 0);
        }

        setItems(filtered);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      toast.error(" Failed to load product catalog");
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters.search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProductAction(id);
      toast.success("পণ্য মুছে ফেলা হয়েছে (Product deleted)");
      loadData();
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
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    }
  };

  const handleInlineUpdate = async (id: string, field: string, val: any) => {
    try {
      const res = await inlineUpdateProductAction(id, field, val);
      if (res.success) {
        toast.success("পণ্য তথ্য আপডেট হয়েছে (Product updated)");
        loadData();
      }
    } catch {
      toast.error("Inline edit failed");
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
