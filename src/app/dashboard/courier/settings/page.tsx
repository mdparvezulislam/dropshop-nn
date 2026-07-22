import type { Metadata } from "next";
import { CourierSettingsUI } from "@/features/courier/components/CourierSettingsUI";

export const metadata: Metadata = {
  title: "Courier Integration Settings - DropshopNN",
  robots: { index: false },
};

export default function CourierSettingsPage() {
  return <CourierSettingsUI />;
}
