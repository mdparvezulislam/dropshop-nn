"use client";

import * as React from "react";
import Link from "next/link";
import { Package, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { listProductsAction } from "@/features/catalog/actions/product-actions";
import { ResourceListPage } from "@/components/workspace/resource-list-page";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/ui/data-table";

type Row = {
  id: string;
  name: string;
  sku: string;
  status: string;
  stock: number;
  price: number;
  createdAt: string;
};

export default function SupplierProductsPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProductsAction({ search: search || undefined } as any, { limit: 100 });
      if (res.success && res.data) {
        const raw = res.data as any;
        const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
        setRows(
          items.map((p: any) => ({
            id: p.id ?? p._id,
            name: p.title ?? p.name ?? "Unnamed",
            sku: p.sku ?? "—",
            status: p.status ?? "draft",
            stock: p.stock ?? p.inventory?.available ?? 0,
            price: p.retailPrice ?? p.pricing?.retail ?? 0,
            createdAt: p.createdAt,
          })),
        );
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
      id: "price",
      header: "Price",
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">{formatCents(r.price)}</span>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      cell: (r) => <span className="tabular-nums">{r.stock}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "created",
      header: "Created",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/supplier/products/${r.id}`}
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
      description="Manage your product catalog"
      actions={
        <Link href="/supplier/products/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      }
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search products…",
      }}
      stats={
        loading ? undefined : (
          <>
            <StatCard label="Total Products" value={rows.length} icon={Package} />
            <StatCard
              label="Active"
              value={rows.filter((r) => r.status === "active").length}
              accent="success"
            />
            <StatCard
              label="Drafts"
              value={rows.filter((r) => r.status === "draft").length}
              accent="warning"
            />
          </>
        )
      }
      columns={columns}
      data={rows}
      loading={loading}
      onRowClick={(r) => {
        window.location.href = `/supplier/products/${r.id}`;
      }}
      emptyTitle="No products yet"
      emptyDescription="Add your first product to get started."
    />
  );
}
