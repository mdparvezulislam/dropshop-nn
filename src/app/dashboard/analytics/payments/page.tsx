"use client";

import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { getPaymentAnalyticsAction } from "@/features/analytics/actions/analytics-actions";

export default function PaymentAnalyticsPage() {
  return (
    <AnalyticsView
      config={{
        title: "Payment Analytics",
        description: "Payment method distribution, success rates, and failures.",
        loadAction: getPaymentAnalyticsAction,
        sections: [
          { type: "metrics", columns: 3 },
          { type: "ranked", dataKey: "paymentMethods", title: "Payment Methods" },
        ],
      }}
    />
  );
}
