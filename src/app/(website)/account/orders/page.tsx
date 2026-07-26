import type { Metadata } from "next";
import { getOrdersAction } from "@/features/identity/actions/account-actions";
import { OrdersPageContent } from "./orders-content";

export const metadata: Metadata = {
  title: "Orders - DropshopNN",
  robots: { index: false },
};

export default async function OrdersPage() {
  const result = await getOrdersAction();
  return (
    <OrdersPageContent
      initialOrders={result.success ? (result.data?.items ?? []) : []}
      initialTotal={result.success ? (result.data?.total ?? 0) : 0}
    />
  );
}
