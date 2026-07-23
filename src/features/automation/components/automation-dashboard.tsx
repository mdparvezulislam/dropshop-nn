"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertCircle, CheckCircle2, Clock, Loader2, Play, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutomationMetricCard } from "./automation-metric-card";
import type { AutomationDashboardData } from "../domain/automation-entity";
import { getAutomationDashboardAction } from "../actions/automation-actions";

const statusColors: Record<string, string> = {
  running: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-rose-500/10 text-rose-600",
  pending: "bg-amber-500/10 text-amber-600",
  cancelled: "bg-gray-500/10 text-gray-600",
  retrying: "bg-violet-500/10 text-violet-600",
  paused: "bg-orange-500/10 text-orange-600",
};

export function AutomationDashboard(): React.ReactElement {
  const [data, setData] = useState<AutomationDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAutomationDashboardAction();
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Failed to load dashboard.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Automation Center</h1>
          <p className="text-sm text-muted-foreground">
            Workflow automation, rules engine & event orchestration
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AutomationMetricCard label="Running Workflows" value={data.runningWorkflows} icon={<Play className="h-3.5 w-3.5" />} index={0} />
        <AutomationMetricCard label="Scheduled Jobs" value={data.scheduledJobs} icon={<Clock className="h-3.5 w-3.5" />} index={1} />
        <AutomationMetricCard label="Today's Executions" value={data.todayExecutions} icon={<Activity className="h-3.5 w-3.5" />} index={2} />
        <AutomationMetricCard label="Success Rate" value={data.successRate} format="percent" icon={<CheckCircle2 className="h-3.5 w-3.5" />} index={3} />
        <AutomationMetricCard label="Failed Jobs" value={data.failedJobs} icon={<XCircle className="h-3.5 w-3.5" />} index={4} />
        <AutomationMetricCard label="Retry Queue" value={data.retryQueue} icon={<AlertCircle className="h-3.5 w-3.5" />} index={5} />
        <AutomationMetricCard label="Dead Letter Queue" value={data.deadLetterQueue} icon={<AlertCircle className="h-3.5 w-3.5" />} index={6} />
        <AutomationMetricCard label="Avg Execution Time" value={data.avgExecutionTime} format="duration" icon={<Clock className="h-3.5 w-3.5" />} index={7} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Workflow Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.workflowStatusCounts).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No workflows created yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.workflowStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/40">
                    <span className="flex items-center gap-2 text-sm capitalize">
                      <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : status === "draft" ? "bg-gray-500" : "bg-rose-500"}`} />
                      {status}
                    </span>
                    <span className="text-sm font-medium tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentExecutions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No recent executions</p>
            ) : (
              <ul className="space-y-1">
                {data.recentExecutions.slice(0, 8).map((exec) => (
                  <li key={exec.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/40">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm">{exec.workflowName}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[exec.status] ?? ""}`}>
                      {exec.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default AutomationDashboard;
