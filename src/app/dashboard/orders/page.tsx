"use client";

import React from "react";
import { OrderManagementWorkspace } from "@/features/order/components/order-management-workspace";

export default function OrderDashboardPage(): React.ReactElement {
  return <OrderManagementWorkspace userRole="admin" />;
}
