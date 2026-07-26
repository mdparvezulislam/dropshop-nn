"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getInventoryAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function InventoryAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Inventory Analytics",
        description: "Stock movement, fast/slow moving products, and inventory value.",
        loadAction: getInventoryAnalyticsAction,
        sections: [
          { type: "metrics", columns: 3 },
          {
            type: "chart",
            dataKey: "stockMovement",
            title: "Stock Movement",
            chartLabel: "Movements",
            chartType: "area",
          },
        ],
      }}
    />
  );
}
