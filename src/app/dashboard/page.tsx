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
  Truck,
  Bell,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { StatusChip } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

interface DashboardData {
  ordersTotal: number;
  ordersActive: number;
  ordersCompleted: number;
  ordersRevenue: number;
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
}

const DEFAULT_DASHBOARD: DashboardData = {
  ordersTotal: 0,
  ordersActive: 0,
  ordersCompleted: 0,
  ordersRevenue: 0,
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
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  { label: "New product", href: "/dashboard/products/new", icon: Package },
  { label: "Onboard supplier", href: "/dashboard/suppliers/new", icon: Building2 },
  { label: "Onboard reseller", href: "/dashboard/resellers/new", icon: Store },
  { label: "Adjust stock", href: "/dashboard/inventory/adjust", icon: Warehouse },
  { label: "Update pricing", href: "/dashboard/pricing/bulk", icon: DollarSign },
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
    title: "Suppliers pending review",
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
  { text: "Platform bootstrap initialized", time: "Just now", icon: CheckCircle2 },
  { text: "Listening for order & supplier events", time: "Startup", icon: Clock },
];

const SUPPLIER_ALERTS = [
  { text: "Vertex Logistics online", detail: "Last sync 4 min ago", icon: CheckCircle2, tone: "success" as const },
  { text: "Amana lead time increased", detail: "Now 5 days · was 3", icon: Truck, tone: "warning" as const },
  { text: "Standard Trading suspended", detail: "Review compliance docs", icon: AlertTriangle, tone: "danger" as const },
];

export default function WorkspaceHomePage(): React.ReactElement {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const [data, setData] = React.useState<DashboardData>(DEFAULT_DASHBOARD);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [
          ordersRes,
          suppliersRes,
          invRes,
          resellersRes,
          customersRes,
          productsRes,
        ] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) =>
            m.listOrdersAction({ page: 1, limit: 1 }),
          ),
          import("@/features/supplier/actions/supplier-actions").then((m) =>
            m.listSuppliersAction({ page: 1, limit: 1 }),
          ),
          import("@/features/inventory/actions/inventory-actions").then((m) =>
            m.getInventoryDashboardAction(),
          ),
          import("@/features/reseller/actions/reseller-actions").then((m) =>
            m.listResellersAction({ page: 1, limit: 1 }),
          ),
          import("@/features/customer/actions/customer-actions").then((m) =>
            m.listCustomersAction(""),
          ),
          import("@/features/catalog/actions/product-actions").then((m) =>
            m.listProductsAction({}, { limit: 1 }),
          ),
        ]);

        const d = { ...DEFAULT_DASHBOARD };

        if (ordersRes.status === "fulfilled" && ordersRes.value.success) {
          const od = ordersRes.value.data as any;
          d.ordersTotal = od?.totalCount ?? od?.items?.length ?? 0;
          d.ordersActive = od?.items?.filter((o: any) =>
            !["completed", "cancelled", "failed", "refunded"].includes(o.status)
          ).length ?? 0;
          d.ordersCompleted = od?.items?.filter((o: any) => o.status === "completed").length ?? 0;
          d.ordersRevenue = od?.items?.reduce((s: number, o: any) =>
            s + (o.pricing?.grandTotal ?? 0), 0) ?? 0;
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
          d.customerCount = Array.isArray(cd) ? cd.length : (cd as any)?.totalCount ?? 0;
        }

        if (productsRes.status === "fulfilled" && productsRes.value.success) {
          const pd = productsRes.value.data as any;
          d.productCount = pd?.totalCount ?? pd?.items?.length ?? 0;
          d.productDrafts = pd?.items?.filter((p: any) => p.status === "draft").length ?? 0;
        }

        setData(d);
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const attentionItems = NEED_ATTENTION.map((item) => {
    const count = data[item.key as keyof DashboardData] as number;
    return {
      ...item,
      title: count > 0 ? `${count} ${item.title.toLowerCase()}` : `No ${item.title.toLowerCase()}`,
    };
  });

  return (
    <div className="space-y-6 animate-[fade-in_0.25s_ease-out]">
      {/* Greeting */}
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
              {dateLabel}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {greeting()}, Admin
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Your commerce workspace — catalog, partners, inventory, and pricing in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" />{data.inventoryLowStock + data.suppliersPending} alerts
            </Button>
            <Link href="/dashboard/products/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.ordersTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : formatCents(data.ordersRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Orders</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.ordersActive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock</p>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.inventoryLowStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suppliers</p>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-info" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.suppliersActive}/{data.suppliersTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resellers</p>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.resellersActive}/{data.resellersTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Products</p>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-success" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.productCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customers</p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-warning" />
              <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : data.customerCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <section>
        <SectionHeader title="Quick actions" description="Jump into common workflows" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href + action.label}
                href={action.href}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs",
                  "hover:border-primary/30 hover:shadow-md transition-all duration-150",
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Need attention */}
        <section className="lg:col-span-3 space-y-3">
          <SectionHeader title="Need attention" description="Items that need your decision" />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {attentionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}>
                  <Card className="h-full hover:border-primary/25 transition-colors">
                    <CardContent className="p-4 flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {item.title}
                          </p>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                        <div className="mt-2">
                          <StatusChip label="Action needed" tone={item.tone} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Activity + alerts */}
        <section className="lg:col-span-2 space-y-5">
          <div>
            <SectionHeader title="Recent activity" />
            <Card>
              <CardContent className="p-2">
                <ul className="divide-y divide-border">
                  {RECENT_ACTIVITY.map((a) => {
                    const Icon = a.icon;
                    return (
                      <li key={a.text} className="flex gap-3 px-3 py-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground leading-snug">{a.text}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
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

          <div>
            <SectionHeader title="Supplier alerts" />
            <Card>
              <CardContent className="p-4 space-y-3">
                {SUPPLIER_ALERTS.map((a) => {
                  const Icon = a.icon;
                  return (
                    <div key={a.text} className="flex gap-3">
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 mt-0.5",
                        a.tone === "success" && "text-success",
                        a.tone === "warning" && "text-warning",
                        a.tone === "danger" && "text-destructive",
                      )} />
                      <div>
                        <p className="text-sm font-medium">{a.text}</p>
                        <p className="text-xs text-muted-foreground">{a.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
