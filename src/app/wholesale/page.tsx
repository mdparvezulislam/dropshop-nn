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
  { label: "Browse Products", href: "/wholesale/products", icon: Package },
  { label: "Bulk Order", href: "/wholesale/bulk-orders/create", icon: ClipboardList },
  { label: "Request Quote", href: "/wholesale/quotations", icon: FileText },
  { label: "View Invoices", href: "/wholesale/invoices", icon: Receipt },
  { label: "Customers", href: "/wholesale/customers", icon: Users },
  { label: "Order History", href: "/wholesale/orders", icon: Clock },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
          import("@/features/finance/actions/finance-actions").then((m) =>
            m.listInvoicesAction(),
          ),
          import("@/features/catalog/actions/product-actions").then((m) =>
            m.listProductsAction({}, { limit: 1 }),
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
              Enterprise purchasing at wholesale prices — bulk orders, quotations, and invoices.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/wholesale/bulk-orders/create">
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
        <StatCard label="Pending Orders" value={loading ? "—" : data.pendingOrders} icon={Clock} accent="warning" />
        <StatCard label="Completed" value={loading ? "—" : data.completedOrders} icon={CheckCircle2} accent="success" />
        <StatCard label="Total Spent" value={loading ? "—" : formatCents(data.totalSpent)} icon={DollarSign} accent="info" />
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Outstanding Balance" value={loading ? "—" : formatCents(data.outstandingBalance)} icon={AlertTriangle} accent={data.outstandingBalance > 0 ? "danger" : "success"} />
        <StatCard label="Products Available" value={loading ? "—" : data.productsAvailable} icon={Warehouse} />
        <StatCard label="Pending Quotations" value={loading ? "—" : data.quotationsPending} icon={FileText} accent="warning" />
        <StatCard label="Invoices Due" value={loading ? "—" : data.invoicesDue} icon={Receipt} accent={data.invoicesDue > 0 ? "danger" : "success"} />
      </div>

      <QuickActionsWidget title="Quick actions" actions={QUICK_ACTIONS} />

      <section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Recent Orders
                <Link href="/wholesale/orders" className="text-xs text-primary hover:underline font-normal">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No orders yet.{" "}
                  <Link href="/wholesale/bulk-orders/create" className="text-primary hover:underline">
                    Place your first bulk order
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/wholesale/bulk-orders/${o.id}`}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{o.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.itemCount} items · {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
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
                Pending Quotations
                <Link href="/wholesale/quotations" className="text-xs text-primary hover:underline font-normal">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentQuotations.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No pending quotations.{" "}
                  <Link href="/wholesale/quotations" className="text-primary hover:underline">
                    Request a quote
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentQuotations.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{q.quoteNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.itemCount} items · {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">{formatCents(q.grandTotal)}</span>
                        <StatusChip label={q.status} tone={statusToneFromValue(q.status)} />
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
