"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  Store,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

interface DashboardData {
  ordersToday: number;
  ordersPending: number;
  ordersCompleted: number;
  pendingProfit: number;
  availableBalance: number;
  productsTotal: number;
  productsActive: number;
  customersTotal: number;
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
};

const QUICK_ACTIONS = [
  { label: "New Order", href: "/reseller/orders/create", icon: Plus },
  { label: "My Products", href: "/reseller/products", icon: Package },
  { label: "Customers", href: "/reseller/customers", icon: Users },
  { label: "Wallet", href: "/reseller/wallet", icon: Wallet },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function ResellerDashboardPage(): React.ReactElement {
  const [data, setData] = React.useState<DashboardData>(DEFAULT);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [ordersRes, walletRes] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) =>
            m.listOrdersAction({ page: 1, limit: 50 }),
          ),
          import("@/features/finance/actions/finance-actions").then((m) =>
            m.getOrCreateUserWalletAction(),
          ),
        ]);

        const d = { ...DEFAULT };
        const today = new Date().toDateString();

        if (ordersRes.status === "fulfilled" && ordersRes.value.success) {
          const od = ordersRes.value.data as any;
          const items = od?.items ?? [];
          d.ordersToday = items.filter(
            (o: any) => new Date(o.createdAt).toDateString() === today,
          ).length;
          d.ordersPending = items.filter(
            (o: any) => !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
          ).length;
          d.ordersCompleted = items.filter((o: any) => o.status === "completed").length;
          d.pendingProfit = items.reduce(
            (s: number, o: any) => s + (o.profitPreview?.totalProfit ?? 0),
            0,
          );
        }

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          d.availableBalance = w?.balance ?? 0;
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

  const STATS = [
    { label: "Today's Orders", value: data.ordersToday, icon: ShoppingCart, accent: "default" as const },
    { label: "Pending Orders", value: data.ordersPending, icon: Clock, accent: "warning" as const },
    { label: "Completed", value: data.ordersCompleted, icon: CheckCircle2, accent: "success" as const },
    { label: "Pending Profit", value: formatCents(data.pendingProfit), icon: TrendingUp, accent: "info" as const },
    { label: "Balance", value: formatCents(data.availableBalance), icon: Wallet, accent: "success" as const },
  ];

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
              Reseller Dashboard
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {greeting()}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Your store at a glance — orders, profit, and products.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/reseller/orders/create">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {STATS.map((s) => (
          <StatCard key={s.label} label={s.label} value={loading ? "—" : s.value} icon={s.icon} accent={s.accent} />
        ))}
      </div>

      {/* Quick actions */}
      <section>
        <SectionHeader title="Quick actions" description="Common reseller workflows" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
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

      {/* Recent Orders */}
      <section>
        <SectionHeader
          title="Recent Orders"
          description="Your latest transactions"
          action={<Link href="/reseller/orders" className="text-xs text-primary hover:underline">View all</Link>}
        />
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[].length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No orders yet. Create your first order to get started.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
