import type { Metadata } from "next";
import { SettingsAdmin } from "@/features/identity/components/settings-admin";

export const metadata: Metadata = {
  title: "Settings - DropshopNN",
  robots: { index: false },
};

export default function SettingsPage() {
  return <SettingsAdmin />;
}
