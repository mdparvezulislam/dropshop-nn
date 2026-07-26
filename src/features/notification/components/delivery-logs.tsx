"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDeliveryLogsAction,
  retryNotificationDeliveryAction,
} from "../actions/notification-actions";
import type { NotificationMessage } from "../domain/notification-entity";

export function DeliveryLogs(): React.ReactElement {
  const [items, setItems] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getDeliveryLogsAction({
      page: 1,
      limit: 40,
      status: status || undefined,
    });
    if (res.success && res.data) {
      const d = res.data as { items: NotificationMessage[] };
      setItems(d.items ?? []);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = async (id: string): Promise<void> => {
    await retryNotificationDeliveryAction(id);
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Delivery Logs</h1>
          <p className="text-sm text-muted-foreground">
            Queued, delivered, failed, and retry history across channels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 rounded-md border border-input bg-card px-2 text-xs"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="queued">Queued</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="retrying">Retrying</option>
            <option value="read">Read</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No logs found.</p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.type} · user {n.userId.slice(0, 8)}… · {n.channels.join(", ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    {new Date(n.createdAt).toLocaleString()}
                    {n.attempts?.length ? ` · ${n.attempts.length} attempt(s)` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {n.status}
                  </Badge>
                  {n.status === "failed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => retry(n.id)}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
