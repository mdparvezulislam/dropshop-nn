"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/website/price-display";
import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/components/website/product-card";

interface ProductQuickViewProps {
  product: ProductCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  if (!product) return null;

  const discount =
    product.comparePrice && product.comparePrice > product.retailPrice
      ? Math.round((1 - product.retailPrice / product.comparePrice) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Quick view of {product.name}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {product.isNew && (
              <Badge className="absolute top-2 left-2 bg-emerald-500 hover:bg-emerald-500">NEW</Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-500">
                -{discount}%
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              {product.brand && (
                <p className="text-sm text-muted-foreground mt-0.5">{product.brand}</p>
              )}
            </div>

            <PriceDisplay
              retailPrice={product.retailPrice}
              comparePrice={product.comparePrice}
            />

            {product.rating !== undefined && (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(product.rating ?? 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                {product.reviewCount !== undefined && (
                  <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center gap-1 ${
                  product.stockStatus === "in_stock"
                    ? "text-emerald-600"
                    : product.stockStatus === "low_stock"
                      ? "text-amber-600"
                      : "text-rose-600"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {product.stockStatus === "in_stock"
                  ? "In Stock"
                  : product.stockStatus === "low_stock"
                    ? "Low Stock"
                    : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-2">
              <Button size="sm" disabled={product.stockStatus === "out_of_stock"} className="gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </Button>
              <Link href={`/product/${product.slug}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
