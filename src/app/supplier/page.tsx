"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Warehouse,
  ClipboardList,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  XCircle,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { QuickActionsWidget } from "@/shared/components/workspace/widget-grid";
import { cn } from "@/shared/utils/cn";

interface DashboardData {
  productsCount: number;
  productsPending: number;
  productsApproved: number;
  productsRejected: number;
  lowStockCount: number;
  pendingOrders: number;
  completedOrders: number;
  pendingPO: number;
  totalEarnings: number;
  outstandingBalance: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

const DEFAULT: DashboardData = {
  productsCount: 0,
  productsPending: 0,
  productsApproved: 0,
  productsRejected: 0,
  lowStockCount: 0,
  pendingOrders: 0,
  completedOrders: 0,
  pendingPO: 0,
  totalEarnings: 0,
  outstandingBalance: 0,
};

const QUICK_ACTIONS = [
  { label: "Submit Product", href: "/supplier/products/new", icon: Plus },
  { label: "Manage Inventory", href: "/supplier/inventory", icon: Warehouse },
  { label: "Purchase Orders", href: "/supplier/purchase-orders", icon: ClipboardList },
  { label: "Deliveries", href: "/supplier/deliveries", icon: Truck },
  { label: "Payments", href: "/supplier/payments", icon: DollarSign },
  { label: "Reports", href: "/supplier/reports", icon: TrendingUp },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function SupplierDashboardPage(): React.ReactElement {
  const [data, setData] = React.useState<DashboardData>(DEFAULT);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [orderRes, productRes, inventoryRes, financeRes] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) =>
            m.listOrdersAction({ page: 1, limit: 50 }),
          ),
          import("@/features/catalog/actions/product-actions").then((m) =>
            m.listProductsAction({}, { limit: 100 }),
          ),
          import("@/features/inventory/actions/inventory-actions").then((m) =>
            m.listInventoryAction({ limit: 100 }),
          ),
          import("@/features/finance/actions/finance-actions").then((m) =>
            m.getOrCreateUserWalletAction(),
          ),
        ]);

        const d = { ...DEFAULT };

        if (orderRes.status === "fulfilled" && orderRes.value.success) {
          const od = orderRes.value.data as any;
          const items = Array.isArray(od) ? od : od?.items ?? [];
          d.pendingOrders = items.filter(
            (o: any) => !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
          ).length;
          d.completedOrders = items.filter((o: any) => o.status === "completed").length;
          d.pendingPO = items.filter((o: any) => o.status === "pending").length;

          setRecentOrders(
            items.slice(0, 5).map((o: any) => ({
              id: o.id ?? o._id,
              orderNumber: o.orderNumber ?? o._id?.slice(-6) ?? "—",
              customer: o.customerName ?? o.customer?.name ?? "—",
              total: o.grandTotal ?? o.total ?? 0,
              status: o.status ?? "pending",
              createdAt: o.createdAt,
            })),
          );
        }

        if (productRes.status === "fulfilled" && productRes.value.success) {
          const raw = productRes.value.data as any;
          const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
          d.productsCount = items.length;
          d.productsPending = items.filter((p: any) => p.status === "draft" || p.status === "pending").length;
          d.productsApproved = items.filter((p: any) => p.status === "active").length;
          d.productsRejected = items.filter((p: any) => p.status === "rejected").length;
        }

        if (inventoryRes.status === "fulfilled" && inventoryRes.value.success) {
          const raw = inventoryRes.value.data as any;
          const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
          d.lowStockCount = items.filter((i: any) => {
            const stock = i.available ?? i.onHand ?? 0;
            return stock > 0 && stock < 10;
          }).length;
        }

        if (financeRes.status === "fulfilled" && financeRes.value.success) {
          const w = financeRes.value.data as any;
          d.totalEarnings = w?.balance ?? w?.availableBalance ?? 0;
        }

        setData(d);
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.25s_ease-out]">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, hsl(var(--primary) / 0.18), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Supplier Portal
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {greeting()}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Manage your products, inventory, orders, and supply operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/supplier/products/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Submit Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={loading ? "—" : data.productsCount} icon={Package} />
        <StatCard label="Pending Approval" value={loading ? "—" : data.productsPending} icon={Clock} accent="warning" />
        <StatCard label="Approved" value={loading ? "—" : data.productsApproved} icon={CheckCircle2} accent="success" />
        <StatCard label="Rejected" value={loading ? "—" : data.productsRejected} icon={XCircle} accent="danger" />
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Low Stock" value={loading ? "—" : data.lowStockCount} icon={AlertTriangle} accent={data.lowStockCount > 0 ? "warning" : "success"} />
        <StatCard label="Pending Orders" value={loading ? "—" : data.pendingOrders} icon={ShoppingCart} accent="warning" />
        <StatCard label="Completed" value={loading ? "—" : data.completedOrders} icon={CheckCircle2} accent="success" />
        <StatCard label="Balance" value={loading ? "—" : formatCents(data.totalEarnings)} icon={DollarSign} accent="success" />
      </div>

      <QuickActionsWidget title="Quick actions" actions={QUICK_ACTIONS} />

      <section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Recent Orders
                <Link href="/supplier/orders" className="text-xs text-primary hover:underline font-normal">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No recent orders to display.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/supplier/orders/${o.id}`}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{o.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.customer} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">{formatCents(o.total)}</span>
                        <StatusChip label={o.status} tone={statusToneFromValue(o.status)} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Inventory Alerts
                <Link href="/supplier/inventory" className="text-xs text-primary hover:underline font-normal">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.lowStockCount === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  All product stock levels are healthy.
                </div>
              ) : (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-muted-foreground">
                      {data.lowStockCount} product{data.lowStockCount !== 1 ? "s" : ""} running low on stock
                    </span>
                  </div>
                  <Link href="/supplier/inventory" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Review inventory <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
