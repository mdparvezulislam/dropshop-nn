"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/utils/cn";

export interface StockChipProps {
  status: "in_stock" | "low_stock" | "out_of_stock";
  subtle?: boolean;
  className?: string;
}

export function StockChip({ status, subtle = false, className }: StockChipProps): ReactElement {
  const config =
    status === "in_stock"
      ? {
          label: "স্টকে আছে",
          dot: "bg-emerald-500 animate-pulse",
          badge: subtle
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
        }
      : status === "low_stock"
        ? {
            label: "সীমিত স্টক",
            dot: "bg-amber-500 animate-ping",
            badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          }
        : {
            label: "স্টক শেষ",
            dot: "bg-rose-500",
            badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black tracking-tight leading-none",
        config.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} aria-hidden />
      <span>{config.label}</span>
    </span>
  );
}

export default StockChip;
