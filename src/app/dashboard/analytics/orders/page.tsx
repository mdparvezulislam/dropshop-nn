"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getOrdersFunnelAction } from "@/features/analytics/actions/analytics-actions";
import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";
import {
  TimeRangeFilter,
  type AnalyticsPreset,
} from "@/features/analytics/components/time-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function OrdersAnalyticsPage() {
  const [preset, setPreset] = useState<AnalyticsPreset>("30d");
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<{ key: string; label: string; value: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getOrdersFunnelAction({ preset });
    if (res.success && res.data) {
      const d = res.data as { steps: typeof steps };
      setSteps(d.steps ?? []);
    }
    setLoading(false);
  }, [preset]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = steps.map((s) => ({ date: s.label, value: s.value }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Orders Funnel</h1>
          <p className="text-sm text-muted-foreground">
            View → cart → checkout → order conversion funnel.
          </p>
        </div>
        <TimeRangeFilter value={preset} onChange={setPreset} />
      </div>

      {loading && steps.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {steps.map((s) => (
              <Card key={s.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <AnalyticsChart title="Funnel volume" data={chartData} type="bar" valueLabel="Events" />
        </>
      )}
    </motion.div>
  );
}
