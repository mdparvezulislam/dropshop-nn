"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getExecutionsAction,
  cancelExecutionAction,
  retryExecutionAction,
} from "../actions/automation-actions";
import type { WorkflowExecution } from "../domain/automation-entity";

const statusColors: Record<string, string> = {
  running: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-rose-500/10 text-rose-600",
  pending: "bg-amber-500/10 text-amber-600",
  cancelled: "bg-gray-500/10 text-gray-600",
  retrying: "bg-violet-500/10 text-violet-600",
  paused: "bg-orange-500/10 text-orange-600",
  timeout: "bg-red-500/10 text-red-600",
};

export function ExecutionHistory(): React.ReactElement {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getExecutionsAction();
    if (res.success && res.data) setExecutions(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    statusFilter === "all" ? executions : executions.filter((e) => e.status === statusFilter);

  const handleCancel = async (id: string) => {
    await cancelExecutionAction(id);
    load();
  };

  const handleRetry = async (id: string) => {
    await retryExecutionAction(id);
    load();
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading && executions.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Execution History</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="retrying">Retrying</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No executions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((exec, i) => (
            <motion.div
              key={exec.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{exec.workflowName}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${statusColors[exec.status] ?? ""}`}
                      >
                        {exec.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        v{exec.workflowVersion}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Trigger: {exec.trigger} &middot; Duration: {formatDuration(exec.duration)}
                      {exec.retryCount > 0 && ` · Retries: ${exec.retryCount}`}
                      {exec.startedAt && ` · ${new Date(exec.startedAt).toLocaleString()}`}
                    </p>
                    {exec.error && (
                      <p className="mt-1 truncate text-xs text-rose-500">
                        Error: {exec.error.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {exec.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRetry(exec.id)}
                        title="Retry"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {(exec.status === "running" || exec.status === "pending") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-500"
                        onClick={() => handleCancel(exec.id)}
                        title="Cancel"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ExecutionHistory;
