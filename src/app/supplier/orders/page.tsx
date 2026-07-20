"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";
import { listOrdersAction } from "@/features/order/actions/order-actions";
import { ResourceListPage } from "@/shared/components/workspace/resource-list-page";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import type { DataTableColumn } from "@/shared/components/ui/data-table";

type Row = {
  id: string;
  orderNumber: string;
  customer: string;
  grandTotal: number;
  status: string;
  tracking: string;
  createdAt: string;
};

export default function SupplierOrdersPage(): React.ReactElement {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrdersAction({ search: search || undefined, limit: 50 });
      if (res.success && res.data) {
        const raw = res.data as any;
        const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
        setRows(
          items.map((o: any) => ({
            id: o.id ?? o._id,
            orderNumber: o.orderNumber ?? o._id?.slice(-6) ?? "—",
            customer: o.customerName ?? o.customer?.name ?? "—",
            grandTotal: o.grandTotal ?? o.total ?? 0,
            status: o.status ?? "pending",
            tracking: o.trackingNumber ?? o.tracking?.number ?? "",
            createdAt: o.createdAt,
          })),
        );
      }
    } catch {
      toast.error("Failed to load orders");
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
      id: "orderNumber",
      header: "Order #",
      cell: (r) => <span className="font-mono text-sm font-medium">{r.orderNumber}</span>,
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (r) => <span className="text-muted-foreground">{r.customer}</span>,
    },
    {
      id: "total",
      header: "Total",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">{formatCents(r.grandTotal)}</span>
      ),
    },
    {
      id: "tracking",
      header: "Tracking",
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">{r.tracking || "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Fulfillment",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/supplier/orders/${r.id}`}
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
      title="Orders"
      description="View and fulfill customer orders"
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search orders…",
      }}
      stats={
        loading ? undefined : (
          <>
            <StatCard label="Total Orders" value={rows.length} icon={ShoppingCart} />
            <StatCard
              label="Pending"
              value={
                rows.filter(
                  (r) => !["completed", "cancelled", "delivered", "refunded"].includes(r.status),
                ).length
              }
              accent="warning"
            />
            <StatCard
              label="Fulfilled"
              value={rows.filter((r) => ["completed", "delivered"].includes(r.status)).length}
              accent="success"
            />
          </>
        )
      }
      columns={columns}
      data={rows}
      loading={loading}
      emptyTitle="No orders yet"
      emptyDescription="Orders from customers will appear here."
    />
  );
}
