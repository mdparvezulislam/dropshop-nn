"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminAuditFeedAction } from "@/features/identity/actions/admin-identity-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Activity, AlertTriangle, Clock } from "lucide-react";

export default function ActivityPage(): React.ReactElement {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await getAdminAuditFeedAction(100);
    if (res.success && res.data) setEvents(res.data);
    else {
      toast.error("লোড ব্যর্থ");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = events.filter(
    (e) => !filter || e.eventName?.includes(filter) || e.module?.includes(filter),
  );

  const todayCount = events.filter((e) => {
    const d = new Date(e.timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  }).length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/identity"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">অ্যাক্টিভিটি লগ</h1>
            <p className="text-sm text-muted-foreground">Identity & System Activity Log</p>
          </div>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3">
            <Activity className="h-4 w-4 text-blue-400 mb-1" />
            <p className="text-xs text-muted-foreground">Total Events</p>
            <p className="text-lg font-bold">{events.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3">
            <Clock className="h-4 w-4 text-emerald-400 mb-1" />
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-lg font-bold text-emerald-400">{todayCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 mb-1" />
            <p className="text-xs text-muted-foreground">Modules</p>
            <p className="text-lg font-bold text-amber-400">
              {new Set(events.map((e) => e.module)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3">
          <input
            type="text"
            placeholder="ইভেন্ট বা মডিউল ফিল্টার..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</p>
            ) : filtered.length === 0 ? (
              <p className="p-12 text-center text-muted-foreground">কোনো ইভেন্ট নেই</p>
            ) : (
              filtered.map((e, i) => (
                <div
                  key={e.id ?? i}
                  className="flex items-start gap-3 p-3 border-b border-border/30 hover:bg-muted/20"
                >
                  <div className="h-2 w-2 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-foreground">{e.eventName}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(e.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {e.actorRole && (
                      <p className="text-xs text-muted-foreground">
                        Actor: {e.actorId} ({e.actorRole})
                      </p>
                    )}
                    {e.entityType && (
                      <p className="text-xs text-muted-foreground">
                        {e.entityType}: {e.entityId}
                      </p>
                    )}
                    <Badge variant="outline" className="text-[9px] mt-1">
                      {e.module}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
