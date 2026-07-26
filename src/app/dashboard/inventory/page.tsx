"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Warehouse, AlertTriangle, History, SlidersHorizontal, Package } from "lucide-react";
import { toast } from "sonner";
import {
  listInventoryAction,
  getInventoryDashboardAction,
} from "@/features/inventory/actions/inventory-actions";
import { ListLayout } from "@/components/workspace/list-layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { SearchBox } from "@/components/workspace/search-box";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  productName: string;
  variantSku: string;
  availableStock: number;
  reservedStock: number;
  incomingStock: number;
  reorderLevel: number;
  availability: string;
};

export default function InventoryPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [availability, setAvailability] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [allRows, setAllRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [dashboard, setDashboard] = React.useState({
    totalSkus: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const pageSize = 10;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, dashRes] = await Promise.allSettled([
        listInventoryAction({
          page: 1,
          limit: 100,
          availability: availability === "all" ? undefined : availability,
        }),
        getInventoryDashboardAction(),
      ]);

      if (listRes.status === "fulfilled" && listRes.value.success) {
        const d = listRes.value.data as any;
        const items: Row[] = (d.items ?? []).map((i: any) => ({
          id: i.id,
          productName: i.productName ?? i.productId?.title ?? "",
          variantSku: i.variantSku ?? "",
          availableStock: i.availableStock ?? 0,
          reservedStock: i.reservedStock ?? 0,
          incomingStock: i.incomingStock ?? 0,
          reorderLevel: i.reorderLevel ?? 0,
          availability: i.availability ?? "unknown",
        }));
        setAllRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }

      if (dashRes.status === "fulfilled" && dashRes.value.success) {
        const d = dashRes.value.data as any;
        setDashboard({
          totalSkus: d?.totalSkus ?? 0,
          inStock: d?.inStock ?? 0,
          lowStock: d?.lowStock ?? 0,
          outOfStock: d?.outOfStock ?? 0,
        });
      }
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [availability]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return allRows;
    const q = search.toLowerCase();
    return allRows.filter(
      (r) => r.productName.toLowerCase().includes(q) || r.variantSku.toLowerCase().includes(q),
    );
  }, [allRows, search]);

  const totalFiltered = search.trim() ? filtered.length : totalCount;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "product",
      header: "Product / SKU",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.productName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.variantSku}</div>
        </div>
      ),
    },
    {
      id: "available",
      header: "Available",
      cell: (r) => <span className="font-semibold tabular-nums">{r.availableStock}</span>,
    },
    {
      id: "reserved",
      header: "Reserved",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.reservedStock}</span>,
    },
    {
      id: "incoming",
      header: "Incoming",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-info">{r.incomingStock}</span>,
    },
    {
      id: "reorder",
      header: "Reorder",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.reorderLevel}</span>,
    },
    {
      id: "availability",
      header: "Availability",
      cell: (r) => <StatusChip label={r.availability} tone={statusToneFromValue(r.availability)} />,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="text-right">
          <Link
            href={`/dashboard/inventory/adjust?id=${r.id}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Adjust
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "Inventory",
        description: "Stock levels, reservations, and warehouse-ready control",
        actions: (
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/inventory/low-stock">
              <Button variant="outline" size="sm" className="gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Low stock
              </Button>
            </Link>
            <Link href="/dashboard/inventory/history">
              <Button variant="outline" size="sm" className="gap-1.5">
                <History className="h-3.5 w-3.5" /> History
              </Button>
            </Link>
            <Link href="/dashboard/inventory/adjust">
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
              </Button>
            </Link>
            <Link href="/dashboard/inventory/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add stock
              </Button>
            </Link>
          </div>
        ),
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="SKUs" value={dashboard.totalSkus} icon={Package} />
            <StatCard
              label="In stock"
              value={dashboard.inStock}
              accent="success"
              icon={Warehouse}
            />
            <StatCard label="Low stock" value={dashboard.lowStock} accent="warning" />
            <StatCard label="Out of stock" value={dashboard.outOfStock} accent="danger" />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <>
              <SearchBox
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search product or SKU…"
                className="w-full sm:w-72"
              />
              <select
                value={availability}
                onChange={(e) => {
                  setAvailability(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All availability</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="backorder">Backorder</option>
              </select>
            </>
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalFiltered}
        onPageChange={setPage}
        emptyTitle="No inventory records"
        emptyDescription="Add stock to your products to see them here."
      />
    </ListLayout>
  );
}
