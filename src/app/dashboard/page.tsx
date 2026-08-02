"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Building2,
  Store,
  Warehouse,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  FileEdit,
  Bell,
  ShoppingCart,
  TrendingUp,
  Users,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/workspace/stat-card";
import { SectionHeader } from "@/components/workspace/section-header";
import { StatusChip } from "@/components/workspace/status-chip";
import { QuickActionsWidget } from "@/components/workspace/widget-grid";
import { FulfillmentOpsSection } from "@/components/dashboard/fulfillment/fulfillment-ops-section";
import { cn } from "@/lib/utils/cn";

interface DashboardData {
  ordersTotal: number;
  ordersActive: number;
  ordersCompleted: number;
  ordersRevenue: number;
  adminProfitTaka: number;
  adminTotalProfitAll: number;
  resellerProfitTaka: number;
  resellerTotalProfitAll: number;
  suppliersTotal: number;
  suppliersActive: number;
  suppliersPending: number;
  inventoryLowStock: number;
  inventoryOutOfStock: number;
  inventoryTotalSkus: number;
  resellersTotal: number;
  resellersActive: number;
  resellersPending: number;
  customerCount: number;
  productDrafts: number;
  productCount: number;
  pendingApprovals: number;
}

const DEFAULT_DASHBOARD: DashboardData = {
  ordersTotal: 0,
  ordersActive: 0,
  ordersCompleted: 0,
  ordersRevenue: 0,
  adminProfitTaka: 0,
  adminTotalProfitAll: 0,
  resellerProfitTaka: 0,
  resellerTotalProfitAll: 0,
  suppliersTotal: 0,
  suppliersActive: 0,
  suppliersPending: 0,
  inventoryLowStock: 0,
  inventoryOutOfStock: 0,
  inventoryTotalSkus: 0,
  resellersTotal: 0,
  resellersActive: 0,
  resellersPending: 0,
  customerCount: 0,
  productDrafts: 0,
  productCount: 0,
  pendingApprovals: 0,
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    label: "New product",
    href: "/dashboard/products/new",
    icon: Package,
    description: "Add item to catalog",
  },
  {
    label: "Onboard merchant",
    href: "/dashboard/suppliers/new",
    icon: Building2,
    description: "Register supply partner",
  },
  {
    label: "Onboard reseller",
    href: "/dashboard/resellers/new",
    icon: Store,
    description: "Activate seller store",
  },
  {
    label: "Adjust stock",
    href: "/dashboard/inventory/adjust",
    icon: Warehouse,
    description: "Inventory adjustments",
  },
  {
    label: "Update pricing",
    href: "/dashboard/pricing/bulk",
    icon: DollarSign,
    description: "Bulk price management",
  },
];

const NEED_ATTENTION = [
  {
    title: "Products low on stock",
    detail: "Below reorder threshold",
    href: "/dashboard/inventory/low-stock",
    tone: "warning" as const,
    icon: AlertTriangle,
    key: "inventoryLowStock",
  },
  {
    title: "Merchants pending review",
    detail: "Awaiting verification",
    href: "/dashboard/suppliers",
    tone: "info" as const,
    icon: Building2,
    key: "suppliersPending",
  },
  {
    title: "Draft products",
    detail: "Ready to publish",
    href: "/dashboard/products",
    tone: "neutral" as const,
    icon: FileEdit,
    key: "productDrafts",
  },
  {
    title: "Resellers pending approval",
    detail: "Awaiting activation",
    href: "/dashboard/resellers",
    tone: "primary" as const,
    icon: Store,
    key: "resellersPending",
  },
];

const RECENT_ACTIVITY = [
  { text: "Platform bootstrap initialized cleanly", time: "Just now", icon: CheckCircle2 },
  { text: "Real-time sync active across all merchants", time: "Startup", icon: Clock },
];

