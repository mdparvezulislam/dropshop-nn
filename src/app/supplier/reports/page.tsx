"use client";

import * as React from "react";
import { toast } from "sonner";
import { BarChart3, TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  orders: number;
  revenue: number;
  stock: number;
};

export default function SupplierReportsPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState({ orders: 0, revenue: 0, products: 0 });
  const [topProducts, setTopProducts] = React.useState<ProductRow[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const [orderRes] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) => m.listOrdersAction({ limit: 100 })),
        ]);

        const s = { orders: 0, revenue: 0, products: 0 };

        if (orderRes.status === "fulfilled" && orderRes.value.success) {
          const raw = orderRes.value.data as any;
          const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
          s.orders = items.length;
          s.revenue = items.reduce((acc: number, o: any) => acc + (o.grandTotal ?? o.total ?? 0), 0);
          const productMap = new Map<string, ProductRow>();
          items.forEach((o: any) => {
            (o.items ?? []).forEach((item: any) => {
              const key = item.productId ?? item.sku ?? item.name;
              if (!key) return;
              const existing = productMap.get(key) ?? {
                id: key,
                name: item.productName ?? item.name ?? "Unknown",
                sku: item.sku ?? "—",
                orders: 0,
                revenue: 0,
                stock: 0,
              };
              existing.orders++;
              existing.revenue += (item.totalPrice ?? item.price ?? 0);
              productMap.set(key, existing);
            });
          });
          s.products = productMap.size;
          setTopProducts(Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10));
        }

        setSummary(s);
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

  const columns: DataTableColumn<ProductRow>[] = [
    {
      id: "name",
      header: "Product",
      cell: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.name}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.sku}</div>
        </div>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      cell: (r) => <span className="tabular-nums">{r.orders}</span>,
    },
    {
      id: "revenue",
      header: "Revenue",
      cell: (r) => <span className="tabular-nums font-semibold text-success">{formatCents(r.revenue)}</span>,
    },
    {
      id: "stock",
      header: "Stock",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.stock}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader title="Reports" description="Your sales performance and product insights" />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={loading ? "—" : summary.orders.toString()} icon={ShoppingCart} />
        <StatCard label="Total Revenue" value={loading ? "—" : formatCents(summary.revenue)} icon={DollarSign} />
        <StatCard label="Products Sold" value={loading ? "—" : summary.products.toString()} icon={Package} />
        <StatCard label="Avg Order Value" value={loading || summary.orders === 0 ? "—" : formatCents(Math.round(summary.revenue / summary.orders))} icon={TrendingUp} accent="info" />
      </div>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Top Products</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={topProducts}
            loading={loading}
            emptyTitle="No data yet"
            emptyDescription="Product data will appear after orders are placed."
          />
        </CardContent>
      </Card>
    </div>
  );
}
