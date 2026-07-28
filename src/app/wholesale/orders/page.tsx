"use client";

import React from "react";
import { OrderManagementWorkspace } from "@/features/order/components/order-management-workspace";

export default function WholesaleOrdersPage(): React.ReactElement {
  return <OrderManagementWorkspace userRole="wholesaler" />;
}
