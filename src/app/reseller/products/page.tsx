"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Flame,
  Sparkles,
  Heart,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/workspace/stat-card";
import {
  ResellerProductCard,
  ResellerProductCardItem,
} from "@/features/reseller-workspace/components/reseller-product-card";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const BADGE_FILTERS = [
  { id: "all", label: "All Products" },
  { id: "flash_sale", label: "Flash Sale 🔥" },
  { id: "featured", label: "Featured" },
  { id: "best_seller", label: "Best Seller" },
  { id: "new_arrival", label: "New Arrivals" },
  { id: "trending", label: "Trending" },
  { id: "low_stock", label: "Low Stock ⚡" },
];

export default function ResellerProductsPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedBrand, setSelectedBrand] = React.useState("all");
  const [badgeFilter, setBadgeFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<ResellerProductCardItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [resellerStatus, setResellerStatus] = React.useState("active");
  const pageSize = 48;

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const { searchResellerProductsAction, resolveCurrentResellerAction } =
        await import("@/features/reseller/actions/reseller-actions");

      const [profileRes, prodRes] = await Promise.allSettled([
        resolveCurrentResellerAction(),
        searchResellerProductsAction({
          resellerId: "me",
          page,
          limit: pageSize,
          search: search || undefined,
        }),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.success && profileRes.value.data) {
        setResellerStatus(profileRes.value.data.status || "active");
      }

      if (prodRes.status === "fulfilled" && prodRes.value.success && prodRes.value.data) {
        const d = prodRes.value.data as any;
        const rawItems = d.items ?? (Array.isArray(d) ? d : []);

        const mapped: ResellerProductCardItem[] = rawItems.map((p: any) => {
          const wholesaleCost = p.pricing?.costBasis ?? p.costBasis ?? p.wholesalePrice ?? 90000; // cents
          const mrp = p.pricing?.recommendedPrice ?? p.pricing?.sellingPrice ?? 105000;
          const minPrice = p.pricing?.minPrice ?? wholesaleCost;
          const suggestedPrice = p.pricing?.sellingPrice ?? 105000;

          return {
            id: p.id || p._id,
            name: p.customTitle ?? p.product?.name ?? p.productName ?? p.productId ?? "Reseller Product",
            sku: p.variantSku ?? p.product?.sku ?? p.sku ?? "RSL-ITEM",
            category: p.product?.category?.name || p.category || "Gadgets",
            brand: p.product?.brand?.name || p.brand || "Brand",
            imageUrl: p.product?.primaryImage?.url || p.imageUrl || p.product?.images?.[0]?.url,
            mrp,
            wholesaleCost,
            minPrice,
            suggestedPrice,
            availableStock: p.availableStock ?? p.stock ?? 12,
            status: p.availableStock === 0 ? "out_of_stock" : p.availableStock <= 5 ? "low_stock" : "in_stock",
            badge: p.tags?.[0] || (p.isFavorite ? "featured" : undefined),
            isFavorite: Boolean(p.isFavorite),
          };
        });

        setProducts(mapped);
        setTotalCount(d.totalCount ?? mapped.length);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch {
      toast.error("Failed to load catalog products");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const brands = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    try {
      const { favoriteResellerProductAction } =
        await import("@/features/reseller/actions/reseller-actions");
      await favoriteResellerProductAction(id, isFavorite);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite } : p)));
      toast.success(isFavorite ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  // Client-side filtering & sorting
  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== "all" && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedBrand !== "all" && p.brand?.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
      if (badgeFilter === "low_stock") return p.status === "low_stock" || p.availableStock <= 5;
      if (badgeFilter === "flash_sale") return p.badge === "flash_sale";
      if (badgeFilter === "best_seller") return p.badge === "best_seller";
      if (badgeFilter === "featured") return p.isFavorite || p.badge === "featured";
      if (badgeFilter === "trending") return p.badge === "trending";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest_profit") {
        const profitA = a.suggestedPrice - a.wholesaleCost;
        const profitB = b.suggestedPrice - b.wholesaleCost;
        return profitB - profitA;
      }
      if (sortBy === "lowest_cost") return a.wholesaleCost - b.wholesaleCost;
      if (sortBy === "price_asc") return a.suggestedPrice - b.suggestedPrice;
      if (sortBy === "price_desc") return b.suggestedPrice - a.suggestedPrice;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-2.5 sm:space-y-4 animate-fade-in pt-0 sm:pt-1">
        {/* Desktop-only Page Header (Hidden on Mobile because top header already shows Products) */}
        <div className="hidden sm:flex items-center justify-between gap-3 border-b border-border pb-2.5">
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Reseller Products
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
              Live Stock Catalog ({totalCount})
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/reseller/orders/create">
              <Button size="sm" className="h-8 text-xs font-black gap-1.5 shadow-xs px-3">
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Micro-Stats Strip */}
        <div className="flex sm:hidden items-center justify-between bg-card border border-border/80 rounded-xl px-3 py-1.5 text-[11px] font-bold text-muted-foreground shadow-2xs">
          <span>Products: <strong className="text-foreground">{totalCount}</strong></span>
          <span className="text-border">•</span>
          <span>In Stock: <strong className="text-emerald-600 dark:text-emerald-400">{products.filter((p) => p.status === "in_stock").length}</strong></span>
          <span className="text-border">•</span>
          <span>Low Stock: <strong className="text-amber-500">{products.filter((p) => p.status === "low_stock").length}</strong></span>
          <span className="text-border">•</span>
          <span>Wishlist: <strong className="text-sky-500">{products.filter((p) => p.isFavorite).length}</strong></span>
        </div>

        {/* Desktop Stats Summary Bar */}
        <div className="hidden sm:grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4">
          <StatCard label="Total Products" value={totalCount} icon={Package} loading={loading} />
          <StatCard
            label="In Stock Items"
            value={products.filter((p) => p.status === "in_stock").length}
            accent="success"
            loading={loading}
          />
          <StatCard
            label="Low Stock Alert"
            value={products.filter((p) => p.status === "low_stock").length}
            accent="warning"
            loading={loading}
          />
          <StatCard
            label="My Wishlist"
            value={products.filter((p) => p.isFavorite).length}
            icon={Heart}
            accent="info"
            loading={loading}
          />
        </div>

        {/* Filter & Toolbar Box */}
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-2 sm:p-3.5 space-y-2 sm:space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products by name, SKU, brand, category..."
                  className="w-full h-8.5 sm:h-10 pl-8.5 pr-3 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Sort & Filter Select Controls */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
                {/* Category Dropdown Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-8 sm:h-10 px-2 sm:px-2.5 rounded-xl border border-border bg-card text-[11px] sm:text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Brand Dropdown Filter */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="h-8 sm:h-10 px-2 sm:px-2.5 rounded-xl border border-border bg-card text-[11px] sm:text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 sm:h-10 px-2 sm:px-2.5 rounded-xl border border-border bg-card text-[11px] sm:text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest_profit">Highest Profit (৳)</option>
                  <option value="lowest_cost">Lowest Cost Basis</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Product Name</option>
                </select>

                <div className="flex items-center border border-border rounded-xl p-0.5 bg-card shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1 sm:p-1.5 rounded-lg transition-colors",
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1 sm:p-1.5 rounded-lg transition-colors",
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    title="List View"
                  >
                    <ListIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Badge Filters Row */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {BADGE_FILTERS.map((b) => {
                const isActive = badgeFilter === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBadgeFilter(b.id)}
                    className={cn(
                      "px-2.5 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Product Cards Container: optimized 2-cols on mobile! */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground">
            Loading sales catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-2 bg-card rounded-2xl border border-border/80">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p>No products found matching your filters.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((p) => (
              <ResellerProductCard
                key={p.id}
                product={p}
                viewMode="grid"
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProducts.map((p) => (
              <ResellerProductCard
                key={p.id}
                product={p}
                viewMode="list"
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground">
              Page {page} of {totalPages} ({totalCount} total items)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 text-xs font-bold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ResellerStatusGuard>
  );
}
