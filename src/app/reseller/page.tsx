"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Plus,
  Clock,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  ArrowRight,
  Store,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/workspace/section-header";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { QuickActionsWidget } from "@/components/workspace/widget-grid";
import { cn } from "@/lib/utils/cn";

interface DashboardData {
  ordersToday: number;
  ordersPending: number;
  ordersCompleted: number;
  pendingProfit: number;
  availableBalance: number;
  productsTotal: number;
  productsActive: number;
  customersTotal: number;
  shopName: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  profit: number;
  status: string;
  createdAt: string;
}

const DEFAULT: DashboardData = {
  ordersToday: 0,
  ordersPending: 0,
  ordersCompleted: 0,
  pendingProfit: 0,
  availableBalance: 0,
  productsTotal: 0,
  productsActive: 0,
  customersTotal: 0,
  shopName: "My Shop",
};

const QUICK_ACTIONS = [
  { label: "New Order", href: "/reseller/orders/create", icon: Plus, description: "Place customer order" },
  { label: "My Products", href: "/reseller/products", icon: Package, description: "Manage reseller catalog" },
  { label: "Customers", href: "/reseller/customers", icon: Users, description: "View customer database" },
  { label: "Wallet", href: "/reseller/wallet", icon: Wallet, description: "Earnings & withdrawals" },
  { label: "Marketing Kit", href: "/reseller/marketing-kit", icon: ImageIcon, description: "Banners & promos" },
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

export default function ResellerDashboardPage(): React.ReactElement {
  const [data, setData] = React.useState<DashboardData>(DEFAULT);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [
          profileMod,
          dashMod,
          ordersMod,
          walletMod,
          customersMod,
        ] = await Promise.all([
          import("@/features/reseller/actions/reseller-actions"),
          import("@/features/reseller/actions/reseller-actions"),
          import("@/features/order/actions/order-actions"),
          import("@/features/finance/actions/finance-actions"),
          import("@/features/customer/actions/customer-actions"),
        ]);

        const [profileRes, dashRes, ordersRes, walletRes, customersRes] =
          await Promise.allSettled([
            profileMod.resolveCurrentResellerAction(),
            dashMod.getResellerDashboardAction(),
            ordersMod.listOrdersAction({ type: "reseller", page: 1, limit: 50 }),
            walletMod.getOrCreateUserWalletAction(),
            customersMod.listCustomersAction(""),
          ]);

        const d = { ...DEFAULT };
        const today = new Date().toDateString();

        if (profileRes.status === "fulfilled" && profileRes.value.success && profileRes.value.data) {
          d.shopName = profileRes.value.data.businessName || "My Shop";
          setProfileError(null);
        } else if (profileRes.status === "fulfilled" && !profileRes.value.success) {
          setProfileError(profileRes.value.error ?? "Reseller profile not linked");
        }

        if (dashRes.status === "fulfilled" && dashRes.value.success && dashRes.value.data) {
          const stats = dashRes.value.data as {
            totalProducts?: number;
            activeProducts?: number;
            hiddenProducts?: number;
            favoriteProducts?: number;
          };
          d.productsTotal = stats.totalProducts ?? 0;
          d.productsActive = stats.activeProducts ?? 0;
        }

        if (ordersRes.status === "fulfilled" && ordersRes.value.success) {
          const od = ordersRes.value.data as { items?: any[] } | any;
          const items = od?.items ?? (Array.isArray(od) ? od : []);
          d.ordersToday = items.filter(
            (o: any) => new Date(o.createdAt).toDateString() === today,
          ).length;
          d.ordersPending = items.filter(
            (o: any) =>
              !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
          ).length;
          d.ordersCompleted = items.filter((o: any) =>
            ["completed", "delivered"].includes(o.status),
          ).length;
          d.pendingProfit = items.reduce(
            (s: number, o: any) => s + (o.profitPreview?.totalProfit ?? o.profit ?? 0),
            0,
          );

          setRecentOrders(
            items.slice(0, 8).map((o: any) => ({
              id: o.id ?? o._id,
              orderNumber: o.orderNumber ?? o.id?.slice(0, 8) ?? "—",
              customer: o.customer?.name ?? o.customerName ?? "—",
              total: o.pricing?.grandTotal ?? o.total ?? 0,
              profit: o.profitPreview?.totalProfit ?? o.profit ?? 0,
              status: o.status ?? "unknown",
              createdAt: o.createdAt,
            })),
          );
        }

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          d.availableBalance = w?.balance ?? w?.availableBalance ?? 0;
        }

        if (customersRes.status === "fulfilled" && customersRes.value.success) {
          const cd = customersRes.value.data;
          d.customersTotal = Array.isArray(cd) ? cd.length : (cd as any)?.totalCount ?? 0;
        }

        setData(d);
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
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
                <Store className="h-3 w-3" /> Reseller Portal
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{data.shopName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting()}, Partner
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Track customer orders, manage product markups, and request profit withdrawals.
            </p>
            {profileError && (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                {profileError}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/reseller/orders/create">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Today's Orders"
          value={data.ordersToday}
          icon={ShoppingCart}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Pending Orders"
          value={data.ordersPending}
          icon={Clock}
          accent="warning"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={data.ordersCompleted}
          icon={CheckCircle2}
          accent="success"
          loading={loading}
        />
        <StatCard
          label="Est. Profit"
          value={formatCents(data.pendingProfit)}
          icon={TrendingUp}
          accent="info"
          loading={loading}
        />
        <StatCard
          label="Available Balance"
          value={formatCents(data.availableBalance)}
          icon={Wallet}
          accent="success"
          loading={loading}
        />
      </div>

      {/* Catalog & Customer summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Catalog Products"
          value={data.productsTotal}
          icon={Package}
          loading={loading}
        />
        <StatCard
          label="Active Listings"
          value={data.productsActive}
          icon={Package}
          accent="success"
          loading={loading}
        />
        <StatCard
          label="Total Customers"
          value={data.customersTotal}
          icon={Users}
          accent="info"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsWidget title="Quick actions" actions={QUICK_ACTIONS} />

      {/* Recent Orders List */}
      <section>
        <SectionHeader
          title="Recent Orders"
          description="Latest customer transactions"
          action={
            <Link href="/reseller/orders" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No customer orders yet.{" "}
                <Link href="/reseller/orders/create" className="text-primary font-semibold hover:underline">
                  Create your first order
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/reseller/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 group"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {o.orderNumber} · {o.customer}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-bold text-foreground tabular-nums">{formatCents(o.total)}</p>
                        <p className="text-[11px] font-semibold text-success tabular-nums">
                          +{formatCents(o.profit)} profit
                        </p>
                      </div>
                      <StatusChip label={o.status} tone={statusToneFromValue(o.status)} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
