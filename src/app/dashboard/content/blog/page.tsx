import type { Metadata } from "next";
import { ContentService } from "@/features/cms/services/content-service";
import { ContentList } from "@/features/cms/components/content-list";

export const metadata: Metadata = {
  title: "Blog - CMS - DropshopNN",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CmsBlogListPage() {
  const service = new ContentService();
  let items: Awaited<ReturnType<ContentService["list"]>>["items"] = [];
  let totalCount = 0;
  try {
    const result = await service.list({ type: "blog" }, { page: 1, limit: 50 });
    items = result.items;
    totalCount = result.totalCount;
  } catch {
    // empty
  }

  return (
    <ContentList
      type="blog"
      title="Blog"
      description="Articles powered by the shared content engine"
      items={items}
      totalCount={totalCount}
      createHref="/dashboard/content/blog/new"
      editBaseHref="/dashboard/content/blog"
    />
  );
}
