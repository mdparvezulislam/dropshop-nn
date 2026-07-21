import type { Metadata } from "next";
import { NavigationService } from "@/features/cms/services/navigation-service";
import { NavigationManagerClient } from "@/features/cms/components/navigation-manager-client";

export const metadata: Metadata = {
  title: "Navigation - CMS - DropshopNN",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NavigationManagerPage() {
  const service = new NavigationService();
  let menus: Awaited<ReturnType<NavigationService["list"]>> = [];
  try {
    menus = await service.list();
  } catch {
    // empty
  }

  return <NavigationManagerClient initialMenus={menus} />;
}
