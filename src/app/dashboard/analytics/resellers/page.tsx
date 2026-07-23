"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getResellerAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function ResellerAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Reseller Analytics",
        description: "Reseller performance, commissions, and revenue tracking.",
        loadAction: getResellerAnalyticsAction,
        sections: [
          { type: "metrics", columns: 3 },
          { type: "ranked", dataKey: "topResellers", title: "Top Resellers" },
        ],
      }}
    />
  );
}
