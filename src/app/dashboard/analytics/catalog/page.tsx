"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getCatalogAnalyticsAction } from "@/features/analytics/actions/analytics-actions";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { RankedTable } from "@/features/analytics/components/ranked-table";
import {
  TimeRangeFilter,
  type AnalyticsPreset,
} from "@/features/analytics/components/time-range-filter";
import type { RankedItem } from "@/features/analytics/domain/analytics-entity";

export default function CatalogAnalyticsPage() {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    productViews: number;
    searches: number;
    topProducts: RankedItem[];
    topKeywords: RankedItem[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getCatalogAnalyticsAction({ preset });
    if (res.success && res.data) setData(res.data as typeof data);
    setLoading(false);
  }, [preset]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Catalog Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Product views, search demand, and discovery.
          </p>
        </div>
        <TimeRangeFilter value={preset} onChange={setPreset} />
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard
              metric={{
                key: "views",
                label: "Product views",
                value: data.productViews,
                format: "number",
              }}
            />
            <MetricCard
              metric={{
                key: "searches",
                label: "Searches",
                value: data.searches,
                format: "number",
              }}
              index={1}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RankedTable title="Top viewed products" items={data.topProducts} />
            <RankedTable title="Top search keywords" items={data.topKeywords} />
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
