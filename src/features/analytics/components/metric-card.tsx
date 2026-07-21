"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/cn";
import type { MetricCardData } from "../domain/analytics-entity";

function formatValue(metric: MetricCardData): string {
  if (metric.format === "currency") {
    return `৳${Math.round(metric.value).toLocaleString("en-BD")}`;
  }
  if (metric.format === "percent") {
    return `${metric.value}%`;
  }
  return Math.round(metric.value).toLocaleString("en-BD");
}

interface MetricCardProps {
  metric: MetricCardData;
  index?: number;
}

export function MetricCard({ metric, index = 0 }: MetricCardProps): React.ReactElement {
  const up = (metric.changePercent ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {metric.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">{formatValue(metric)}</p>
          {metric.changePercent !== undefined && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                up ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {up ? "+" : ""}
              {metric.changePercent}% vs prior
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
