"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminAuditFeedAction } from "../actions/admin-identity-actions";

interface AuditRow {
  id: string;
  eventName: string;
  timestamp: Date;
  actorId?: string;
  actorRole?: string;
  entityType?: string;
  entityId?: string;
  module: string;
}

export function AuditCenter(): React.ReactElement {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdminAuditFeedAction(60);
    if (res.success && res.data) setItems(res.data as AuditRow[]);
    else {
      setItems([]);
      if (!res.success) toast.error(res.error ?? "Failed to load audit feed");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Audit Center</h1>
          <p className="text-sm text-muted-foreground">
            Operational event stream from Analytics (admin, identity, orders, CMS).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No audit events yet. Activity appears as the platform is used.
            </p>
          ) : (
            items.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium">{e.eventName}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.module}
                    {e.entityType ? ` · ${e.entityType}` : ""}
                    {e.entityId ? ` · ${e.entityId.slice(0, 10)}…` : ""}
                    {e.actorRole ? ` · ${e.actorRole}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {e.module}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {new Date(e.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
