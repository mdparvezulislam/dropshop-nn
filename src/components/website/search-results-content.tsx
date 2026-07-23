"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/website/product-grid";
import { ProductFilterSidebar } from "@/components/website/product-filter-sidebar";
import { ProductSortSelect } from "@/components/website/product-sort-select";
import { ProductPagination } from "@/components/website/product-pagination";
import { ProductQuickView } from "@/components/website/product-quick-view";
import { EmptyListing } from "@/components/website/empty-listing";
import { EmptySearch } from "@/components/website/empty-search";
import { searchProductsAction } from "@/features/catalog/actions/public-actions";
import type { ProductCardData } from "@/components/website/product-card";
import type { ProductListingFilters, SortOption } from "@/components/website/product-listing-content";

export interface SearchResultsContentProps {
  initialQuery: string;
  initialProducts: ProductCardData[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialTotal: number;
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

export function SearchResultsContent({
  initialQuery,
  initialProducts,
  initialCursor,
  initialHasMore,
  initialTotal,
}: SearchResultsContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [filters, setFiltersState] = useState<ProductListingFilters>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [columns, setColumns] = useState<3 | 4>(4);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);

  const doSearch = useCallback(
    async (q: string, newFilters: ProductListingFilters, replace = true) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      try {
        const result = await searchProductsAction(
          q,
          { limit: 20 },
          { ...newFilters, sort: newFilters.sort ?? "newest" },
        );

        if (result.success && result.data) {
          const d = result.data;
          if (replace) {
            setProducts(d.items);
            setCursor(d.cursor);
            setHasMore(d.hasMore);
            setTotalCount(d.totalCount);
          } else {
            setProducts((prev) => [...prev, ...d.items]);
            setCursor(d.cursor);
            setHasMore(d.hasMore);
          }
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setFiltersState({});
      const params = new URLSearchParams({ q });
      router.replace(`/search?${params.toString()}`, { scroll: false });
      doSearch(q, {});
    },
    [router, doSearch],
  );

  const handleFilterChange = useCallback(
    (newFilters: ProductListingFilters) => {
      setFiltersState(newFilters);
      const params = filtersToParams(newFilters);
      params.set("q", query);
      router.replace(`/search?${params.toString()}`, { scroll: false });
      doSearch(query, newFilters);
    },
    [query, router, doSearch],
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
      const result = await searchProductsAction(
        query,
        { cursor: cursor ?? undefined, limit: 20 },
        { ...filters, sort: filters.sort ?? "newest" },
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
  }, [query, cursor, filters]);

  const handleResetFilters = useCallback(() => {
    handleFilterChange({});
  }, [handleFilterChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(inputValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="-ml-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Search Results</h1>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories..."
            className="pl-9 h-10 text-sm"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${totalCount} result${totalCount !== 1 ? "s" : ""} for "${query}"`
            : `No results for "${query}"`}
        </p>
      </div>

      <Separator />

      {loading ? (
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
      ) : (
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

            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EmptySearch query={query} />
              </motion.div>
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
      )}

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
