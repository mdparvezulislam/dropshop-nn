import type { Metadata } from "next";
import { DeliveryAutomationUI } from "@/features/courier/components/DeliveryAutomationUI";

export const metadata: Metadata = {
  title: "Delivery Automation - DropshopNN",
  robots: { index: false },
};

export default function DeliveryAutomationPage() {
  return <DeliveryAutomationUI />;
}
