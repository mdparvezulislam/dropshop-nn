"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Heart,
  Download,
  Plus,
  Eye,
  TrendingUp,
  Tag,
  Flame,
  Zap,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface ResellerProductCardItem {
  id: string;
  name: string;
  sku: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  mrp: number; // in cents
  wholesaleCost: number; // in cents
  minPrice: number; // in cents
  suggestedPrice: number; // in cents
  availableStock: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "upcoming" | "discontinued" | string;
  badge?: "flash_sale" | "best_seller" | "featured" | "new_arrival" | "trending" | string;
  isFavorite?: boolean;
}

export interface ResellerProductCardProps {
  product: ResellerProductCardItem;
  viewMode?: "grid" | "list";
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onQuickOrder?: (product: ResellerProductCardItem) => void;
}

export function ResellerProductCard({
  product,
  viewMode = "grid",
  onFavoriteToggle,
  onQuickOrder,
}: ResellerProductCardProps): React.ReactElement {
  const [fav, setFav] = React.useState(Boolean(product.isFavorite));

  const expectedProfitCents = Math.max(0, product.suggestedPrice - product.wholesaleCost);
  const marginPercent =
    product.suggestedPrice > 0
      ? Math.round((expectedProfitCents / product.suggestedPrice) * 100)
      : 0;

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextFav = !fav;
    setFav(nextFav);
    if (onFavoriteToggle) onFavoriteToggle(product.id, nextFav);
  };

  const getStockTone = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock <= 0)
      return { label: "Out of Stock", color: "bg-destructive/15 text-destructive border-destructive/30" };
    if (status === "low_stock" || stock <= 5)
      return { label: `Low Stock (${stock})`, color: "bg-amber-500/15 text-amber-500 border-amber-500/30" };
    if (status === "upcoming")
      return { label: "Upcoming", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" };
    return { label: `In Stock (${stock})`, color: "bg-success/15 text-success border-success/30" };
  };

  const stockBadge = getStockTone(product.status, product.availableStock);

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all shadow-2xs group">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/60">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded-full border", stockBadge.color)}>
                  {stockBadge.label}
                </span>
                {product.brand && (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {product.brand}
                  </span>
                )}
              </div>
              <Link href={`/reseller/products/${product.id}`}>
                <h3 className="text-xs sm:text-sm font-black text-foreground hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-[11px] font-mono text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
            <div className="text-left sm:text-right">
              <div className="text-xs text-muted-foreground font-semibold">
                Cost: <span className="font-bold text-foreground">৳{(product.wholesaleCost / 100).toFixed(0)}</span>
              </div>
              <div className="text-xs font-extrabold text-foreground">
                Sell Price: <span className="text-primary font-black">৳{(product.suggestedPrice / 100).toFixed(0)}</span>
              </div>
              <div className="text-[11px] font-black text-success">
                Profit: +৳{(expectedProfitCents / 100).toFixed(0)} ({marginPercent}%)
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleFavClick}
                className={cn(
                  "p-2 rounded-xl border border-border transition-colors",
                  fav ? "bg-red-500/10 text-red-500 border-red-500/30" : "text-muted-foreground hover:bg-muted",
                )}
                title="Favorite"
              >
                <Heart className={cn("w-4 h-4", fav && "fill-current")} />
              </button>
              <Link href={`/reseller/marketing-kit?productId=${product.id}`}>
                <Button variant="outline" size="sm" className="h-9 px-2.5">
                  <Download className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/reseller/products/${product.id}`}>
                <Button size="sm" className="h-9 font-bold gap-1 shadow-xs">
                  <Plus className="w-4 h-4" /> Order
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs group flex flex-col justify-between">
      {/* Top Media & Badges */}
      <div>
        <div className="relative aspect-square bg-muted overflow-hidden border-b border-border/60">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
              <Package className="w-10 h-10" />
            </div>
          )}

          {/* Top Left Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-md border shadow-xs", stockBadge.color)}>
              {stockBadge.label}
            </span>
            {product.badge && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" /> {product.badge.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {/* Top Right Wishlist Button */}
          <button
            type="button"
            onClick={handleFavClick}
            className={cn(
              "absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-xs",
              fav
                ? "bg-red-500 text-white"
                : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background",
            )}
            title="Add to Wishlist"
          >
            <Heart className={cn("w-4 h-4", fav && "fill-current")} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            {product.brand && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </p>
            )}
            <Link href={`/reseller/products/${product.id}`}>
              <h3 className="text-xs sm:text-sm font-black text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>
            <p className="text-[10px] font-mono text-muted-foreground">SKU: {product.sku}</p>
          </div>

          {/* Pricing Grid Box */}
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-[11px] sm:text-xs">
              <span className="text-muted-foreground">Reseller Cost:</span>
              <span className="text-foreground font-black">৳{(product.wholesaleCost / 100).toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] sm:text-xs">
              <span className="font-extrabold text-foreground">Suggested Price:</span>
              <span className="font-black text-primary text-xs sm:text-sm">৳{(product.suggestedPrice / 100).toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400 pt-0.5">
              <span>Expected Profit:</span>
              <span>+৳{(expectedProfitCents / 100).toFixed(0)} ({marginPercent}%)</span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold border-t border-border/40 pt-1">
              <span className="text-muted-foreground">Real Stock:</span>
              <span className={cn("font-black font-mono", product.availableStock > 5 ? "text-emerald-600 dark:text-emerald-400" : product.availableStock > 0 ? "text-amber-500" : "text-destructive")}>
                {product.availableStock > 0 ? `${product.availableStock} pcs` : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quick Actions */}
      <div className="p-3 pt-0 grid grid-cols-2 gap-2">
        <Link href={`/reseller/products/${product.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1">
            <Eye className="w-3.5 h-3.5" /> Details
          </Button>
        </Link>
        <Link href={`/reseller/orders/create?productId=${product.id}`} className="w-full">
          <Button size="sm" className="w-full text-xs font-black gap-1 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Quick Order
          </Button>
        </Link>
      </div>
    </Card>
  );
}
