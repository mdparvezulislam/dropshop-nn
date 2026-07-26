import * as React from "react";
import { cn } from "@/lib/utils/cn";

const toneStyles = {
  neutral: "bg-muted text-muted-foreground border-border/80",
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/12 text-warning border-warning/30",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-info/12 text-info border-info/30",
  primary: "bg-primary/12 text-primary border-primary/30",
} as const;

export type StatusTone = keyof typeof toneStyles;

export interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  pulse?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function StatusChip({
  label,
  tone = "neutral",
  dot = true,
  pulse = false,
  size = "default",
  className,
}: StatusChipProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center border font-semibold capitalize tracking-wide transition-colors",
        toneStyles[tone],
        size === "sm"
          ? "gap-1 rounded-md px-1.5 py-0.5 text-[10px]"
          : "gap-1.5 rounded-full px-2.5 py-0.5 text-[11px]",
        className,
      )}
    >
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", {
            "bg-muted-foreground": tone === "neutral",
            "bg-success": tone === "success",
            "bg-warning": tone === "warning",
            "bg-destructive": tone === "danger",
            "bg-info": tone === "info",
            "bg-primary": tone === "primary",
            "animate-pulse": pulse,
          })}
        />
      ) : null}
      {label.replace(/_/g, " ")}
    </span>
  );
}

export function statusToneFromValue(status: string): StatusTone {
  const s = (status || "").toLowerCase();
  if (
    [
      "active",
      "completed",
      "verified",
      "delivered",
      "success",
      "in_stock",
      "paid",
      "published",
    ].includes(s)
  ) {
    return "success";
  }
  if (
    ["pending", "draft", "low_stock", "warning", "scheduled", "review", "processing"].includes(s)
  ) {
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
      "unpaid",
      "archived",
    ].includes(s)
  ) {
    return "danger";
  }
  if (["shipped", "info", "backorder", "pre_order", "transit"].includes(s)) {
    return "info";
  }
  return "neutral";
}

export default StatusChip;
