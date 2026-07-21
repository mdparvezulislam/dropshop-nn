"use client";

import { cn } from "@/shared/utils/cn";

export type AnalyticsPreset = "today" | "7d" | "30d" | "90d" | "12m";

const PRESETS: { value: AnalyticsPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
];

interface TimeRangeFilterProps {
  value: AnalyticsPreset;
  onChange: (value: AnalyticsPreset) => void;
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps): React.ReactElement {
  return (
    <div className="inline-flex rounded-lg border border-border/60 bg-card p-0.5" role="group" aria-label="Date range">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === p.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
