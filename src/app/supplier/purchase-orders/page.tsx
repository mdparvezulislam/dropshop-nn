"use client";

import * as React from "react";
import { toast } from "sonner";
import { ClipboardList, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Spinner } from "@/shared/components/ui/spinner";

type Row = {
  id: string;
  poNumber: string;
  items: number;
  total: number;
  status: string;
  createdAt: string;
};

export default function SupplierPurchaseOrdersPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const { listOrdersAction } = await import("@/features/order/actions/order-actions");
        const res = await listOrdersAction({ limit: 50 });
        if (res.success && res.data) {
          const raw = res.data as any;
          const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
          setRows(items.map((o: any) => ({
            id: o.id ?? o._id,
            poNumber: o.orderNumber ?? o._id?.slice(-6) ?? "—",
            items: o.items?.length ?? 0,
            total: o.grandTotal ?? o.total ?? 0,
            status: o.status ?? "pending",
            createdAt: o.createdAt,
          })));
        }
      } catch {
        toast.error("Failed to load purchase orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "poNumber",
      header: "PO #",
      cell: (r) => <span className="font-mono text-sm font-medium">{r.poNumber}</span>,
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>,
    },
    {
      id: "items",
      header: "Items",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.items}</span>,
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
          <Link href={`/supplier/orders/${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{ title: "Purchase Orders", description: "View and manage purchase orders" }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground"><Spinner size="sm" /> Loading…</div>
        ) : (
          <>
            <StatCard label="Total POs" value={rows.length} icon={ClipboardList} />
            <StatCard label="Pending" value={rows.filter((r) => r.status === "pending").length} icon={Clock} accent="warning" />
            <StatCard label="Accepted" value={rows.filter((r) => r.status === "confirmed").length} icon={CheckCircle2} accent="success" />
            <StatCard label="Rejected" value={rows.filter((r) => r.status === "cancelled").length} icon={XCircle} accent="danger" />
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="No purchase orders"
        emptyDescription="Purchase orders will appear here when created by buyers."
      />
    </ListLayout>
  );
}
