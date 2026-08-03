"use client";

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { RotateCcw, PackageSearch } from "lucide-react";
import { ProductCard } from "./product-card";
import { ShopToolbar, type CatalogViewMode } from "./shop-toolbar";
import { CatalogFilterSidebar } from "./catalog-filter-sidebar";
import { AppliedFilterChips } from "./applied-filter-chips";
import { QuickViewDrawer } from "./quick-view-drawer";
import { CompareDrawer } from "./compare-drawer";
import { MobileBottomSheet } from "@/shared/components/mobile/mobile-bottom-sheet";
import { PlpCategoryChips } from "./plp-category-chips";
import type {
  PublicBrandInfo,
  PublicCategoryInfo,
  PublicProductCard,
} from "@/features/catalog/domain/public-catalog-types";

export interface ProductsCatalogClientProps {
  products: PublicProductCard[];
  totalCount: number;
  categories: PublicCategoryInfo[] | null;
  brands: PublicBrandInfo[] | null;
  pagination?: ReactNode;
  defaultSort?: "newest" | "relevance";
  showSearchBox?: boolean;
  resetHref?: string;
}

export function ProductsCatalogClient({
  products,
  totalCount,
  categories,
  brands,
  pagination,
  defaultSort = "newest",
  showSearchBox = true,
  resetHref = "/products",
}: ProductsCatalogClientProps): ReactElement {
  const [viewMode, setViewMode] = useState<CatalogViewMode>("grid");
  const [quickViewProduct, setQuickViewProduct] = useState<PublicProductCard | null>(null);
  const [compareList, setCompareList] = useState<PublicProductCard[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    mobileCloseButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setMobileFilterOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [mobileFilterOpen]);

  const handleCompare = (product: PublicProductCard): void => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === product.id) || prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (id: string): void => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Mobile Horizontal Category Chips */}
      <PlpCategoryChips categories={categories} />

      {/* Sticky Toolbar (Total count, sort dropdown, view mode toggle, mobile filter button) */}
      <ShopToolbar
        totalCount={totalCount}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onMobileFilterToggle={() => setMobileFilterOpen((open) => !open)}
        defaultSort={defaultSort}
        showSearchBox={showSearchBox}
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:gap-8 lg:grid-cols-4">
        
        {/* Desktop Sticky Filter Sidebar */}
        <div className="hidden lg:col-span-1 lg:block sticky top-24">
          <CatalogFilterSidebar categories={categories} brands={brands} />
        </div>

        {/* Mobile Bottom Sheet Filter Drawer */}
        <MobileBottomSheet
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="প্রোডাক্ট ফিল্টার"
          description="আপনার পছন্দ অনুযায়ী ক্যাটালগ ফিল্টার করুন"
        >
          <div className="pt-2">
            <CatalogFilterSidebar categories={categories} brands={brands} />
          </div>
        </MobileBottomSheet>

        {/* Product Grid & Active Filter Chips Container */}
        <div className="lg:col-span-3">
          
          {/* Active Filter Chips with Individual Dismiss (x) */}
          <AppliedFilterChips categories={categories} brands={brands} resetHref={resetHref} />

          {products.length === 0 ? (
            /* Enhanced Empty State with SVG Illustration */
            <div className="space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 sm:p-14 text-center shadow-xs">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <PackageSearch className="h-10 w-10 stroke-[1.5]" aria-hidden />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  কোনো প্রোডাক্ট পাওয়া যায়নি
                </h3>
                <p className="mx-auto max-w-md text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  আপনার নির্বাচিত ফিল্টার বা কি-ওয়ার্ডের জন্য কোনো ম্যাচিং প্রোডাক্ট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে ফিল্টারগুলো শিথিল করুন।
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={resetHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-black text-slate-950 transition-all hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 active:scale-95 touch-manipulation shadow-md"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  ফিল্টার রিসেট করুন
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Product Grid (Desktop 3-4 Cols | Mobile 2 Cols) */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                    : viewMode === "compact"
                      ? "grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-3 lg:grid-cols-4"
                      : "space-y-3.5"
                }
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    priority={index < 4}
                    onQuickView={setQuickViewProduct}
                    onCompare={handleCompare}
                  />
                ))}
              </div>

              {/* Server-Rendered Pagination & Load More Section */}
              <div className="mt-8">
                {pagination}
              </div>
            </>
          )}
        </div>
      </div>

      <QuickViewDrawer product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      <CompareDrawer
        products={compareList}
        onRemove={handleRemoveCompare}
        onClear={() => setCompareList([])}
      />
    </div>
  );
}

export default ProductsCatalogClient;
