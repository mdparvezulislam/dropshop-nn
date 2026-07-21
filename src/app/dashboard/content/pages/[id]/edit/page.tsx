import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentService } from "@/features/cms/services/content-service";
import { ContentEditor } from "@/features/cms/components/content-editor";

export const metadata: Metadata = {
  title: "Edit Page - CMS - DropshopNN",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: PageProps) {
  const { id } = await params;
  const service = new ContentService();
  const content = await service.getById(id);
  if (!content || (content.type !== "page" && content.type !== "landing")) notFound();
  return (
    <ContentEditor type={content.type} initial={content} backHref="/dashboard/content/pages" />
  );
}
