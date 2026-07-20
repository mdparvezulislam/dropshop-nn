"use client";

import * as React from "react";
import { toast } from "sonner";
import { BarChart3, TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";

type OrderRow = {
  id: string;
  customer: string;
  total: number;
  profit: number;
  status: string;
  createdAt: string;
};

export default function ResellerReportsPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [summary, setSummary] = React.useState({ orders: 0, totalRevenue: 0, totalProfit: 0, pendingProfit: 0 });

  React.useEffect(() => {
    async function load() {
      try {
        const [{ listOrdersAction }, { getOrCreateUserWalletAction }] = await Promise.all([
          import("@/features/order/actions/order-actions"),
          import("@/features/finance/actions/finance-actions"),
        ]);

        const [orderRes, walletRes] = await Promise.allSettled([
          listOrdersAction({}),
          getOrCreateUserWalletAction(),
        ]);

        if (orderRes.status === "fulfilled" && orderRes.value.success) {
          const items = (Array.isArray(orderRes.value.data) ? orderRes.value.data : []) as any[];
          const s = { orders: 0, totalRevenue: 0, totalProfit: 0, pendingProfit: 0 };
          const mapped: OrderRow[] = items.map((o: any) => {
            const total = o.total ?? 0;
            const profit = o.profit ?? 0;
            s.orders++;
            s.totalRevenue += total;
            s.totalProfit += profit;
            if (o.status === "pending" || o.status === "processing") s.pendingProfit += profit;
            return {
              id: o.id ?? o._id,
              customer: o.customerName ?? o.customer?.name ?? "—",
              total,
              profit,
              status: o.status ?? "unknown",
              createdAt: o.createdAt,
            };
          });
          setRows(mapped);
          setSummary(s);
        }

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          setSummary((prev) => ({ ...prev, pendingProfit: w?.pendingProfit ?? prev.pendingProfit }));
        }
      } catch {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<OrderRow>[] = [
    {
      id: "date",
      header: "Date",
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (r) => <span>{r.customer}</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCents(r.total)}</span>,
    },
    {
      id: "profit",
      header: "Profit",
      cell: (r) => (
        <span className="tabular-nums font-semibold text-success">{formatCents(r.profit)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader title="Reports" description="Your earnings and order analytics" />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={loading ? "—" : summary.orders.toString()} icon={ShoppingCart} />
        <StatCard label="Total Revenue" value={loading ? "—" : formatCents(summary.totalRevenue)} icon={DollarSign} />
        <StatCard label="Total Profit" value={loading ? "—" : formatCents(summary.totalProfit)} icon={TrendingUp} accent="success" />
        <StatCard label="Pending Profit" value={loading ? "—" : formatCents(summary.pendingProfit)} icon={BarChart3} accent="warning" />
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Order Profit Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            emptyTitle="No data yet"
            emptyDescription="Place orders to see your earnings."
          />
        </CardContent>
      </Card>
    </div>
  );
}
