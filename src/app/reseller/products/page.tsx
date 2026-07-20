"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Download, Package } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { ResourceListPage } from "@/shared/components/workspace/resource-list-page";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import type { DataTableColumn } from "@/shared/components/ui/data-table";

type Row = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  availableStock: number;
  profitAmount: number;
  profitMargin: number;
  status: string;
  isFavorite: boolean;
};

export default function ResellerProductsPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { searchResellerProductsAction } = await import(
        "@/features/reseller/actions/reseller-actions"
      );
      const res = await searchResellerProductsAction({
        resellerId: "current",
        page,
        limit: pageSize,
        search: search || undefined,
      });
      if (res.success && res.data) {
        const d = res.data as any;
        const items: Row[] = (d.items ?? []).map((p: any) => ({
          id: p.id,
          name: p.customTitle ?? p.productId?.title ?? "",
          sku: p.variantSku ?? p.productId?.sku ?? "",
          sellingPrice: p.pricing?.sellingPrice ?? 0,
          availableStock: p.availableStock ?? 0,
          profitAmount: p.pricing?.profitAmount ?? 0,
          profitMargin: p.pricing?.profitMargin ?? 0,
          status: p.sellingStatus ?? "draft",
          isFavorite: p.isFavorite ?? false,
        }));
        setRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { favoriteResellerProductAction } = await import(
        "@/features/reseller/actions/reseller-actions"
      );
      await favoriteResellerProductAction(id, isFavorite);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite } : r)));
      toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Product",
      cell: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.name || "—"}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.sku}</div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Your Price",
      cell: (r) => (
        <span className="font-semibold tabular-nums">
          ৳{(r.sellingPrice / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums">{r.availableStock}</span>,
    },
    {
      id: "profit",
      header: "Profit",
      hideOnMobile: true,
      cell: (r) => (
        <div>
          <span className="tabular-nums text-success">
            ৳{(r.profitAmount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-muted-foreground ml-1">({r.profitMargin}%)</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleFavorite(r.id, !r.isFavorite)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              r.isFavorite
                ? "text-red-400 hover:bg-red-400/10"
                : "text-muted-foreground hover:bg-muted",
            )}
            aria-label={r.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", r.isFavorite && "fill-current")} />
          </button>
          <Link
            href={`/reseller/marketing-kit?productId=${r.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ResourceListPage
      title="My Products"
      description="Browse your catalog with reseller pricing and stock"
      search={{
        value: search,
        onChange: (v) => {
          setSearch(v);
          setPage(1);
        },
        placeholder: "Search products…",
      }}
      stats={
        loading ? undefined : (
          <>
            <StatCard label="Total" value={totalCount} icon={Package} />
            <StatCard
              label="Active"
              value={rows.filter((r) => r.status === "active").length}
              accent="success"
            />
            <StatCard
              label="Favorites"
              value={rows.filter((r) => r.isFavorite).length}
              icon={Heart}
              accent="warning"
            />
            <StatCard
              label="Drafts"
              value={rows.filter((r) => r.status === "draft").length}
              accent="info"
            />
          </>
        )
      }
      columns={columns}
      data={rows}
      loading={loading}
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={setPage}
      emptyTitle="No products in your catalog"
      emptyDescription="Contact the admin to assign products to your reseller catalog."
    />
  );
}
