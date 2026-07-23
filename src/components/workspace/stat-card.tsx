import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
  accent?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
}

const accentMap = {
  default: "text-primary border-primary/30 bg-accent/90 shadow-glow",
  primary: "text-primary border-primary/30 bg-accent/90 shadow-glow",
  success: "text-success border-success/30 bg-success/10",
  warning: "text-warning border-warning/30 bg-warning/10",
  danger: "text-destructive border-destructive/30 bg-destructive/10",
  info: "text-info border-info/30 bg-info/10",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
  accent = "default",
  loading = false,
}: StatCardProps): React.ReactElement {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden border-border bg-card shadow-2xs", className)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2.5 min-w-0 flex-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card shadow-2xs transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 group",
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums truncate text-foreground">
              {value}
            </p>
            {(hint || trend) && (
              <div className="flex items-center gap-1.5 text-xs pt-0.5">
                {trend ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[11px]",
                      trend.positive === true && "text-success bg-success/15 border border-success/30",
                      trend.positive === false && "text-destructive bg-destructive/15 border border-destructive/30",
                      trend.positive === undefined && "text-muted-foreground bg-muted",
                    )}
                  >
                    {trend.positive === true ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : trend.positive === false ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {trend.value}
                  </span>
                ) : null}
                {hint ? <span className="text-muted-foreground font-medium text-[11px] truncate">{hint}</span> : null}
              </div>
            )}
          </div>
          {Icon ? (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-110",
                accentMap[accent],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
