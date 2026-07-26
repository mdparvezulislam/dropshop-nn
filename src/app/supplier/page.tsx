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
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/workspace/section-header";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { QuickActionsWidget } from "@/components/workspace/widget-grid";
import { cn } from "@/lib/utils/cn";

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
  {
    label: "Submit Product",
    href: "/supplier/products/new",
    icon: Plus,
    description: "Add product to catalog",
  },
  {
    label: "Manage Inventory",
    href: "/supplier/inventory",
    icon: Warehouse,
    description: "Update stock levels",
  },
  {
    label: "Purchase Orders",
    href: "/supplier/purchase-orders",
    icon: ClipboardList,
    description: "Incoming B2B POs",
  },
  {
    label: "Deliveries",
    href: "/supplier/deliveries",
    icon: Truck,
    description: "Dispatch & courier",
  },
  {
    label: "Payments",
    href: "/supplier/payments",
    icon: DollarSign,
    description: "Earnings & settlements",
  },
  {
    label: "Reports",
    href: "/supplier/reports",
    icon: TrendingUp,
    description: "Supply analytics",
  },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatCents(cents: number): string {
  return `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
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
          const items = Array.isArray(od) ? od : (od?.items ?? []);
          d.pendingOrders = items.filter(
            (o: any) =>
              !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
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
          d.productsPending = items.filter(
            (p: any) => p.status === "draft" || p.status === "pending",
          ).length;
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
        // Defaults on error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 sm:p-8 shadow-xs">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 100% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
                <Building2 className="h-3 w-3" /> Supplier Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting()}, Supplier Partner
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Manage product listings, inventory stock levels, purchase orders, and payout
              settlements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/supplier/products/new">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                Submit Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Products Submitted"
          value={data.productsCount}
          icon={Package}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Pending Approval"
          value={data.productsPending}
          icon={Clock}
          accent="warning"
          loading={loading}
        />
        <StatCard
          label="Approved Listings"
          value={data.productsApproved}
          icon={CheckCircle2}
          accent="success"
          loading={loading}
        />
        <StatCard
          label="Rejected Products"
          value={data.productsRejected}
          icon={XCircle}
          accent="danger"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Low Stock Items"
          value={data.lowStockCount}
          icon={AlertTriangle}
          accent={data.lowStockCount > 0 ? "warning" : "success"}
          loading={loading}
        />
        <StatCard
          label="Pending Orders"
          value={data.pendingOrders}
          icon={ShoppingCart}
          accent="warning"
          loading={loading}
        />
        <StatCard
          label="Completed Orders"
          value={data.completedOrders}
          icon={CheckCircle2}
          accent="success"
          loading={loading}
        />
        <StatCard
          label="Available Earnings"
          value={formatCents(data.totalEarnings)}
          icon={DollarSign}
          accent="success"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsWidget title="Quick actions" actions={QUICK_ACTIONS} />

      {/* Recent Orders & Inventory Alerts */}
      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Orders */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Recent Supply Orders</span>
                <Link
                  href="/supplier/orders"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No recent supply orders.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/supplier/orders/${o.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 group"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {o.orderNumber}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {o.customer} ·{" "}
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                          {formatCents(o.total)}
                        </span>
                        <StatusChip
                          label={o.status}
                          tone={statusToneFromValue(o.status)}
                          size="sm"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory alert card */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Inventory Stock Status</span>
                <Link
                  href="/supplier/inventory"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Manage stock <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {data.lowStockCount === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                  <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    Stock levels are healthy
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    All items have sufficient inventory on hand.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                  <div className="h-10 w-10 rounded-full bg-warning/10 text-warning flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    {data.lowStockCount} item{data.lowStockCount !== 1 ? "s" : ""} low on stock
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Update inventory quantities to prevent stockouts.
                  </p>
                  <Link href="/supplier/inventory">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      Update inventory
                    </Button>
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
