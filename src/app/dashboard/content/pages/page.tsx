import type { Metadata } from "next";
import { ContentService } from "@/features/cms/services/content-service";
import { ContentList } from "@/features/cms/components/content-list";

export const metadata: Metadata = {
  title: "Pages - CMS - NN Enterprise",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CmsPagesListPage() {
  const service = new ContentService();
  let items: Awaited<ReturnType<ContentService["list"]>>["items"] = [];
  let totalCount = 0;
  try {
    const result = await service.list({ type: ["page", "landing"] }, { page: 1, limit: 50 });
    items = result.items;
    totalCount = result.totalCount;
  } catch {
    // empty
  }

  return (
    <ContentList
      type={["page", "landing"]}
      title="Pages"
      description="Static and landing pages"
      items={items}
      totalCount={totalCount}
      createHref="/dashboard/content/pages/new"
      editBaseHref="/dashboard/content/pages"
    />
  );
}
