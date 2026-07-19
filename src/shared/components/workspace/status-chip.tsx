import * as React from "react";
import { cn } from "@/shared/utils/cn";

const toneStyles = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  primary: "bg-primary/15 text-primary",
} as const;

export type StatusTone = keyof typeof toneStyles;

export interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
}

export function StatusChip({
  label,
  tone = "neutral",
  dot = true,
  className,
}: StatusChipProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
        toneStyles[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-muted-foreground": tone === "neutral",
            "bg-success": tone === "success",
            "bg-warning": tone === "warning",
            "bg-destructive": tone === "danger",
            "bg-info": tone === "info",
            "bg-primary": tone === "primary",
          })}
        />
      ) : null}
      {label.replace(/_/g, " ")}
    </span>
  );
}

export function statusToneFromValue(status: string): StatusTone {
  const s = status.toLowerCase();
  if (["active", "completed", "verified", "delivered", "success", "in_stock"].includes(s)) {
    return "success";
  }
  if (["pending", "draft", "low_stock", "warning", "scheduled"].includes(s)) {
    return "warning";
  }
  if (
    [
      "suspended",
      "blocked",
      "failed",
      "cancelled",
      "out_of_stock",
      "rejected",
      "destructive",
    ].includes(s)
  ) {
    return "danger";
  }
  if (["processing", "shipped", "info", "backorder", "pre_order"].includes(s)) {
    return "info";
  }
  return "neutral";
}

export default StatusChip;
