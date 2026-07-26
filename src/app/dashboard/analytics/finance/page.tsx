"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getFinanceAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function FinanceAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Finance Analytics",
        description: "Revenue, profit, expenses, refunds, and settlement status.",
        loadAction: getFinanceAnalyticsAction,
        sections: [
          { type: "metrics", columns: 4 },
          {
            type: "charts",
            columns: 2,
            items: [
              { title: "Revenue Trend", key: "revenueSeries", type: "area", label: "Revenue" },
              {
                title: "Profit Trend",
                key: "profitSeries",
                type: "area",
                label: "Profit",
                color: "hsl(142 71% 45%)",
              },
            ],
          },
        ],
      }}
    />
  );
}
