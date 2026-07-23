"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getProductAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function ProductAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Product Analytics",
        description: "Product performance, inventory insights, and category analysis.",
        loadAction: getProductAnalyticsAction,
        sections: [
          { type: "metrics", columns: 4 },
          {
            type: "ranked-grid",
            columns: 4,
            items: [
              { title: "Top Selling Products", key: "topSellingProducts" },
              { title: "Most Viewed Products", key: "mostViewedProducts" },
              { title: "Highest Revenue Products", key: "highestRevenueProducts" },
              { title: "Low Selling Products", key: "lowSellingProducts" },
            ],
          },
          {
            type: "ranked-grid",
            columns: 2,
            items: [
              { title: "Category Performance", key: "categoryPerformance" },
              { title: "Brand Performance", key: "brandPerformance" },
            ],
          },
        ],
      }}
    />
  );
}
