"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProductGrid } from "@/components/website/product-grid";
import { ProductFilterSidebar } from "@/components/website/product-filter-sidebar";
import { ProductSortSelect } from "@/components/website/product-sort-select";
import { ProductPagination } from "@/components/website/product-pagination";
import { ProductListingHeader } from "@/components/website/product-listing-header";
import { ProductQuickView } from "@/components/website/product-quick-view";
import { EmptyListing } from "@/components/website/empty-listing";
import { getPublicCategoryProductsAction } from "@/features/catalog/actions/public-actions";
import type { ProductCardData } from "@/components/website/product-card";
import type { Category } from "@/features/catalog/domain/classification-entity";

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating" | "featured";

export interface ProductListingFilters {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  minRating?: number;
  brand?: string;
  sort?: SortOption;
}

interface ProductListingContentProps {
  slug: string;
  category: Category;
  initialProducts: ProductCardData[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialTotal: number;
  initialFilters: ProductListingFilters;
}

function filtersToParams(filters: ProductListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStock) params.set("inStock", "1");
  if (filters.onSale) params.set("onSale", "1");
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  return params;
}

function ListingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-square rounded-lg bg-muted" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-5 bg-muted rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function ProductListingContent({
  slug,
  category,
  initialProducts,
  initialCursor,
  initialHasMore,
  initialTotal,
  initialFilters,
}: ProductListingContentProps) {
  const router = useRouter();

  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [filters, setFiltersState] = useState<ProductListingFilters>(initialFilters);
  const [loadingMore, setLoadingMore] = useState(false);
  const [columns, setColumns] = useState<3 | 4>(4);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);

  const fetchWithFilters = useCallback(
    async (newFilters: ProductListingFilters) => {
      const params = filtersToParams(newFilters);
      const qs = params.toString();
      router.replace(`/category/${slug}${qs ? `?${qs}` : ""}`, { scroll: false });

      setLoadingMore(true);
      try {
        const result = await getPublicCategoryProductsAction(
          slug,
          { limit: 20 },
          newFilters,
          newFilters.sort ?? "newest",
        );
        if (result.success && result.data) {
          setProducts(result.data.items);
          setCursor(result.data.cursor);
          setHasMore(result.data.hasMore);
          setTotalCount(result.data.totalCount);
        }
      } finally {
        setLoadingMore(false);
      }
    },
    [slug, router],
  );

  const handleFilterChange = useCallback(
    (newFilters: ProductListingFilters) => {
      setFiltersState(newFilters);
      fetchWithFilters(newFilters);
    },
    [fetchWithFilters],
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      const newFilters = { ...filters, sort };
      handleFilterChange(newFilters);
    },
    [filters, handleFilterChange],
  );

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const result = await getPublicCategoryProductsAction(
        slug,
        { cursor: cursor ?? undefined, limit: 20 },
        filters,
        filters.sort ?? "newest",
      );
      if (result.success && result.data) {
        const d = result.data;
        setProducts((prev) => [...prev, ...d.items]);
        setCursor(d.cursor);
        setHasMore(d.hasMore);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [slug, cursor, filters]);

  const handleResetFilters = useCallback(() => {
    const empty: ProductListingFilters = {};
    setFiltersState(empty);
    fetchWithFilters(empty);
  }, [fetchWithFilters]);

  return (
    <div className="space-y-6">
      <ProductListingHeader category={category} totalCount={totalCount} />

      <Separator />

      <div className="flex gap-6">
        <ProductFilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ProductFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setColumns(4)}
                  className={`p-1.5 transition-colors ${
                    columns === 4
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setColumns(3)}
                  className={`p-1.5 transition-colors ${
                    columns === 3
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
              <ProductSortSelect
                value={filters.sort ?? "newest"}
                onChange={handleSortChange}
              />
            </div>
          </div>

          {loadingMore && products.length === 0 ? (
            <ListingSkeleton />
          ) : products.length === 0 ? (
            <EmptyListing onReset={handleResetFilters} />
          ) : (
            <>
              <ProductGrid products={products} columns={columns} />

              <ProductPagination
                hasMore={hasMore}
                loading={loadingMore}
                totalCount={totalCount}
                onLoadMore={handleLoadMore}
              />
            </>
          )}
        </div>
      </div>

      <ProductQuickView
        product={quickViewProduct}
        open={quickViewProduct !== null}
        onOpenChange={(open) => {
          if (!open) setQuickViewProduct(null);
        }}
      />
    </div>
  );
}
