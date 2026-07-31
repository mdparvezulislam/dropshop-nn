import type { Metadata } from "next";
import { SettingsCenterUI } from "@/features/settings/components/SettingsCenterUI";

export const metadata: Metadata = {
  title: "Settings - NN Enterprise",
  robots: { index: false },
};

export default function SettingsPage() {
  return <SettingsCenterUI />;
}
