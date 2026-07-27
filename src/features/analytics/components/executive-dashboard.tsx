"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExecutiveDashboardAction, exportAnalyticsAction } from "../actions/analytics-actions";
import dynamic from "next/dynamic";
import { MetricCard } from "./metric-card";
import { TimeRangeFilter, type AnalyticsPreset } from "./time-range-filter";

const AnalyticsChart = dynamic(
  () => import("./analytics-chart").then((m) => m.AnalyticsChart),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />,
  }
);
import type { ExecutiveDashboardData } from "../domain/analytics-entity";
import { formatCurrency } from "@/lib/utils/currency-utils";

export function ExecutiveDashboard(): React.ReactElement {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getExecutiveDashboardAction({ preset });
    if (!res.success) {
      setError(res.error ?? "Failed to load executive dashboard");
      setData(null);
    } else {
      setData(res.data as ExecutiveDashboardData);
    }
    setLoading(false);
  }, [preset]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    setExporting(true);
    const res = await exportAnalyticsAction({
      format: "csv",
      filters: { preset },
      type: "executive",
    });
    setExporting(false);
    if (!res.success || !res.data) return;
    const { content, filename, mimeType } = res.data;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Enterprise-wide performance at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TimeRangeFilter value={preset} onChange={setPreset} />
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="gap-1.5"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading && !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Today's Metrics */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricCard
              metric={{
                key: "today_revenue",
                label: "Today's Revenue",
                value: data.todayRevenue,
                format: "currency",
                currency: "BDT",
              }}
              index={0}
            />
            <MetricCard
              metric={{
                key: "today_orders",
                label: "Today's Orders",
                value: data.todayOrders,
                format: "number",
              }}
              index={1}
            />
            <MetricCard
              metric={{
                key: "today_shipments",
                label: "Today's Shipments",
                value: data.todayShipments,
                format: "number",
              }}
              index={2}
            />
            <MetricCard
              metric={{
                key: "today_deliveries",
                label: "Today's Deliveries",
                value: data.todayDeliveries,
                format: "number",
              }}
              index={3}
            />
            <MetricCard
              metric={{
                key: "today_returns",
                label: "Today's Returns",
                value: data.todayReturns,
                format: "number",
              }}
              index={4}
            />
          </div>

          {/* Period Metrics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              metric={{
                key: "gross_sales",
                label: "Gross Sales",
                value: data.grossSales,
                format: "currency",
                currency: "BDT",
              }}
            />
            <MetricCard
              metric={{
                key: "net_sales",
                label: "Net Sales",
                value: data.netSales,
                format: "currency",
                currency: "BDT",
              }}
            />
            <MetricCard
              metric={{
                key: "profit",
                label: "Profit",
                value: data.profit,
                format: "currency",
                currency: "BDT",
              }}
            />
            <MetricCard
              metric={{
                key: "expenses",
                label: "Expenses",
                value: data.expenses,
                format: "currency",
                currency: "BDT",
              }}
            />
            <MetricCard
              metric={{
                key: "outstanding_cod",
                label: "Outstanding COD",
                value: data.outstandingCOD,
                format: "currency",
                currency: "BDT",
              }}
            />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {data.metrics.map((m, i) => (
              <MetricCard key={m.key} metric={m} index={i + 5} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AnalyticsChart
              title="Revenue Trend"
              data={data.revenueSeries}
              valueLabel="Revenue"
              type="area"
            />
            <AnalyticsChart
              title="Orders Trend"
              data={data.ordersSeries}
              valueLabel="Orders"
              type="bar"
              color="hsl(var(--chart-2, 200 80% 50%))"
            />
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

export default ExecutiveDashboard;
