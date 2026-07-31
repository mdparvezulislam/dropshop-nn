import type { Metadata } from "next";
import { MediaService } from "@/features/cms/services/media-service";
import { MediaLibraryClient } from "@/features/cms/components/media-library-client";

export const metadata: Metadata = {
  title: "Media Library - CMS - NN Enterprise",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const service = new MediaService();
  let items: Awaited<ReturnType<MediaService["list"]>>["items"] = [];
  let folders: string[] = [];
  let totalCount = 0;

  try {
    const [list, folderList] = await Promise.all([
      service.list({}, { page: 1, limit: 48 }),
      service.listFolders(),
    ]);
    items = list.items;
    totalCount = list.totalCount;
    folders = folderList;
  } catch {
    // empty during offline build
  }

  return (
    <MediaLibraryClient initialItems={items} initialFolders={folders} totalCount={totalCount} />
  );
}
