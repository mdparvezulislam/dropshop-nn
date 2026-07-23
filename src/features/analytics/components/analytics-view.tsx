"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { MetricCard } from "./metric-card";
import { AnalyticsChart } from "./analytics-chart";
import { RankedTable } from "./ranked-table";
import { TimeRangeFilter, type AnalyticsPreset } from "./time-range-filter";
import type { MetricCardData, TimeSeriesPoint, RankedItem } from "../domain/analytics-entity";

interface AnalyticsViewConfig {
  title: string;
  description: string;
  loadAction: (query: { preset: string }) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  exportAction?: (input: any) => Promise<{ success: boolean; data?: { content: string; filename: string; mimeType: string }; error?: string }>;
  sections: AnalyticsViewSection[];
}

interface AnalyticsViewSection {
  type: "metrics" | "chart" | "charts" | "ranked" | "ranked-grid" | "custom";
  columns?: number;
  chartType?: "area" | "bar" | "line";
  chartKey?: string;
  chartLabel?: string;
  title?: string;
  dataKey?: string;
  items?: { title: string; key?: string; type?: "area" | "bar" | "line"; label?: string; color?: string; columns?: number }[];
  render?: (data: any) => React.ReactNode;
}

export function AnalyticsView({ config }: { config: AnalyticsViewConfig }): React.ReactElement {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await config.loadAction({ preset });
    if (!res.success) {
      setError(res.error ?? "Failed to load data");
      setData(null);
    } else {
      setData(res.data);
    }
    setLoading(false);
  }, [preset, config.loadAction]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    if (!config.exportAction) return;
    setExporting(true);
    const res = await config.exportAction({ format: "csv", filters: { preset } });
    setExporting(false);
    if (!res.success || !res.data) return;
    const { content, filename, mimeType } = res.data;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TimeRangeFilter value={preset} onChange={setPreset} />
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
          {config.exportAction && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      {loading && !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {config.sections.map((section, i) => {
            if (section.type === "metrics" && data.metrics) {
              return (
                <div key={i} className={`grid grid-cols-2 gap-3 ${section.columns ? `lg:grid-cols-${section.columns}` : "lg:grid-cols-4"}`}>
                  {(data.metrics as MetricCardData[]).map((m: MetricCardData, mi: number) => (
                    <MetricCard key={m.key} metric={m} index={mi} />
                  ))}
                </div>
              );
            }

            if (section.type === "chart" && section.dataKey && data[section.dataKey]) {
              return (
                <div key={i} className="grid grid-cols-1 gap-4">
                  <AnalyticsChart
                    title={section.title ?? ""}
                    data={data[section.dataKey] as TimeSeriesPoint[]}
                    valueLabel={section.chartLabel ?? "Value"}
                    type={section.chartType ?? "area"}
                  />
                </div>
              );
            }

            if (section.type === "charts" && section.items) {
              return (
                <div key={i} className={`grid grid-cols-1 gap-4 ${section.columns === 1 ? "" : "lg:grid-cols-2"}`}>
                  {section.items.map((item, ci) => {
                    const chartData = item.key ? data[item.key] : null;
                    if (!chartData) return null;
                    return (
                      <AnalyticsChart
                        key={ci}
                        title={item.title}
                        data={chartData as TimeSeriesPoint[]}
                        valueLabel={item.label ?? "Value"}
                        type={item.type ?? "area"}
                        color={item.color}
                      />
                    );
                  })}
                </div>
              );
            }

            if (section.type === "ranked" && section.dataKey && data[section.dataKey]) {
              return (
                <div key={i} className="grid grid-cols-1 gap-4">
                  <RankedTable title={section.title ?? ""} items={data[section.dataKey] as RankedItem[]} />
                </div>
              );
            }

            if (section.type === "ranked-grid" && section.items) {
              return (
                <div key={i} className={`grid grid-cols-1 gap-4 ${section.columns === 1 ? "" : "md:grid-cols-2 xl:grid-cols-4"}`}>
                  {section.items.map((item, ri) => {
                    const rankedData = item.key ? data[item.key] : null;
                    if (!rankedData) return null;
                    return (
                      <RankedTable
                        key={ri}
                        title={item.title}
                        items={rankedData as RankedItem[]}
                        valuePrefix={item.label ?? ""}
                      />
                    );
                  })}
                </div>
              );
            }

            if (section.type === "custom" && section.render) {
              return <div key={i}>{section.render(data)}</div>;
            }

            return null;
          })}
        </>
      ) : null}
    </motion.div>
  );
}

export default AnalyticsView;
