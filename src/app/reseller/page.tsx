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
  DollarSign,
  Bell,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/workspace/section-header";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { QuickActionsWidget } from "@/components/workspace/widget-grid";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { ResellerOnboardingCard } from "@/features/reseller-workspace/components/reseller-onboarding-card";
import { ResellerSalesChartWidget } from "@/features/reseller-workspace/components/reseller-sales-chart-widget";

interface DashboardData {
  ordersToday: number;
  ordersPending: number;
  ordersDelivered: number;
  walletBalance: number;
  withdrawableBalance: number;
  profitToday: number;
  profitMonthly: number;
  customersTotal: number;
  shopName: string;
  resellerStatus: string;
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
  ordersDelivered: 0,
  walletBalance: 0,
  withdrawableBalance: 0,
  profitToday: 0,
  profitMonthly: 0,
  customersTotal: 0,
  shopName: "My Reseller Shop",
  resellerStatus: "active",
};

const QUICK_ACTIONS = [
  {
    label: "Create Order",
    href: "/reseller/orders/create",
    icon: Plus,
    description: "Place customer order",
  },
  {
    label: "Browse Products",
    href: "/reseller/products",
    icon: Package,
    description: "View catalog & prices",
  },
  {
    label: "View Orders",
    href: "/reseller/orders",
    icon: ShoppingCart,
    description: "Track shipment status",
  },
  {
    label: "Withdraw Profit",
    href: "/reseller/withdraw",
    icon: LogOut,
    description: "Payout to bKash/Bank",
  },
  {
    label: "Marketing Kit",
    href: "/reseller/marketing-kit",
    icon: ImageIcon,
    description: "Promotional assets",
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

export default function ResellerDashboardPage(): React.ReactElement {
  const [data, setData] = React.useState<DashboardData>(DEFAULT);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [profileMod, dashMod, resellerOrdersMod, walletMod, customersMod] = await Promise.all([
          import("@/features/reseller/actions/reseller-actions"),
          import("@/features/reseller/actions/reseller-actions"),
          import("@/features/reseller/actions/reseller-order-actions"),
          import("@/features/finance/actions/finance-actions"),
          import("@/features/customer/actions/customer-actions"),
        ]);

        const [profileRes, dashRes, ordersRes, walletRes, customersRes] = await Promise.allSettled([
          profileMod.resolveCurrentResellerAction(),
          dashMod.getResellerDashboardAction(),
          resellerOrdersMod.getResellerOrdersAction({ limit: 50 }),
          walletMod.getOrCreateUserWalletAction(),
          customersMod.listCustomersAction(""),
        ]);

        const d = { ...DEFAULT };
        const todayStr = new Date().toDateString();
        const currentMonth = new Date().getMonth();

        if (
          profileRes.status === "fulfilled" &&
          profileRes.value.success &&
          profileRes.value.data
        ) {
          d.shopName = profileRes.value.data.businessName || "My Reseller Shop";
          d.resellerStatus = profileRes.value.data.status || "active";
          setProfileError(null);
        } else if (profileRes.status === "fulfilled" && !profileRes.value.success) {
          setProfileError(profileRes.value.error ?? "Reseller profile not active");
        }

        if (ordersRes.status === "fulfilled" && ordersRes.value.success) {
          const od = ordersRes.value.data as any;
          const items = od?.orders ?? od?.items ?? (Array.isArray(od) ? od : []);

          d.ordersToday = items.filter(
            (o: any) => o.createdAt && new Date(o.createdAt).toDateString() === todayStr,
          ).length;
          d.ordersPending = items.filter(
            (o: any) =>
              !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
          ).length;
          d.ordersDelivered = items.filter((o: any) =>
            ["completed", "delivered"].includes(o.status),
          ).length;

          d.profitToday = items
            .filter((o: any) => o.createdAt && new Date(o.createdAt).toDateString() === todayStr)
            .reduce((s: number, o: any) => s + (o.profitCents ?? o.profitPreview?.totalProfit ?? o.profit ?? 0), 0);

          d.profitMonthly = items
            .filter((o: any) => o.createdAt && new Date(o.createdAt).getMonth() === currentMonth)
            .reduce((s: number, o: any) => s + (o.profitCents ?? o.profitPreview?.totalProfit ?? o.profit ?? 0), 0);

          setRecentOrders(
            items.slice(0, 6).map((o: any) => ({
              id: o.id ?? o._id,
              orderNumber: o.orderNumber ?? o.id?.slice(0, 8) ?? "—",
              customer: o.customerName ?? o.customer?.name ?? "Customer",
              total: o.sellingPriceCents ?? o.pricing?.grandTotal ?? o.total ?? 0,
              profit: o.profitCents ?? o.profitPreview?.totalProfit ?? o.profit ?? 0,
              status: o.status ?? "pending",
              createdAt: o.createdAt,
            })),
          );
        }

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          d.walletBalance = w?.balance ?? w?.totalBalance ?? 0;
          d.withdrawableBalance = w?.availableBalance ?? w?.balance ?? 0;
        }

        if (customersRes.status === "fulfilled" && customersRes.value.success) {
          const cd = customersRes.value.data;
          d.customersTotal = Array.isArray(cd) ? cd.length : ((cd as any)?.totalCount ?? 0);
        }

        setData(d);
      } catch {
        // keep fallback defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ResellerStatusGuard status={data.resellerStatus}>
      <div className="space-y-5 animate-fade-in">
        {/* Sales Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-linear-to-r from-slate-900 via-slate-900 to-amber-950 p-5 sm:p-6 shadow-md text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 70% 70% at 100% 0%, hsl(38 92% 50% / 0.3), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  <Store className="h-3 w-3" /> Reseller Workspace
                </span>
                <span className="text-xs font-bold text-slate-300">{data.shopName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {greeting()}, Partner 👋
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                আজকের সেলস পারফরম্যান্স, লাভ ও অর্ডার ট্র্যাকিং ওয়ার্কস্পেস।
              </p>
              {profileError && (
                <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200">
                  {profileError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link href="/reseller/orders/create">
                <Button size="lg" className="gap-2 font-black shadow-md bg-amber-500 hover:bg-amber-600 text-slate-950 border-0">
                  <Plus className="h-4 w-4 stroke-[3]" />
                  কুইক অর্ডার তৈরি করুন
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Primary Reseller KPI Stats Grid (6 Focused Cards) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
            label="Delivered Orders"
            value={data.ordersDelivered}
            icon={CheckCircle2}
            accent="success"
            loading={loading}
          />
          <StatCard
            label="Today's Profit"
            value={formatCents(data.profitToday)}
            icon={TrendingUp}
            accent="success"
            loading={loading}
          />
          <StatCard
            label="Wallet Balance"
            value={formatCents(data.walletBalance)}
            icon={Wallet}
            accent="primary"
            loading={loading}
          />
          <StatCard
            label="Withdrawable"
            value={formatCents(data.withdrawableBalance)}
            icon={DollarSign}
            accent="success"
            loading={loading}
          />
        </div>

        {/* Quick Actions Bar */}
        <QuickActionsWidget title="Sales Quick Actions" actions={QUICK_ACTIONS} />

        {/* Chart & Recent Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResellerSalesChartWidget />
          </div>
          <div>
            <Card className="border-border/80 shadow-xs h-full flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" /> Notifications
                  </h3>
                  <Link
                    href="/reseller/notifications"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
                    <p className="font-bold text-foreground">Application Approved 🎉</p>
                    <p className="text-muted-foreground leading-snug">
                      Your reseller workspace is active. Start creating customer orders now.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
                    <p className="font-bold text-foreground">Withdrawal Ready</p>
                    <p className="text-muted-foreground leading-snug">
                      Minimum payout threshold is ৳500. Request payouts anytime.
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-border/60 bg-muted/20 text-center">
                <Link
                  href="/reseller/support"
                  className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-amber-500" /> Need help? Contact Reseller Support
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Orders Table / List */}
        <section className="space-y-3">
          <SectionHeader
            title="Recent Orders"
            description="Latest customer transactions"
            action={
              <Link
                href="/reseller/orders"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                All orders <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground space-y-3">
                  <p>No customer orders placed yet.</p>
                  <Link href="/reseller/orders/create">
                    <Button size="sm" className="gap-2 font-bold shadow-xs">
                      <Plus className="w-4 h-4" /> Place Your First Order
                    </Button>
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
                        <p className="truncate text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {o.orderNumber} · {o.customer}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                            {formatCents(o.total)}
                          </p>
                          <p className="text-[11px] font-bold text-success tabular-nums">
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
    </ResellerStatusGuard>
  );
}
