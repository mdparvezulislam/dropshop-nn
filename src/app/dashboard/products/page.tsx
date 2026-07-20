"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Copy, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  listProductsAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/features/catalog/actions/product-actions";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Package, Search } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  status: string;
  brand: string;
  category: string;
  variantsCount: number;
  visibility: string;
};

export default function ProductsPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rows, setRows] = React.useState<ProductRow[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProductsAction(
        {
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(search ? { search } : {}),
        },
        { limit: 50 },
      );
      if (res.success && res.data) {
        const d = res.data as any;
        const items: ProductRow[] = (d.items ?? []).map((p: any) => ({
          id: p.id,
          name: p.title ?? p.name ?? "",
          sku: p.sku ?? "",
          status: p.status ?? "draft",
          brand: p.brand?.name ?? p.brand ?? "",
          category: p.category?.name ?? p.category ?? "",
          variantsCount: p.variants?.length ?? 0,
          visibility: p.visibility ?? "public",
        }));
        setRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProductAction(id);
      setRows((p) => p.filter((x) => x.id !== id));
      setTotalCount((c) => c - 1);
      toast.success("Product deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await duplicateProductAction(id);
      if (res.success && res.data) {
        const d = res.data as any;
        const newRow: ProductRow = {
          id: d.id,
          name: d.title ?? d.name ?? "",
          sku: d.sku ?? "",
          status: "draft",
          brand: d.brand?.name ?? "",
          category: d.category?.name ?? "",
          variantsCount: d.variants?.length ?? 0,
          visibility: "public",
        };
        setRows((p) => [newRow, ...p]);
        setTotalCount((c) => c + 1);
        toast.success("Duplicated as draft");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    }
  };

  const columns: DataTableColumn<ProductRow>[] = [
    {
      id: "name",
      header: "Product",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.name}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{row.sku}</div>
        </div>
      ),
    },
    {
      id: "brand",
      header: "Brand",
      hideOnMobile: true,
      cell: (row) => <span className="text-muted-foreground">{row.brand || "—"}</span>,
    },
    {
      id: "category",
      header: "Category",
      hideOnMobile: true,
      cell: (row) => row.category || "—",
    },
    {
      id: "variants",
      header: "Variants",
      hideOnMobile: true,
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">{row.variantsCount}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusChip label={row.status} tone={statusToneFromValue(row.status)} />,
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/dashboard/products/${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => handleDuplicate(row.id)}
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive/80 hover:bg-destructive/10"
            onClick={() => handleDelete(row.id)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = React.useMemo(() => {
    const all = rows;
    return {
      total: totalCount,
      active: all.filter((p) => p.status === "active").length,
      draft: all.filter((p) => p.status === "draft").length,
      inactive: all.filter((p) => p.status === "inactive").length,
    };
  }, [rows, totalCount]);

  return (
    <ListLayout
      header={{
        title: "Products",
        description: "Master catalog — pricing and stock live in dedicated modules",
        actions: (
          <Link href="/dashboard/products/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> New product
            </Button>
          </Link>
        ),
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total" value={stats.total} icon={Package} />
            <StatCard label="Active" value={stats.active} accent="success" />
            <StatCard label="Drafts" value={stats.draft} accent="warning" />
            <StatCard label="Inactive" value={stats.inactive} accent="danger" />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <>
              <SearchBox
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search name, SKU, brand…"
                className="w-full sm:w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/products/${row.id}`)}
        emptyTitle="No products"
        emptyDescription="Create your first catalog product in Product Studio."
        bulkActions={
          <Button variant="outline" size="sm" onClick={() => setSelected([])}>
            Clear
          </Button>
        }
      />
    </ListLayout>
  );
}
