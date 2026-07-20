"use client";

import * as React from "react";
import Link from "next/link";
import { Package, Tag, Layers, Eye } from "lucide-react";
import { toast } from "sonner";
import { listProductsAction } from "@/features/catalog/actions/product-actions";
import { listCategoriesAction } from "@/features/catalog/actions/classification-actions";
import { ResourceListPage } from "@/shared/components/workspace/resource-list-page";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import type { DataTableColumn } from "@/shared/components/ui/data-table";
import { cn } from "@/shared/utils/cn";

type Row = {
  id: string;
  name: string;
  sku: string;
  category: string;
  wholesalePrice: number;
  moq: number;
  stock: number;
  status: string;
};

export default function WholesaleProductsPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        listProductsAction({ search: search || undefined } as any, { limit: 50 }),
        listCategoriesAction(),
      ]);

      const catMap = new Map<string, string>();
      if (catRes.status === "fulfilled" && catRes.value.success) {
        const cats = Array.isArray(catRes.value.data) ? catRes.value.data : [];
        cats.forEach((c: any) => catMap.set(c.id ?? c._id, c.name));
      }

      if (prodRes.status === "fulfilled" && prodRes.value.success) {
        const raw = prodRes.value.data as any;
        const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
        setTotalCount(raw?.total ?? raw?.totalCount ?? items.length);

        const mapped: Row[] = items.map((p: any) => ({
          id: p.id ?? p._id,
          name: p.title ?? p.name ?? "Unnamed",
          sku: p.sku ?? "—",
          category: catMap.get(p.categoryId ?? p.category) ?? (p.categoryName ?? "—"),
          wholesalePrice: p.wholesalePrice ?? p.pricing?.wholesale ?? 0,
          moq: p.moq ?? p.minOrderQuantity ?? 1,
          stock: p.stock ?? p.inventory?.available ?? 0,
          status: p.status ?? "active",
        }));
        setRows(mapped);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Product",
      cell: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">{r.sku}</div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
    },
    {
      id: "price",
      header: "Wholesale Price",
      cell: (r) => (
        <span className="font-semibold tabular-nums text-success">
          {formatCents(r.wholesalePrice)}
        </span>
      ),
    },
    {
      id: "moq",
      header: "MOQ",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.moq}</span>,
    },
    {
      id: "stock",
      header: "Stock",
      cell: (r) => (
        <span
          className={cn(
            "tabular-nums",
            r.stock <= 0
              ? "text-destructive"
              : r.stock < 10
                ? "text-warning"
                : "text-muted-foreground",
          )}
        >
          {r.stock}
        </span>
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
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/wholesale/products/${r.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ResourceListPage
      title="Products"
      description="Browse wholesale products with tier pricing and MOQ"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search products…",
      }}
      stats={
        loading ? undefined : (
          <>
            <StatCard label="Total Products" value={totalCount} icon={Package} />
            <StatCard
              label="In Stock"
              value={rows.filter((r) => r.stock > 0).length}
              icon={Layers}
              accent="success"
            />
            <StatCard
              label="Low Stock"
              value={rows.filter((r) => r.stock > 0 && r.stock < 10).length}
              icon={Tag}
              accent="warning"
            />
          </>
        )
      }
      columns={columns}
      data={rows}
      loading={loading}
      totalCount={totalCount}
      onRowClick={(r) => {
        window.location.href = `/wholesale/products/${r.id}`;
      }}
      emptyTitle="No products available"
      emptyDescription="Products will appear here when they are published."
    />
  );
}
