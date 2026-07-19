"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  duplicateProductAction,
  softDeleteProductAction,
} from "@/features/product/actions/product-actions";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Package, Eye } from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  productModel: string;
  status: string;
  brand: string;
  category: string;
  variantsCount: number;
  visibility: string;
};

const MOCK: ProductRow[] = [
  {
    id: "1",
    name: "iPhone 16 Pro Max",
    sku: "APL-IPH16PM-256",
    productModel: "A3296",
    status: "active",
    brand: "Apple",
    category: "Smartphones",
    variantsCount: 4,
    visibility: "public",
  },
  {
    id: "2",
    name: "Galaxy S24 Ultra",
    sku: "SAM-S24U-512",
    productModel: "SM-S928B",
    status: "draft",
    brand: "Samsung",
    category: "Smartphones",
    variantsCount: 3,
    visibility: "public",
  },
  {
    id: "3",
    name: "MacBook Pro 14 M3",
    sku: "APL-MBP14M3-16",
    productModel: "A2918",
    status: "inactive",
    brand: "Apple",
    category: "Laptops",
    variantsCount: 2,
    visibility: "supplier_only",
  },
];

export default function ProductsPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [products, setProducts] = React.useState(MOCK);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);

  const filtered = products.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      cell: (row) => <span className="text-muted-foreground">{row.brand}</span>,
    },
    {
      id: "category",
      header: "Category",
      hideOnMobile: true,
      cell: (row) => row.category,
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
            onClick={async () => {
              try {
                const res = await duplicateProductAction(row.id);
                if (res.success && res.data) {
                  setProducts((p) => [
                    {
                      id: res.data!.id,
                      name: res.data!.name,
                      sku: res.data!.sku,
                      productModel: res.data!.productModel || row.productModel,
                      status: "draft",
                      brand: row.brand,
                      category: row.category,
                      variantsCount: row.variantsCount,
                      visibility: row.visibility,
                    },
                    ...p,
                  ]);
                  toast.success("Duplicated as draft");
                }
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Duplicate failed");
              }
            }}
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive/80 hover:bg-destructive/10"
            onClick={async () => {
              try {
                await softDeleteProductAction(row.id);
                setProducts((p) => p.filter((x) => x.id !== row.id));
                toast.success("Product removed");
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Delete failed");
              }
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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
        <>
          <StatCard label="Total" value={products.length} icon={Package} />
          <StatCard
            label="Active"
            value={products.filter((p) => p.status === "active").length}
            accent="success"
          />
          <StatCard
            label="Drafts"
            value={products.filter((p) => p.status === "draft").length}
            accent="warning"
          />
          <StatCard
            label="Inactive"
            value={products.filter((p) => p.status === "inactive").length}
            accent="danger"
          />
        </>
      }
      toolbar={
        <Toolbar
          left={
            <>
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search name, SKU, brand…"
                className="w-full sm:w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
        data={filtered}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        page={page}
        pageSize={10}
        totalCount={filtered.length}
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
