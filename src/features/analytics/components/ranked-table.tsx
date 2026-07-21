"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { RankedItem } from "../domain/analytics-entity";

interface RankedTableProps {
  title: string;
  items: RankedItem[];
  emptyLabel?: string;
  valuePrefix?: string;
}

export function RankedTable({
  title,
  items,
  emptyLabel = "No data yet",
  valuePrefix = "",
}: RankedTableProps): React.ReactElement {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li
                key={`${item.id}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm">{item.label}</span>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {valuePrefix}
                  {item.value.toLocaleString("en-BD")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
