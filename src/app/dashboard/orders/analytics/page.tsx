"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { getOrderDashboardStatsAction, listOrdersAction } from "@/features/order/actions/order-actions";
import { getReturnStatsAction } from "@/features/order/actions/return-actions";
import { getWarrantyStatsAction } from "@/features/order/actions/warranty-actions";
import { getExchangeStatsAction } from "@/features/order/actions/exchange-actions";
import { getCodStatsAction } from "@/features/order/actions/cod-actions";
import { getReturnHumanLabel } from "@/features/order/domain/return-entity";
import { getWarrantyHumanLabel } from "@/features/order/domain/warranty-entity";
import { getExchangeHumanLabel } from "@/features/order/domain/exchange-entity";
import { toast } from "sonner";
import {
  ArrowLeft, RefreshCw, ShoppingCart, PackageCheck, Truck,
  Undo2, ShieldCheck, Repeat, BarChart3, Clock, DollarSign,
  TrendingUp, TrendingDown, Award,
} from "lucide-react";

export default function AnalyticsPage(): React.ReactElement {
  const [orderStats, setOrderStats] = React.useState<Record<string, number>>({});
  const [returnStats, setReturnStats] = React.useState<Record<string, number>>({});
  const [warrantyStats, setWarrantyStats] = React.useState<Record<string, number>>({});
  const [exchangeStats, setExchangeStats] = React.useState<Record<string, number>>({});
  const [codStats, setCodStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [o, r, w, e, c] = await Promise.all([
        getOrderDashboardStatsAction(),
        getReturnStatsAction(),
        getWarrantyStatsAction(),
        getExchangeStatsAction(),
        getCodStatsAction(),
      ]);
      if (o.success && o.data) setOrderStats(o.data);
      if (r.success && r.data) setReturnStats(r.data);
      if (w.success && w.data) setWarrantyStats(w.data);
      if (e.success && e.data) setExchangeStats(e.data);
      if (c.success && c.data) {
        const s = c.data;
        setCodStats({
          pending: s.byStatus.pending ?? 0,
          partial: s.byStatus.partial ?? 0,
          settled: s.byStatus.settled ?? 0,
          disputed: s.byStatus.disputed ?? 0,
          mismatched: s.totalMismatched,
        });
      }
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const totalActive = (orderStats.pending ?? 0) + (orderStats.confirmed ?? 0) + (orderStats.packed ?? 0);
  const totalDelivered = (orderStats.delivered ?? 0) + (orderStats.completed ?? 0);
  const totalReturns = Object.values(returnStats).reduce((s, v) => s + v, 0);
  const totalCodPending = (codStats.pending ?? 0) + (codStats.mismatched ?? 0);

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="border-border/50 bg-card">
      <CardHeader><CardTitle className="text-sm font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">অর্ডার অ্যানালিটিক্স</h1>
            <p className="text-sm text-muted-foreground">Order Analytics & Fulfillment Performance</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Top Overview */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-blue-400"><ShoppingCart className="h-4 w-4" /><span className="text-xs text-muted-foreground">Today</span></div>
            <p className="text-xl font-bold">{orderStats.today ?? 0}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-amber-400"><PackageCheck className="h-4 w-4" /><span className="text-xs text-muted-foreground">Active</span></div>
            <p className="text-xl font-bold text-amber-400">{totalActive}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-emerald-400"><Truck className="h-4 w-4" /><span className="text-xs text-muted-foreground">Delivered</span></div>
            <p className="text-xl font-bold text-emerald-400">{totalDelivered}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-rose-400"><Undo2 className="h-4 w-4" /><span className="text-xs text-muted-foreground">Returns</span></div>
            <p className="text-xl font-bold text-rose-400">{totalReturns}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-amber-500"><Clock className="h-4 w-4" /><span className="text-xs text-muted-foreground">COD Pending</span></div>
            <p className="text-xl font-bold text-amber-500">{totalCodPending}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-violet-400"><Award className="h-4 w-4" /><span className="text-xs text-muted-foreground">Warranty</span></div>
            <p className="text-xl font-bold text-violet-400">{Object.values(warrantyStats).reduce((s, v) => s + v, 0)}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <SectionCard title="Order Status Breakdown">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2">
              {[
                { key: "pending", label: "Pending", color: "text-amber-400" },
                { key: "confirmed", label: "Confirmed", color: "text-blue-400" },
                { key: "packed", label: "Packed", color: "text-indigo-400" },
                { key: "courier_assigned", label: "Courier Assigned", color: "text-violet-400" },
                { key: "shipped", label: "Shipped", color: "text-sky-400" },
                { key: "delivered", label: "Delivered", color: "text-emerald-400" },
                { key: "completed", label: "Completed", color: "text-emerald-500" },
                { key: "cancelled", label: "Cancelled", color: "text-rose-400" },
                { key: "return_requested", label: "Return Requested", color: "text-rose-500" },
                { key: "failed", label: "Failed", color: "text-red-400" },
              ].map((s) => (
                <div key={s.key} className="flex justify-between items-center text-sm">
                  <span className={s.color}>{s.label}</span>
                  <span className="font-semibold">{orderStats[s.key] ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Return / Warranty / Exchange */}
        <SectionCard title="Returns, Warranty & Exchanges">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Returns</h4>
                <div className="space-y-1">
                  {Object.entries(returnStats).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span>{getReturnHumanLabel(status as any)}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Warranties</h4>
                <div className="space-y-1">
                  {Object.entries(warrantyStats).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span>{getWarrantyHumanLabel(status as any)}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Exchanges</h4>
                <div className="space-y-1">
                  {Object.entries(exchangeStats).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span>{getExchangeHumanLabel(status as any)}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* COD Status */}
        <SectionCard title="COD Settlement Status">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2">
              {[
                { key: "pending", label: "Pending Settlement", color: "text-amber-400" },
                { key: "partial", label: "Partial Received", color: "text-orange-400" },
                { key: "settled", label: "Settled", color: "text-emerald-400" },
                { key: "disputed", label: "Disputed", color: "text-rose-400" },
                { key: "mismatched", label: "Mismatched", color: "text-red-400" },
              ].map((s) => (
                <div key={s.key} className="flex justify-between items-center text-sm">
                  <span className={s.color}>{s.label}</span>
                  <span className="font-semibold">{codStats[s.key] ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Performance Summary */}
        <SectionCard title="Fulfillment Performance">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-xs text-muted-foreground">Delivery Rate</p>
              <p className="text-lg font-bold text-emerald-400">
                {orderStats.delivered != null && orderStats.completed != null && orderStats.pending != null
                  ? `${Math.round(((orderStats.delivered + orderStats.completed) / Math.max(1, orderStats.pending + orderStats.delivered + orderStats.completed)) * 100)}%`
                  : "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10">
              <TrendingDown className="h-5 w-5 text-rose-400 mb-1" />
              <p className="text-xs text-muted-foreground">Cancellation Rate</p>
              <p className="text-lg font-bold text-rose-400">
                {orderStats.cancelled != null && orderStats.pending != null
                  ? `${Math.round((orderStats.cancelled / Math.max(1, orderStats.cancelled + orderStats.pending)) * 100)}%`
                  : "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Undo2 className="h-5 w-5 text-amber-400 mb-1" />
              <p className="text-xs text-muted-foreground">Return Rate</p>
              <p className="text-lg font-bold text-amber-400">
                {totalDelivered > 0 ? `${Math.round((totalReturns / totalDelivered) * 100)}%` : "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-violet-500/10">
              <BarChart3 className="h-5 w-5 text-violet-400 mb-1" />
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold text-violet-400">
                {Object.entries(orderStats).filter(([k]) => !["today", "total_cod"].includes(k)).reduce((s, [, v]) => s + v, 0)}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
