"use client";

import { useState } from "react";
import { ProductCard, type ProductCardData } from "./product-card";
import { ShopToolbar } from "./shop-toolbar";
import { CatalogFilterSidebar } from "./catalog-filter-sidebar";
import { QuickViewDrawer } from "./quick-view-drawer";
import { CompareDrawer } from "./compare-drawer";
import type { Category, Brand } from "@/features/catalog/domain/classification-entity";
import { SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import Link from "next/link";

interface ProductsCatalogClientProps {
  initialProducts: ProductCardData[];
  categories: Category[];
  brands: Brand[];
}

export function ProductsCatalogClient({
  initialProducts,
  categories,
  brands,
}: ProductsCatalogClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "compact" | "list">("grid");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);
  const [compareList, setCompareList] = useState<ProductCardData[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleCompare = (product: ProductCardData) => {
    if (compareList.some((p) => p.id === product.id)) return;
    if (compareList.length >= 4) return;
    setCompareList((prev) => [...prev, product]);
  };

  const handleRemoveCompare = (id: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Sticky Shop Toolbar */}
      <ShopToolbar
        totalItems={initialProducts.length}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onMobileFilterToggle={() => setMobileFilterOpen(!mobileFilterOpen)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <CatalogFilterSidebar categories={categories} brands={brands} />
        </div>

        {/* Mobile Drawer Filter */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-5 max-w-sm ml-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="text-sm font-extrabold text-foreground">ফিল্টার অপশন</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-foreground"
                >
                  বন্ধ করুন ✕
                </button>
              </div>
              <CatalogFilterSidebar categories={categories} brands={brands} />
            </div>
          </div>
        )}

        {/* Main Product Grid / List */}
        <div className="lg:col-span-3">
          {initialProducts.length === 0 ? (
            <div className="rounded-3xl bg-white border border-border/80 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                আপনার ফিল্টার অথবা অনুসন্ধানের কি-ওয়ার্ড পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                ফিল্টার রিসেট করুন
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  : viewMode === "compact"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5"
                    : "space-y-4"
              }
            >
              {initialProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  viewMode={viewMode}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                  onCompare={handleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Drawer */}
      <QuickViewDrawer product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Compare Floating Bar */}
      <CompareDrawer
        products={compareList}
        onRemove={handleRemoveCompare}
        onClear={() => setCompareList([])}
      />
    </div>
  );
}

export default ProductsCatalogClient;
