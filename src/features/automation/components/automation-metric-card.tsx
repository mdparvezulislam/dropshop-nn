"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/cn";

interface AutomationMetricProps {
  label: string;
  value: string | number;
  change?: number;
  format?: "number" | "percent" | "duration";
  icon?: React.ReactNode;
  index?: number;
}

export function AutomationMetricCard({
  label,
  value,
  change,
  format = "number",
  icon,
  index = 0,
}: AutomationMetricProps): React.ReactElement {
  const up = (change ?? 0) >= 0;

  const displayValue = () => {
    if (format === "percent") return `${value}%`;
    if (format === "duration") {
      const ms = Number(value);
      if (ms < 1000) return `${ms}ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
      return `${(ms / 60000).toFixed(1)}m`;
    }
    return Number(value).toLocaleString("en-BD");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {label}
            </CardTitle>
            {icon && <span className="text-muted-foreground">{icon}</span>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">{displayValue()}</p>
          {change !== undefined && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                up ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {up ? "+" : ""}
              {change}%
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