export default function WorkspaceHomePage(): React.ReactElement {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const [data, setData] = React.useState<DashboardData>(DEFAULT_DASHBOARD);
  const [loading, setLoading] = React.useState(true);
  const [chartRange, setChartRange] = React.useState<"weekly" | "monthly" | "yearly">("monthly");

  React.useEffect(() => {
    async function load() {
      try {
        const [
          ordersRes,
          orderStatsRes,
          suppliersRes,
          invRes,
          resellersRes,
          customersRes,
          productsRes,
          identityRes,
        ] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) =>
            m.listOrdersAction({ page: 1, limit: 10 }),
          ),
          import("@/features/order/actions/order-actions").then((m) =>
            m.getOrderDashboardStatsAction(),
          ),
          import("@/features/supplier/actions/supplier-actions").then((m) =>
            m.listSuppliersAction({ page: 1, limit: 10 }),
          ),
          import("@/features/inventory/actions/inventory-actions").then((m) =>
            m.getInventoryDashboardAction(),
          ),
          import("@/features/reseller/actions/reseller-actions").then((m) =>
            m.listResellersAction({ page: 1, limit: 10 }),
          ),
          import("@/features/customer/actions/customer-actions").then((m) =>
            m.listCustomersAction(""),
          ),
          import("@/features/catalog/actions/product-actions").then((m) =>
            m.listProductsAction({}, { limit: 10 }),
          ),
          import("@/features/identity/actions/admin-identity-actions").then((m) =>
            m.getIdentityOpsOverviewAction(),
          ),
        ]);

        const d = { ...DEFAULT_DASHBOARD };

        if (ordersRes.status === "fulfilled" && ordersRes.value.success) {
          const od = ordersRes.value.data as any;
          d.ordersTotal = od?.totalCount ?? od?.items?.length ?? 0;
          d.ordersActive =
            od?.items?.filter(
              (o: any) => !["completed", "cancelled", "failed", "refunded"].includes(o.status),
            ).length ?? 0;
          d.ordersCompleted = od?.items?.filter((o: any) => o.status === "completed").length ?? 0;
          d.ordersRevenue =
            od?.items?.reduce((s: number, o: any) => s + (o.pricing?.grandTotal ?? 0), 0) ?? 0;
        }

        if (orderStatsRes.status === "fulfilled" && orderStatsRes.value.success && orderStatsRes.value.data) {
          const st = orderStatsRes.value.data;
          d.ordersRevenue = st.total_delivered_revenue || d.ordersRevenue;
          d.adminProfitTaka = st.total_delivered_profit || 0;
          d.adminTotalProfitAll = st.total_admin_profit_all || d.adminProfitTaka;
          d.resellerProfitTaka = st.reseller_total_profit || 0;
          d.resellerTotalProfitAll = st.reseller_total_profit_all || d.resellerProfitTaka;
          if (st.delivered !== undefined) d.ordersCompleted = st.delivered;
        }

        if (suppliersRes.status === "fulfilled" && suppliersRes.value.success) {
          const sd = suppliersRes.value.data as any;
          d.suppliersTotal = sd?.totalCount ?? sd?.items?.length ?? 0;
          d.suppliersActive = sd?.items?.filter((s: any) => s.status === "active").length ?? 0;
          d.suppliersPending = sd?.items?.filter((s: any) => s.status === "pending").length ?? 0;
        }

        if (invRes.status === "fulfilled" && invRes.value.success) {
          const iv = invRes.value.data as any;
          d.inventoryTotalSkus = iv?.totalSkus ?? 0;
          d.inventoryLowStock = iv?.lowStock ?? 0;
          d.inventoryOutOfStock = iv?.outOfStock ?? 0;
        }

        if (resellersRes.status === "fulfilled" && resellersRes.value.success) {
          const rd = resellersRes.value.data as any;
          d.resellersTotal = rd?.totalCount ?? rd?.items?.length ?? 0;
          d.resellersActive = rd?.items?.filter((r: any) => r.status === "active").length ?? 0;
          d.resellersPending = rd?.items?.filter((r: any) => r.status === "pending").length ?? 0;
        }

        if (customersRes.status === "fulfilled" && customersRes.value.success) {
          const cd = customersRes.value.data;
          d.customerCount = Array.isArray(cd) ? cd.length : ((cd as any)?.totalCount ?? 0);
        }

        if (productsRes.status === "fulfilled" && productsRes.value.success) {
          const pd = productsRes.value.data as any;
          d.productCount = pd?.totalCount ?? pd?.items?.length ?? 0;
          d.productDrafts = pd?.items?.filter((p: any) => p.status === "draft").length ?? 0;
        }

        if (identityRes.status === "fulfilled" && identityRes.value.success) {
          const id = identityRes.value.data as { pendingApprovals?: number } | undefined;
          d.pendingApprovals = id?.pendingApprovals ?? 0;
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

  const attentionItems = NEED_ATTENTION.map((item) => {
    const count = data[item.key as keyof DashboardData] as number;
    return {
      ...item,
      title: count > 0 ? `${count} ${item.title.toLowerCase()}` : `No ${item.title.toLowerCase()}`,
    };
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-3 sm:p-6 max-w-[1600px] mx-auto">
      {/* Mobile App Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 100% 0%, hsl(var(--primary) / 0.15), transparent 60%)",
          }}
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                <Sparkles className="h-3 w-3" /> Operations Center
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">{dateLabel}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {greeting()}, Admin
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/notifications">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-2xs">
                <Bell className="h-3.5 w-3.5 text-primary" />
                <span>{data.inventoryLowStock + data.suppliersPending} Alerts</span>
              </Button>
            </Link>
            <Link href="/dashboard/products/new">
              <Button size="sm" className="gap-1.5 text-xs font-bold shadow-xs">
                <Plus className="h-3.5 w-3.5" />
                New Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Stat Cards Grid */}
      <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Delivered Revenue"
          value={`৳ ${data.ordersRevenue.toLocaleString("bn-BD")}`}
          icon={TrendingUp}
          accent="success"
          trend={{ value: "+22%", positive: true }}
          loading={loading}
        />
        <StatCard
          label="Admin Net Profit"
          value={`৳ ${data.adminProfitTaka.toLocaleString("bn-BD")}`}
          icon={DollarSign}
          accent="primary"
          hint={`Pipeline total: ৳ ${data.adminTotalProfitAll.toLocaleString("bn-BD")}`}
          loading={loading}
        />
        <StatCard
          label="Reseller Delivered Profit"
          value={`৳ ${data.resellerProfitTaka.toLocaleString("bn-BD")}`}
          icon={Store}
          accent="warning"
          hint="Reseller net earnings"
          loading={loading}
        />
        <StatCard
          label="Total Orders"
          value={data.ordersTotal}
          icon={ShoppingCart}
          accent="info"
          loading={loading}
        />
        <StatCard
          label="Active Orders"
          value={data.ordersActive}
          icon={Clock}
          accent="warning"
          hint="Processing & shipped"
          loading={loading}
        />
        <StatCard
          label="Low Stock Alert"
          value={data.inventoryLowStock}
          icon={AlertTriangle}
          accent="danger"
          hint="Needs replenishment"
          loading={loading}
        />
        <StatCard
          label="Merchants & Supply"
          value={`${data.suppliersActive}/${data.suppliersTotal}`}
          icon={Building2}
          accent="info"
          loading={loading}
        />
        <StatCard
          label="Active Resellers"
          value={`${data.resellersActive}/${data.resellersTotal}`}
          icon={Store}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Catalog Products"
          value={data.productCount}
          icon={Package}
          accent="success"
          loading={loading}
        />
        <StatCard
          label="Total Customers"
          value={data.customerCount}
          icon={Users}
          accent="warning"
          loading={loading}
        />
      </div>

      {/* Fulfillment Operations */}
      <FulfillmentOpsSection />

      {/* Sales & Performance Chart */}
      <Card className="border-border bg-card shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Sales Performance
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Revenue growth and order metrics overview
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            {(["weekly", "monthly", "yearly"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setChartRange(r)}
                className={cn(
                  "rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold capitalize transition-all",
                  chartRange === r
                    ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="h-40 sm:h-48 flex items-end justify-between gap-1.5 sm:gap-2 border-b border-border pb-3 pt-3">
            {[45, 60, 35, 70, 85, 50, 95, 80, 65, 90, 75, 100].map((h, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  style={{ height: `${h}%` }}
                  className="w-full max-w-[24px] sm:max-w-[28px] rounded-t-md bg-gradient-to-t from-primary/60 to-primary group-hover:from-primary group-hover:to-primary/80 transition-all duration-200"
                  title={`Period ${idx + 1}: ৳${(h * 1250).toLocaleString()}`}
                />
                <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                  P{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Widget */}
      <QuickActionsWidget actions={QUICK_ACTIONS} />

      {/* Need Attention & Activity Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Need attention column */}
        <section className="lg:col-span-3 space-y-3">
          <SectionHeader
            title="Need Attention"
            description="Items requiring administrative review or action"
          />
          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
            {attentionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}>
                  <Card className="h-full border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group active:scale-[0.99]">
                    <CardContent className="p-3.5 flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:scale-105 transition-transform">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-xs font-bold text-foreground leading-snug truncate">
                            {item.title}
                          </p>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                          {item.detail}
                        </p>
                        <div className="mt-2">
                          <StatusChip label="Action needed" tone={item.tone} size="sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Activity column */}
        <section className="lg:col-span-2 space-y-3">
          <div>
            <SectionHeader title="Recent Activity" />
            <Card className="border-border shadow-2xs">
              <CardContent className="p-2">
                <ul className="divide-y divide-border/60">
                  {RECENT_ACTIVITY.map((a) => {
                    const Icon = a.icon;
                    return (
                      <li key={a.text} className="flex gap-2.5 px-3 py-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground leading-snug">
                            {a.text}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {a.time}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
