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
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { QuickActionsWidget } from "@/shared/components/workspace/widget-grid";
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
  { label: "New Order", href: "/reseller/orders/create", icon: Plus },
  { label: "My Products", href: "/reseller/products", icon: Package },
  { label: "Customers", href: "/reseller/customers", icon: Users },
  { label: "Wallet", href: "/reseller/wallet", icon: Wallet },
  { label: "Marketing Kit", href: "/reseller/marketing-kit", icon: ImageIcon },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatCents(cents: number): string {
  return `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
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

  const STATS = [
    {
      label: "Today's Orders",
      value: data.ordersToday,
      icon: ShoppingCart,
      accent: "default" as const,
    },
    {
      label: "Pending Orders",
      value: data.ordersPending,
      icon: Clock,
      accent: "warning" as const,
    },
    {
      label: "Completed",
      value: data.ordersCompleted,
      icon: CheckCircle2,
      accent: "success" as const,
    },
    {
      label: "Est. Profit",
      value: formatCents(data.pendingProfit),
      icon: TrendingUp,
      accent: "info" as const,
    },
    {
      label: "Wallet",
      value: formatCents(data.availableBalance),
      icon: Wallet,
      accent: "success" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.25s_ease-out]">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
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
              {data.shopName} · Reseller Workspace
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {greeting()}
            </h1>
            <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
              Sales, profit, catalog, and wallet — powered by platform engines.
            </p>
            {profileError && (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                {profileError}
              </p>
            )}
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={loading ? "—" : s.value}
            icon={s.icon}
            accent={s.accent}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Catalog products"
          value={loading ? "—" : data.productsTotal}
          icon={Package}
        />
        <StatCard
          label="Active listings"
          value={loading ? "—" : data.productsActive}
          icon={Package}
          accent="success"
        />
        <StatCard
          label="Customers"
          value={loading ? "—" : data.customersTotal}
          icon={Users}
          accent="info"
        />
      </div>

      <QuickActionsWidget title="Quick actions" actions={QUICK_ACTIONS} />

      <section>
        <SectionHeader
          title="Recent Orders"
          description="Latest transactions from the Order Engine"
          action={
            <Link href="/reseller/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          }
        />
        <Card>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No orders yet.{" "}
                <Link href="/reseller/orders/create" className="text-primary hover:underline">
                  Create your first order
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/reseller/orders/${o.id}`}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {o.orderNumber} · {o.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">{formatCents(o.total)}</p>
                        <p className="text-[11px] text-emerald-500 tabular-nums">
                          +{formatCents(o.profit)}
                        </p>
                      </div>
                      <StatusChip label={o.status} tone={statusToneFromValue(o.status)} />
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
