"use client";

import * as React from "react";
import { TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/workspace/section-header";

export interface SalesPerformanceData {
  day: string;
  revenue: number;
  profit: number;
}

const DEFAULT_CHART_DATA: SalesPerformanceData[] = [
  { day: "Mon", revenue: 4500, profit: 1200 },
  { day: "Tue", revenue: 6200, profit: 1800 },
  { day: "Wed", revenue: 3800, profit: 950 },
  { day: "Thu", revenue: 8900, profit: 2400 },
  { day: "Fri", revenue: 11200, profit: 3100 },
  { day: "Sat", revenue: 9400, profit: 2700 },
  { day: "Sun", revenue: 13500, profit: 3900 },
];

export function ResellerSalesChartWidget(): React.ReactElement {
  const maxRevenue = Math.max(...DEFAULT_CHART_DATA.map((d) => d.revenue), 1000);

  return (
    <Card className="border-border/80 shadow-xs">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              7-Day Performance
            </span>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              Sales &amp; Profit Trend <TrendingUp className="w-4 h-4 text-success" />
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Profit</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visual */}
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-border/60">
          {DEFAULT_CHART_DATA.map((item) => {
            const revHeightPercent = Math.round((item.revenue / maxRevenue) * 100);
            const profHeightPercent = Math.round((item.profit / maxRevenue) * 100);

            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                  {/* Revenue Bar */}
                  <div
                    className="w-full max-w-[16px] bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300 relative"
                    style={{ height: `${revHeightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity">
                      ৳{item.revenue}
                    </div>
                  </div>
                  {/* Profit Bar */}
                  <div
                    className="w-full max-w-[16px] bg-emerald-500/80 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative"
                    style={{ height: `${profHeightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity">
                      ৳{item.profit}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{item.day}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
