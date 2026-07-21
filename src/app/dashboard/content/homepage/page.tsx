import type { Metadata } from "next";
import { ContentService } from "@/features/cms/services/content-service";
import { ContentList } from "@/features/cms/components/content-list";

export const metadata: Metadata = {
  title: "Homepage Builder - CMS - DropshopNN",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function HomepageBuilderPage() {
  const service = new ContentService();
  let items: Awaited<ReturnType<ContentService["list"]>>["items"] = [];
  let totalCount = 0;
  try {
    const result = await service.list(
      { type: ["homepage_section", "hero"] },
      { page: 1, limit: 50 },
      { sortBy: "sortOrder", sortOrder: "asc" },
    );
    items = result.items;
    totalCount = result.totalCount;
  } catch {
    // empty
  }

  return (
    <ContentList
      type={["homepage_section", "hero"]}
      title="Homepage Builder"
      description="Manage homepage sections and heroes via CMS blocks"
      items={items}
      totalCount={totalCount}
      createHref="/dashboard/content/pages/new"
      editBaseHref="/dashboard/content/pages"
    />
  );
}
