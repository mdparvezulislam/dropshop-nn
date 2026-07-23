"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";
import { getReportAction } from "@/features/analytics/actions/analytics-actions";
import type { AnalyticsReport } from "@/features/analytics/domain/analytics-entity";

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    const res = await getReportAction(params.id as string);
    if (res.success && res.data) {
      setReport(res.data as AnalyticsReport);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{report.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="info" size="xs">{report.type}</Badge>
            <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
            {report.generatedBy && <span>by {report.generatedBy}</span>}
          </div>
        </div>
      </div>

      {report.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {report.metrics.map((m, i) => (
            <MetricCard key={m.key} metric={m} index={i} />
          ))}
        </div>
      )}

      {report.charts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {report.charts.map((chart) => (
            <AnalyticsChart key={chart.id} title={chart.title} data={chart.data} type={chart.type} valueLabel={chart.title} />
          ))}
        </div>
      )}
    </div>
  );
}
