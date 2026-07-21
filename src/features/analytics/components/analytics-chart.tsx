"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { TimeSeriesPoint } from "../domain/analytics-entity";

interface AnalyticsChartProps {
  title: string;
  data: TimeSeriesPoint[];
  type?: "area" | "bar";
  valueLabel?: string;
  color?: string;
}

export function AnalyticsChart({
  title,
  data,
  type = "area",
  valueLabel = "Value",
  color = "hsl(var(--primary))",
}: AnalyticsChartProps): React.ReactElement {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-2">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data in this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(l) => String(l)}
                  formatter={(v) => [Number(v).toLocaleString(), valueLabel]}
                />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [Number(v).toLocaleString(), valueLabel]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill="url(#analyticsFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
