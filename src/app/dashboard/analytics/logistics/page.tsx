"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getLogisticsAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function LogisticsAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Logistics Analytics",
        description: "Courier performance, delivery times, and return rates.",
        loadAction: getLogisticsAnalyticsAction,
        sections: [
          { type: "metrics", columns: 4 },
          { type: "ranked", dataKey: "courierPerformance", title: "Courier Performance" },
        ],
      }}
    />
  );
}
