"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  exportAnalyticsAction,
  getAnalyticsOverviewAction,
} from "../actions/analytics-actions";
import type { AnalyticsOverview } from "../domain/analytics-entity";
import { MetricCard } from "./metric-card";
import { AnalyticsChart } from "./analytics-chart";
import { RankedTable } from "./ranked-table";
import { TimeRangeFilter, type AnalyticsPreset } from "./time-range-filter";

export function AnalyticsDashboard(): React.ReactElement {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getAnalyticsOverviewAction({ preset });
    if (!res.success) {
      setError(res.error ?? "Failed to load analytics");
      setData(null);
    } else {
      setData(res.data as AnalyticsOverview);
    }
    setLoading(false);
  }, [preset]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async (): Promise<void> => {
    setExporting(true);
    const res = await exportAnalyticsAction({ preset, format: "csv", metric: "events" });
    setExporting(false);
    if (!res.success || !res.data) return;
    const blob = new Blob([res.data.content], { type: res.data.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.data.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Platform event intelligence — commerce, catalog, and content in one pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TimeRangeFilter value={preset} onChange={setPreset} />
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            CSV
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
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading analytics" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
            {data.metrics.map((m, i) => (
              <MetricCard key={m.key} metric={m} index={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AnalyticsChart
              title="Revenue"
              data={data.revenueSeries}
              valueLabel="Revenue"
              type="area"
            />
            <AnalyticsChart
              title="Orders"
              data={data.ordersSeries}
              valueLabel="Orders"
              type="bar"
              color="hsl(var(--chart-2, 200 80% 50%))"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RankedTable title="Top products (views)" items={data.topProducts} />
            <RankedTable title="Top categories" items={data.topCategories} />
            <RankedTable title="Search keywords" items={data.topSearchKeywords} />
            <RankedTable title="Popular articles" items={data.topArticles} />
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
