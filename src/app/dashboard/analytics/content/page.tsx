"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getContentAnalyticsAction } from "@/features/analytics/actions/analytics-actions";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { RankedTable } from "@/features/analytics/components/ranked-table";
import {
  TimeRangeFilter,
  type AnalyticsPreset,
} from "@/features/analytics/components/time-range-filter";
import type { RankedItem } from "@/features/analytics/domain/analytics-entity";

export default function ContentAnalyticsPage() {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    blogViews: number;
    blogShares: number;
    cmsPublishes: number;
    topArticles: RankedItem[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getContentAnalyticsAction({ preset });
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
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Content Analytics</h1>
          <p className="text-sm text-muted-foreground">Blog engagement and CMS publish activity.</p>
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
                key: "blogViews",
                label: "Blog views",
                value: data.blogViews,
                format: "number",
              }}
            />
            <MetricCard
              metric={{
                key: "shares",
                label: "Blog shares",
                value: data.blogShares,
                format: "number",
              }}
              index={1}
            />
            <MetricCard
              metric={{
                key: "publishes",
                label: "CMS publishes",
                value: data.cmsPublishes,
                format: "number",
              }}
              index={2}
            />
          </div>
          <RankedTable title="Popular articles" items={data.topArticles} />
        </>
      ) : null}
    </motion.div>
  );
}
