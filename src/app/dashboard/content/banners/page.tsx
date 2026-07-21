import type { Metadata } from "next";
import { ContentService } from "@/features/cms/services/content-service";
import { ContentList } from "@/features/cms/components/content-list";

export const metadata: Metadata = {
  title: "Banners - CMS - DropshopNN",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const service = new ContentService();
  let items: Awaited<ReturnType<ContentService["list"]>>["items"] = [];
  let totalCount = 0;
  try {
    const result = await service.list(
      { type: ["banner", "announcement", "campaign", "flash_sale"] },
      { page: 1, limit: 50 },
    );
    items = result.items;
    totalCount = result.totalCount;
  } catch {
    // empty
  }

  return (
    <ContentList
      type={["banner", "announcement", "campaign", "flash_sale"]}
      title="Banners & Campaigns"
      description="Promotional banners, announcements, and campaign pages"
      items={items}
      totalCount={totalCount}
      createHref="/dashboard/content/banners/new"
      editBaseHref="/dashboard/content/banners"
    />
  );
}
