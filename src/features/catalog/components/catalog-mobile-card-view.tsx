"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Eye,
  Copy,
  Trash2,
  Edit,
  MoreVertical,
  CheckCircle2,
  FileEdit,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductCatalogItem } from "./catalog-table-view";

export interface CatalogMobileCardViewProps {
  items: ProductCatalogItem[];
  loading: boolean;
  onPreview: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function ProductStatusBadge({ status }: { status: string }): React.ReactElement {
  switch (status) {
    case "active":
      return (
        <Badge variant="success" size="xs" className="gap-1 font-bold">
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="warning" size="xs" className="gap-1 font-bold">
          <FileEdit className="h-3 w-3" /> Draft
        </Badge>
      );
    case "out_of_stock":
      return (
        <Badge variant="destructive" size="xs" className="gap-1 font-bold">
          <XCircle className="h-3 w-3" /> Out of Stock
        </Badge>
      );
    case "low_stock":
      return (
        <Badge variant="warning" size="xs" className="gap-1 font-bold">
          <AlertTriangle className="h-3 w-3" /> Low Stock
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size="xs" className="font-semibold capitalize">
          {status}
        </Badge>
      );
  }
}

export function CatalogMobileCardView({
  items,
  loading,
  onPreview,
  onDuplicate,
  onDelete,
}: CatalogMobileCardViewProps): React.ReactElement {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-border/80 bg-card p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/50">
        <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm font-bold text-foreground">No products found</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Try adjusting your search filters or add a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            {/* Product Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Package className="h-7 w-7" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-1.5">
                <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                  {item.name}
                </h3>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                      aria-label="Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onPreview(item.id)}>
                      <Eye className="mr-2 h-3.5 w-3.5 text-primary" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/products/${item.id}`}>
                        <Edit className="mr-2 h-3.5 w-3.5 text-amber-500" /> Edit Product
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
                      <Copy className="mr-2 h-3.5 w-3.5 text-blue-500" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* SKU & Category */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  {item.sku || "NO-SKU"}
                </span>
                {item.category && <span>• {item.category}</span>}
              </div>

              {/* Price & Stock status bar */}
              <div className="pt-1.5 flex items-center justify-between border-t border-border/50">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold text-foreground">
                    ৳{item.price.toLocaleString("en-US")}
                  </span>
                  {item.costPrice && (
                    <span className="text-[10px] text-muted-foreground line-through font-medium">
                      ৳{item.costPrice.toLocaleString("en-US")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.stock > 10
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : item.stock > 0
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.stock} in stock
                  </span>
                  <ProductStatusBadge status={item.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
