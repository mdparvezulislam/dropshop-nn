"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { getLiveDashboardAction } from "../actions/analytics-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { ExecutiveDashboardData } from "../domain/analytics-entity";

export function LiveDashboard(): React.ReactElement {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interval, setIntervalMs] = useState(30);
  const [liveTime, setLiveTime] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const res = await getLiveDashboardAction();
    if (res.success && res.data) {
      setData(res.data as ExecutiveDashboardData);
    }
    setLoading(false);
    setLiveTime(new Date());
  }, []);

  useEffect(() => {
    load();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [load]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (interval > 0) {
      intervalRef.current = setInterval(load, interval * 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [interval, load]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Live Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Real-time platform activity — auto-refreshes every {interval}s
            </p>
          </div>
          <Badge variant="success" className="gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(interval)} onValueChange={(v) => setIntervalMs(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">60s</SelectItem>
              <SelectItem value="0">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <Activity className="mr-1 inline-block h-3 w-3" />
        Last updated: {liveTime.toLocaleTimeString()}
      </p>

      {loading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Live Orders</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{data.todayOrders.toLocaleString()}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Live Deliveries</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{data.todayDeliveries.toLocaleString()}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Live Shipments</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{data.todayShipments.toLocaleString()}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Live Revenue</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">৳{data.todayRevenue.toLocaleString("en-BD")}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Returns</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{data.todayReturns.toLocaleString()}</p></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Recent Orders</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.todayOrders}</p>
                <p className="text-sm text-muted-foreground mt-1">orders today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Revenue Today</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">৳{data.todayRevenue.toLocaleString("en-BD")}</p>
                <p className="text-sm text-muted-foreground mt-1">gross revenue today</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

export default LiveDashboard;
