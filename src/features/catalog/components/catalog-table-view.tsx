"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, FileEdit, Copy, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProductCatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  costPrice?: number;
  stock: number;
  status: string;
  image?: string;
  updatedAt?: string;
}

export interface CatalogTableViewProps {
  items: ProductCatalogItem[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPreview: (id: string) => void;
  onInlineUpdate: (id: string, field: string, val: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Renders any product lifecycle status, including `inactive` and `pending_review`,
 * which previously all fell through to the "Archived" badge. */
function ProductStatusBadge({ status }: { status: string }): React.ReactElement {
  switch (status) {
    case "active":
      return (
        <Badge variant="success" size="xs" className="gap-1 font-bold">
          <CheckCircle2 className="h-3 w-3" /> সক্রিয় (Active)
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="warning" size="xs" className="gap-1 font-bold">
          <FileEdit className="h-3 w-3" /> খসড়া (Draft)
        </Badge>
      );
    case "pending_review":
      return (
        <Badge variant="warning" size="xs" className="gap-1 font-bold">
          পর্যালোচনায় (Pending)
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="outline" size="xs" className="gap-1 font-bold">
          নিষ্ক্রিয় (Inactive)
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" size="xs" className="gap-1 font-bold">
          আর্কাইভ (Archived)
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size="xs" className="gap-1 font-bold">
          {status}
        </Badge>
      );
  }
}

export function CatalogTableView({
  items,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPreview,
  onInlineUpdate,
  onDuplicate,
  onDelete,
}: CatalogTableViewProps): React.ReactElement {
  const [editingCell, setEditingCell] = React.useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = React.useState("");

  const startInlineEdit = (id: string, field: string, currentVal: number | string) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const commitInlineEdit = (id: string, field: string) => {
    if (editingCell) {
      onInlineUpdate(id, field, editValue);
      setEditingCell(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground animate-pulse">
        পণ্য তালিকা লোড করা হচ্ছে (Loading catalog items…)
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-border bg-card text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <Package className="h-6 w-6" />
        </div>
        <p className="text-sm font-extrabold text-foreground">এখনও কোনো পণ্য যোগ করা হয়নি</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          No products matched your search or filters. Create a new product in Product Studio.
        </p>
        <Link href="/dashboard/products/new">
          <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90">
            নতুন পণ্য যোগ করুন (Add Product)
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="ws-scroll max-h-[600px] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs border-b border-border font-bold text-muted-foreground select-none">
          <tr>
            <th className="p-3 w-8">
              <input
                type="checkbox"
                aria-label="Select all products on this page"
                checked={selectedIds.length === items.length && items.length > 0}
                onChange={onToggleSelectAll}
                className="h-3.5 w-3.5 rounded border-border text-primary"
              />
            </th>
            <th className="p-3">পণ্য বিবরণ (Product Details)</th>
            <th className="p-3">ক্যাটাগরি & ব্র্যান্ড</th>
            <th className="p-3 text-right">খুচরা মূল্য (Retail)</th>
            <th className="p-3 text-right">খরচ (Cost)</th>
            <th className="p-3 text-center">স্টক (Stock)</th>
            <th className="p-3">স্ট্যাটাস (Status)</th>
            <th className="p-3 text-right">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isEditingPrice = editingCell?.id === item.id && editingCell?.field === "price";
            const isEditingCost = editingCell?.id === item.id && editingCell?.field === "costPrice";
            const isEditingStock = editingCell?.id === item.id && editingCell?.field === "stock";

            return (
              <tr
                key={item.id}
                className={cn(
                  "group hover:bg-muted/40 transition-colors cursor-pointer",
                  isSelected && "bg-accent/30",
                )}
                onClick={() => onPreview(item.id)}
              >
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.name}`}
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="h-3.5 w-3.5 rounded border-border text-primary"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 overflow-hidden shadow-2xs">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- CDN thumbnails from arbitrary supplier hosts
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground font-semibold">
                        {item.sku}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground/90">{item.category || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{item.brand || "—"}</p>
                  </div>
                </td>
                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {isEditingPrice ? (
                    <Input
                      type="number"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitInlineEdit(item.id, "price")}
                      onKeyDown={(e) => e.key === "Enter" && commitInlineEdit(item.id, "price")}
                      className="h-7 w-24 text-right font-mono font-bold text-xs"
                    />
                  ) : (
                    <span
                      onClick={() => startInlineEdit(item.id, "price", item.price)}
                      className="font-mono font-extrabold text-foreground hover:bg-muted/80 px-1.5 py-1 rounded transition-colors"
                      title="Click to inline edit price"
                    >
                      ৳{item.price.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {isEditingCost ? (
                    <Input
                      type="number"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitInlineEdit(item.id, "costPrice")}
                      onKeyDown={(e) => e.key === "Enter" && commitInlineEdit(item.id, "costPrice")}
                      className="h-7 w-24 text-right font-mono font-bold text-xs"
                    />
                  ) : (
                    <span
                      onClick={() => startInlineEdit(item.id, "costPrice", item.costPrice ?? 0)}
                      className="font-mono font-extrabold text-foreground hover:bg-muted/80 px-1.5 py-1 rounded transition-colors"
                      title="Click to inline edit cost"
                    >
                      ৳{(item.costPrice ?? 0).toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  {isEditingStock ? (
                    <Input
                      type="number"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitInlineEdit(item.id, "stock")}
                      onKeyDown={(e) => e.key === "Enter" && commitInlineEdit(item.id, "stock")}
                      className="h-7 w-20 text-center font-mono font-bold text-xs"
                    />
                  ) : (
                    <span
                      onClick={() => startInlineEdit(item.id, "stock", item.stock)}
                      className={cn(
                        "font-mono font-extrabold hover:bg-muted/80 px-2 py-0.5 rounded transition-colors",
                        item.stock <= 0
                          ? "text-destructive"
                          : item.stock <= 10
                            ? "text-warning"
                            : "text-foreground",
                      )}
                      title="Click to inline edit stock"
                    >
                      {item.stock} pcs
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <ProductStatusBadge status={item.status} />
                </td>
                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onPreview(item.id)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Quick Side Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <Link href={`/dashboard/products/${item.id}/edit`}>
                      <button
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit in Product Studio"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDuplicate(item.id)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Duplicate Product"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
