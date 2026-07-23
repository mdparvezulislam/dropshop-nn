"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList, Plus, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listOrdersAction } from "@/features/order/actions/order-actions";
import { ListLayout } from "@/components/workspace/list-layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  orderNumber: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
};

export default function WholesaleBulkOrdersPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrdersAction({ type: "wholesaler", limit: 50 });
      if (res.success && res.data) {
        const raw = res.data as any;
        const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
        setRows(items.map((o: any) => ({
          id: o.id ?? o._id,
          orderNumber: o.orderNumber ?? o._id?.slice(-6) ?? "—",
          itemCount: o.items?.length ?? 0,
          total: o.grandTotal ?? o.total ?? 0,
          status: o.status ?? "pending",
          createdAt: o.createdAt,
        })));
      }
    } catch {
      toast.error("Failed to load bulk orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "orderNumber",
      header: "Order #",
      cell: (r) => <span className="font-mono text-sm">{r.orderNumber}</span>,
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>
      ),
    },
    {
      id: "items",
      header: "Items",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.itemCount}</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: (r) => <span className="font-semibold tabular-nums">{formatCents(r.total)}</span>,
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
            href={`/wholesale/bulk-orders/${r.id}`}
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
        title: "Bulk Orders",
        description: "Place and manage bulk product orders",
        actions: (
          <Link href="/wholesale/bulk-orders/create">
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> New Bulk Order</Button>
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
            <StatCard label="Total Orders" value={rows.length} icon={ClipboardList} />
            <StatCard label="Pending" value={rows.filter((r) => r.status === "pending").length} accent="warning" />
            <StatCard label="Completed" value={rows.filter((r) => r.status === "completed").length} accent="success" />
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onRowClick={(r) => window.location.href = `/wholesale/bulk-orders/${r.id}`}
        emptyTitle="No bulk orders yet"
        emptyDescription="Place your first bulk order to get started."
      />
    </ListLayout>
  );
}
