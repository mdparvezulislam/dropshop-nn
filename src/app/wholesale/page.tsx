"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  FileText,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/workspace/section-header";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { cn } from "@/shared/utils/cn";

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  quotationsPending: number;
  invoicesDue: number;
  productsAvailable: number;
}

const DEFAULT: DashboardData = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalSpent: 0,
  quotationsPending: 0,
  invoicesDue: 0,
  productsAvailable: 0,
};

const QUICK_ACTIONS = [
  { label: "Browse Products", href: "/wholesale/products", icon: Package },
  { label: "Bulk Order", href: "/wholesale/bulk-orders", icon: ClipboardList },
  { label: "Request Quote", href: "/wholesale/quotations", icon: FileText },
  { label: "View Invoices", href: "/wholesale/invoices", icon: Receipt },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function WholesaleDashboardPage(): React.ReactElement {
  const [data, setData] = React.useState<DashboardData>(DEFAULT);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [orderRes] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) =>
            m.listOrdersAction({ page: 1, limit: 50, type: "wholesaler" }),
          ),
        ]);

        const d = { ...DEFAULT };

        if (orderRes.status === "fulfilled" && orderRes.value.success) {
          const od = orderRes.value.data as any;
          const items = Array.isArray(od) ? od : od?.items ?? [];
          d.totalOrders = items.length;
          d.pendingOrders = items.filter(
            (o: any) => !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
          ).length;
          d.completedOrders = items.filter((o: any) => o.status === "completed").length;
          d.totalSpent = items.reduce((s: number, o: any) => s + (o.grandTotal ?? o.total ?? 0), 0);
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
              Wholesale Portal
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {greeting()}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Enterprise purchasing at wholesale prices — orders, quotes, and account overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/wholesale/bulk-orders">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New Bulk Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={loading ? "—" : data.totalOrders} icon={ShoppingCart} />
        <StatCard label="Pending" value={loading ? "—" : data.pendingOrders} icon={Clock} accent="warning" />
        <StatCard label="Completed" value={loading ? "—" : data.completedOrders} icon={CheckCircle2} accent="success" />
        <StatCard label="Total Spent" value={loading ? "—" : formatCents(data.totalSpent)} icon={DollarSign} accent="info" />
      </div>

      <section>
        <SectionHeader title="Quick actions" description="Common wholesale workflows" />
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

      <section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No orders yet. Place your first bulk order to get started.
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Pending Quotations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No pending quotations. Request a quote from products you&apos;re interested in.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
