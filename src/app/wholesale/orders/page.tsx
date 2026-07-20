"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, ShoppingCart, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { listOrdersAction } from "@/features/order/actions/order-actions";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { Toolbar } from "@/shared/components/workspace/toolbar";
import { SearchBox } from "@/shared/components/workspace/search-box";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Spinner } from "@/shared/components/ui/spinner";

type Row = {
  id: string;
  orderNumber: string;
  items: string;
  grandTotal: number;
  status: string;
  tracking: string;
  createdAt: string;
};

export default function WholesaleOrderHistoryPage(): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrdersAction({ type: "wholesaler", search: search || undefined, limit: 50 });
      if (res.success && res.data) {
        const raw = res.data as any;
        const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
        setRows(items.map((o: any) => ({
          id: o.id ?? o._id,
          orderNumber: o.orderNumber ?? o._id?.slice(-6) ?? "—",
          items: o.items?.map((i: any) => i.productName ?? i.name).join(", ") ?? "—",
          grandTotal: o.grandTotal ?? o.total ?? 0,
          status: o.status ?? "pending",
          tracking: o.trackingNumber ?? o.tracking?.number ?? "",
          createdAt: o.createdAt,
        })));
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => { load(); }, [load]);

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
        <span className="text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: (r) => <span className="text-muted-foreground truncate max-w-[200px] block">{r.items}</span>,
    },
    {
      id: "total",
      header: "Total",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCents(r.grandTotal)}</span>,
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
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/wholesale/orders/${r.id}`}
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
        title: "Order History",
        description: "Track and review all your wholesale orders",
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total Orders" value={rows.length} icon={History} />
            <StatCard label="Active" value={rows.filter((r) => !["completed", "cancelled", "delivered", "refunded"].includes(r.status)).length} accent="info" />
            <StatCard label="Completed" value={rows.filter((r) => r.status === "completed" || r.status === "delivered").length} accent="success" />
            <StatCard label="Cancelled" value={rows.filter((r) => r.status === "cancelled").length} accent="danger" />
          </>
        )
      }
      toolbar={
        <Toolbar
          left={
            <SearchBox
              value={search}
              onChange={(v) => { setSearch(v); }}
              placeholder="Search orders…"
              className="w-full sm:w-72"
            />
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onRowClick={(r) => router.push(`/wholesale/orders/${r.id}`)}
        emptyTitle="No orders yet"
        emptyDescription="Place your first bulk order to see order history."
      />
    </ListLayout>
  );
}
