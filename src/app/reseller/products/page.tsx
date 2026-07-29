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
  const pageSize = 12;

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
          const wholesaleCost = p.pricing?.costBasis ?? p.costBasis ?? p.wholesalePrice ?? 150000; // cents
          const mrp = p.pricing?.recommendedPrice ?? p.product?.mrp ?? wholesaleCost * 1.5;
          const minPrice = p.pricing?.minPrice ?? Math.round(wholesaleCost * 1.05);
          const suggestedPrice = p.pricing?.sellingPrice ?? Math.round(wholesaleCost * 1.25);

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
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              Sales Catalog &amp; Pricing Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Reseller Products
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Browse products, calculate profit, customize selling price, and place quick customer orders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/reseller/orders/create">
              <Button size="sm" className="gap-1.5 font-black shadow-xs">
                <Plus className="w-4 h-4 stroke-[3]" /> Create Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
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
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products by name, SKU, brand, category..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Sort & View Mode Controls */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
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
                      "p-1.5 rounded-lg transition-colors",
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Badge Filters Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {BADGE_FILTERS.map((b) => {
                const isActive = badgeFilter === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBadgeFilter(b.id)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
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

        {/* Product Cards Container */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="space-y-3">
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
