"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getWholesaleAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function WholesaleAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Wholesale Analytics",
        description: "Wholesale revenue, orders, and top buyers.",
        loadAction: getWholesaleAnalyticsAction,
        sections: [
          { type: "metrics", columns: 3 },
          { type: "ranked", dataKey: "topWholesaleBuyers", title: "Top Wholesale Buyers" },
        ],
      }}
    />
  );
}
