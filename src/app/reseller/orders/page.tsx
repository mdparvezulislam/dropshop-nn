"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ShoppingCart, Eye, Clock, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { listOrdersAction } from "@/features/order/actions/order-actions";
import { getHumanLabel } from "@/features/order/domain/state-machine";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

type Row = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: string;
  grandTotal: number;
  profitTotal: number;
  status: string;
  createdAt: string;
};

export default function ResellerOrdersPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrdersAction({
        page,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: "reseller",
        search: search || undefined,
      });
      if (res.success && res.data) {
        const d = res.data as any;
        const items: Row[] = (d.items ?? []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber ?? "—",
          customerName: o.customer?.name ?? "—",
          customerPhone: o.customer?.phone ?? "—",
          items: o.pricing?.items?.map((i: any) => i.productName).join(", ") ?? "—",
          grandTotal: o.pricing?.grandTotal ?? 0,
          profitTotal: o.profitPreview?.totalProfit ?? 0,
          status: o.status ?? "pending",
          createdAt: o.createdAt,
        }));
        setRows(items);
        setTotalCount(d.totalCount ?? items.length);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "order",
      header: "Order",
      cell: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.orderNumber}</div>
          <div className="text-[11px] text-muted-foreground">
            {new Date(r.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (r) => (
        <div>
          <div className="text-sm">{r.customerName}</div>
          <div className="text-[11px] text-muted-foreground">{r.customerPhone}</div>
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (r) => <span className="font-semibold tabular-nums">{formatCents(r.grandTotal)}</span>,
    },
    {
      id: "profit",
      header: "Profit",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-success">{formatCents(r.profitTotal)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={getHumanLabel(r.status as any)} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/reseller/orders/${r.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "My Orders",
        description: "Track your orders, delivery status, and profit",
        actions: (
          <Link href="/reseller/orders/create">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> New Order
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
            <StatCard label="Total" value={totalCount} icon={ShoppingCart} />
            <StatCard label="Active" value={rows.filter((r) => !["completed", "cancelled", "delivered", "failed"].includes(r.status)).length} icon={Clock} accent="warning" />
            <StatCard label="Completed" value={rows.filter((r) => r.status === "completed").length} icon={CheckCircle2} accent="success" />
            <StatCard label="Total Profit" value={formatCents(rows.reduce((s, r) => s + r.profitTotal, 0))} accent="info" />
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
                placeholder="Search order number or phone…"
                className="w-full sm:w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">All status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/reseller/orders/${r.id}`)}
        emptyTitle="No orders yet"
        emptyDescription="Create your first order to get started."
      />
    </ListLayout>
  );
}
