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
  Users,
  Warehouse,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/workspace/section-header";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { QuickActionsWidget } from "@/components/workspace/widget-grid";
import { cn } from "@/lib/utils/cn";

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  productsAvailable: number;
  quotationsPending: number;
  invoicesDue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
}

interface RecentQuotation {
  id: string;
  quoteNumber: string;
  itemCount: number;
  grandTotal: number;
  status: string;
  createdAt: string;
}

const DEFAULT: DashboardData = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalSpent: 0,
  outstandingBalance: 0,
  productsAvailable: 0,
  quotationsPending: 0,
  invoicesDue: 0,
};

const QUICK_ACTIONS = [
  {
    label: "Browse Products",
    href: "/wholesale/products",
    icon: Package,
    description: "Wholesale catalog & MOQs",
  },
  {
    label: "Bulk Order",
    href: "/wholesale/bulk-orders/create",
    icon: ClipboardList,
    description: "Quick bulk order creation",
  },
  {
    label: "Request Quote",
    href: "/wholesale/quotations",
    icon: FileText,
    description: "Custom pricing quotes",
  },
  {
    label: "View Invoices",
    href: "/wholesale/invoices",
    icon: Receipt,
    description: "Invoice statements",
  },
  { label: "Customers", href: "/wholesale/customers", icon: Users, description: "B2B client list" },
  {
    label: "Order History",
    href: "/wholesale/orders",
    icon: Clock,
    description: "Past order archive",
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

export default function WholesaleDashboardPage(): React.ReactElement {
  const [data, setData] = React.useState<DashboardData>(DEFAULT);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [recentQuotations, setRecentQuotations] = React.useState<RecentQuotation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [orderRes, quoteRes, invoiceRes, productRes] = await Promise.allSettled([
          import("@/features/order/actions/order-actions").then((m) =>
            m.listOrdersAction({ page: 1, limit: 50, type: "wholesaler" }),
          ),
          import("@/features/quotation/actions/quotation-actions").then((m) =>
            m.listQuotationsAction(),
          ),
          import("@/features/finance/actions/finance-actions").then((m) => m.listInvoicesAction()),
          import("@/features/catalog/actions/product-actions").then((m) =>
            m.listProductsAction({}, { limit: 1 }),
          ),
        ]);

        const d = { ...DEFAULT };

        if (orderRes.status === "fulfilled" && orderRes.value.success) {
          const od = orderRes.value.data as any;
          const items = Array.isArray(od) ? od : (od?.items ?? []);
          d.totalOrders = items.length;
          d.pendingOrders = items.filter(
            (o: any) =>
              !["completed", "cancelled", "delivered", "failed", "refunded"].includes(o.status),
          ).length;
          d.completedOrders = items.filter((o: any) => o.status === "completed").length;
          d.totalSpent = items.reduce((s: number, o: any) => s + (o.grandTotal ?? o.total ?? 0), 0);

          setRecentOrders(
            items.slice(0, 5).map((o: any) => ({
              id: o.id ?? o._id,
              orderNumber: o.orderNumber ?? o._id?.slice(-6) ?? "—",
              itemCount: o.items?.length ?? 0,
              total: o.grandTotal ?? o.total ?? 0,
              status: o.status ?? "pending",
              createdAt: o.createdAt,
            })),
          );
        }

        if (quoteRes.status === "fulfilled" && quoteRes.value.success) {
          const qd = quoteRes.value.data as any;
          const items = Array.isArray(qd) ? qd : [];
          d.quotationsPending = items.filter(
            (q: any) => q.status === "draft" || q.status === "submitted",
          ).length;
          setRecentQuotations(
            items.slice(0, 3).map((q: any) => ({
              id: q.id,
              quoteNumber: q.quoteNumber,
              itemCount: q.items?.length ?? 0,
              grandTotal: q.grandTotal ?? 0,
              status: q.status ?? "draft",
              createdAt: q.createdAt,
            })),
          );
        }

        if (invoiceRes.status === "fulfilled" && invoiceRes.value.success) {
          const inv = invoiceRes.value.data as any;
          const items = Array.isArray(inv) ? inv : [];
          d.invoicesDue = items.filter(
            (i: any) => i.status === "pending" || i.status === "due",
          ).length;
          d.outstandingBalance = items
            .filter((i: any) => i.status === "pending" || i.status === "due")
            .reduce((s: number, i: any) => s + (i.amount ?? i.grandTotal ?? 0), 0);
        }

        if (productRes.status === "fulfilled" && productRes.value.success) {
          const pd = productRes.value.data as any;
          d.productsAvailable = pd?.total ?? pd?.totalCount ?? (Array.isArray(pd) ? pd.length : 0);
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
                <Warehouse className="h-3 w-3" /> Wholesale Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting()}, Wholesaler
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Enterprise purchasing at volume rates — bulk orders, custom quotations, and credit
              invoices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/wholesale/bulk-orders/create">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                New Bulk Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Pending Orders"
          value={data.pendingOrders}
          icon={Clock}
          accent="warning"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={data.completedOrders}
          icon={CheckCircle2}
          accent="success"
          loading={loading}
        />
        <StatCard
          label="Total Spent"
          value={formatCents(data.totalSpent)}
          icon={DollarSign}
          accent="info"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Outstanding Balance"
          value={formatCents(data.outstandingBalance)}
          icon={AlertTriangle}
          accent={data.outstandingBalance > 0 ? "danger" : "success"}
          loading={loading}
        />
        <StatCard
          label="Products Available"
          value={data.productsAvailable}
          icon={Warehouse}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Pending Quotations"
          value={data.quotationsPending}
          icon={FileText}
          accent="warning"
          loading={loading}
        />
        <StatCard
          label="Invoices Due"
          value={data.invoicesDue}
          icon={Receipt}
          accent={data.invoicesDue > 0 ? "danger" : "success"}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsWidget title="Quick actions" actions={QUICK_ACTIONS} />

      {/* Recent Orders & Pending Quotes */}
      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Orders */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Recent Bulk Orders</span>
                <Link
                  href="/wholesale/orders"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No orders yet.{" "}
                  <Link
                    href="/wholesale/bulk-orders/create"
                    className="text-primary font-semibold hover:underline"
                  >
                    Place your first bulk order
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/wholesale/bulk-orders/${o.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 group"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {o.orderNumber}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {o.itemCount} items ·{" "}
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

          {/* Quotations */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Pending Quotations</span>
                <Link
                  href="/wholesale/quotations"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentQuotations.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No pending quotations.{" "}
                  <Link
                    href="/wholesale/quotations"
                    className="text-primary font-semibold hover:underline"
                  >
                    Request a quote
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentQuotations.map((q) => (
                    <div key={q.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-semibold text-foreground">
                          {q.quoteNumber}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {q.itemCount} items ·{" "}
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                          {formatCents(q.grandTotal)}
                        </span>
                        <StatusChip
                          label={q.status}
                          tone={statusToneFromValue(q.status)}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
