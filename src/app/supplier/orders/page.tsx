"use client";

import React from "react";
import { OrderManagementWorkspace } from "@/features/order/components/order-management-workspace";

export default function SupplierOrdersPage(): React.ReactElement {
  return <OrderManagementWorkspace userRole="supplier" />;
}
