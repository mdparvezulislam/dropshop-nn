"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, FileEdit, Copy, Trash2, Eye, CheckCircle2 } from "lucide-react";
import type { ProductCatalogItem } from "./catalog-table-view";

export interface CatalogGridViewProps {
  items: ProductCatalogItem[];
  loading: boolean;
  onPreview: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CatalogGridView({
  items,
  loading,
  onPreview,
  onDuplicate,
  onDelete,
}: CatalogGridViewProps): React.ReactElement {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onPreview(item.id)}
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-3 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer overflow-hidden"
        >
          {/* Card Media Preview */}
          <div className="relative aspect-[4/3] rounded-xl bg-muted/40 overflow-hidden mb-3 border border-border/60">
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Package className="h-10 w-10 text-primary" />
              </div>
            )}
            <div className="absolute left-2 top-2">
              <Badge variant={item.status === "active" ? "success" : "warning"} size="xs" className="font-bold shadow-2xs">
                {item.status === "active" ? "সক্রিয়" : "খসড়া"}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-extrabold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {item.name}
            </p>
            <p className="text-[11px] font-mono font-semibold text-muted-foreground">{item.sku}</p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-mono font-extrabold text-foreground">
                ৳{item.price.toLocaleString()}
              </span>
              <span className={`text-[11px] font-mono font-bold ${item.stock <= 0 ? "text-destructive" : item.stock <= 10 ? "text-warning" : "text-muted-foreground"}`}>
                {item.stock} pcs
              </span>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between gap-1 pt-3 mt-2 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] font-bold px-2 gap-1 text-muted-foreground hover:text-foreground" onClick={() => onPreview(item.id)}>
              <Eye className="h-3 w-3" /> Quick View
            </Button>
            <Link href={`/dashboard/products/${item.id}/edit`}>
              <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold px-2 gap-1">
                <FileEdit className="h-3 w-3" /> Edit
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
