import * as React from "react";
import { cn } from "@/shared/utils/cn";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
  accent?: "default" | "success" | "warning" | "danger" | "info";
}

const accentMap = {
  default: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
  info: "text-info bg-info/10",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
  accent = "default",
}: StatCardProps): React.ReactElement {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums truncate">{value}</p>
            {(hint || trend) && (
              <div className="flex items-center gap-2 text-xs">
                {trend ? (
                  <span
                    className={cn(
                      "font-medium",
                      trend.positive === false ? "text-destructive" : "text-success",
                    )}
                  >
                    {trend.value}
                  </span>
                ) : null}
                {hint ? <span className="text-muted-foreground">{hint}</span> : null}
              </div>
            )}
          </div>
          {Icon ? (
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                accentMap[accent],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
