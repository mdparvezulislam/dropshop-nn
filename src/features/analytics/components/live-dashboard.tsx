"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, RefreshCw, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLiveDashboardAction } from "../actions/analytics-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import type { ExecutiveDashboardData } from "../domain/analytics-entity";

export type AnalyticsTimeframe = "24h" | "today" | "7d" | "30d";

const TIMEFRAME_OPTIONS: ReadonlyArray<{
  value: AnalyticsTimeframe;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  { value: "24h", label: "24 Hours", shortLabel: "Hours", description: "last 24 hours" },
  { value: "today", label: "Today", shortLabel: "Day", description: "today" },
  { value: "7d", label: "7 Days", shortLabel: "Week", description: "last 7 days" },
  { value: "30d", label: "30 Days", shortLabel: "Month", description: "last 30 days" },
];

export function LiveDashboard(): React.ReactElement {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interval, setIntervalMs] = useState(30);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("today");
  const [liveTime, setLiveTime] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeOption = TIMEFRAME_OPTIONS.find((t) => t.value === timeframe) ?? TIMEFRAME_OPTIONS[1];

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getLiveDashboardAction(timeframe);
    if (res.success && res.data) {
      setData(res.data as ExecutiveDashboardData);
    }
    setLoading(false);
    setLiveTime(new Date());
  }, [timeframe]);

  useEffect(() => {
    load();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (interval > 0) {
      intervalRef.current = setInterval(load, interval * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [interval, load]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top Bar Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-black tracking-tight sm:text-2xl text-foreground">
              Live Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Real-time platform activity — auto-refreshes every {interval > 0 ? `${interval}s` : "manual"}
            </p>
          </div>
          <Badge variant="success" className="gap-1.5 px-2.5 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </Badge>
        </div>

        {/* Timeframe Options (Hours / Day / Week / Month) & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-2xs">
            {TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeframe(opt.value)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all touch-manipulation focus-visible:outline-2 focus-visible:outline-primary",
                  timeframe === opt.value
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Select value={String(interval)} onValueChange={(v) => setIntervalMs(Number(v))}>
              <SelectTrigger className="w-24 h-9 text-xs font-bold border-border shadow-2xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
                <SelectItem value="0">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="h-9 gap-1.5 text-xs font-bold shadow-2xs active:scale-95 touch-manipulation"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
        <p className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          Last updated: <span className="font-mono text-foreground font-bold">{liveTime.toLocaleTimeString()}</span>
        </p>
        <p className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          Timeframe: <span className="font-bold text-foreground capitalize">{activeOption.label} ({activeOption.description})</span>
        </p>
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : data ? (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Card className="border-border bg-card shadow-2xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-black text-foreground">{data.todayOrders.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">({activeOption.description})</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{data.todayDeliveries.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">({activeOption.description})</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-black text-foreground">{data.todayShipments.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">({activeOption.description})</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-black text-primary">৳{data.todayRevenue.toLocaleString("en-BD")}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">({activeOption.description})</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{data.todayReturns.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">({activeOption.description})</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Summary Cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-black flex items-center justify-between text-foreground">
                  <span>Recent Orders</span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {activeOption.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-foreground">{data.todayOrders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-semibold mt-1">
                  total orders placed ({activeOption.description})
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-black flex items-center justify-between text-foreground">
                  <span>Revenue ({activeOption.label})</span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {activeOption.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ৳{data.todayRevenue.toLocaleString("en-BD")}
                </p>
                <p className="text-xs text-muted-foreground font-semibold mt-1">
                  gross platform revenue ({activeOption.description})
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

export default LiveDashboard;
