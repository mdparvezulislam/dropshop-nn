"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getCustomerAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function CustomerAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Customer Analytics",
        description: "Customer acquisition, retention, lifetime value, and behavior.",
        loadAction: getCustomerAnalyticsAction,
        sections: [
          { type: "metrics", columns: 5 },
          { type: "chart", dataKey: "customerAcquisitionSeries", title: "Customer Acquisition", chartLabel: "Customers", chartType: "area" },
        ],
      }}
    />
  );
}
