"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getSalesAnalyticsAction } from "@/features/analytics/actions/analytics-actions";
import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";
import { MetricCard } from "@/features/analytics/components/metric-card";
import {
  TimeRangeFilter,
  type AnalyticsPreset,
} from "@/features/analytics/components/time-range-filter";
import type { TimeSeriesPoint } from "@/features/analytics/domain/analytics-entity";

export default function SalesAnalyticsPage() {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    revenue: number;
    orders: number;
    aov: number;
    series: TimeSeriesPoint[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getSalesAnalyticsAction({ preset });
    if (res.success && res.data) {
      setData(res.data as typeof data);
    }
    setLoading(false);
  }, [preset]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Sales Analytics</h1>
          <p className="text-sm text-muted-foreground">Revenue and order performance over time.</p>
        </div>
        <TimeRangeFilter value={preset} onChange={setPreset} />
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              metric={{
                key: "revenue",
                label: "Revenue",
                value: data.revenue,
                format: "currency",
                currency: "BDT",
              }}
            />
            <MetricCard
              metric={{ key: "orders", label: "Orders", value: data.orders, format: "number" }}
              index={1}
            />
            <MetricCard
              metric={{
                key: "aov",
                label: "Avg Order Value",
                value: data.aov,
                format: "currency",
                currency: "BDT",
              }}
              index={2}
            />
          </div>
          <AnalyticsChart title="Revenue trend" data={data.series} valueLabel="Revenue" />
        </>
      ) : null}
    </motion.div>
  );
}
