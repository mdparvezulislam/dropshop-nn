"use client";

import React from "react";
import { OrderManagementWorkspace } from "@/features/order/components/order-management-workspace";

export default function ResellerOrdersPage(): React.ReactElement {
  return <OrderManagementWorkspace userRole="reseller" />;
}
