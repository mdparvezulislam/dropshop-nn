"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  Pie, PieChart, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeSeriesPoint, ChartType } from "../domain/analytics-entity";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 200 80% 50%))",
  "hsl(var(--chart-3, 142 71% 45%))",
  "hsl(var(--chart-4, 38 92% 50%))",
  "hsl(var(--chart-5, 271 81% 56%))",
  "hsl(0 84% 60%)",
  "hsl(187 100% 42%)",
  "hsl(330 81% 60%)",
];

interface AnalyticsChartProps {
  title: string;
  data: TimeSeriesPoint[] | { name?: string; value?: number; [key: string]: any }[];
  type?: ChartType;
  valueLabel?: string;
  color?: string;
  dataKey?: string;
  nameKey?: string;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const fmtValue = (v: any) => [Number(v).toLocaleString(), undefined] as [string, undefined];

export function AnalyticsChart({
  title, data, type = "area", valueLabel = "Value", color = CHART_COLORS[0], dataKey = "value", nameKey = "name",
}: AnalyticsChartProps): React.ReactElement {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        {!data || data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data in this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <Pie
                  data={data as any[]}
                  dataKey={dataKey}
                  nameKey={nameKey}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={2}
                >
                  {(data as any[]).map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={fmtValue} />
                <Legend />
              </PieChart>
            ) : type === "line" ? (
              <LineChart data={data as any[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip contentStyle={tooltipStyle} formatter={fmtValue} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            ) : type === "bar" ? (
              <BarChart data={data as any[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip contentStyle={tooltipStyle} formatter={fmtValue} labelFormatter={(l: any) => String(l)} />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data as any[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip contentStyle={tooltipStyle} formatter={fmtValue} />
                <Area type="monotone" dataKey={dataKey} stroke={color} fill="url(#analyticsFill)" strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsChart;
