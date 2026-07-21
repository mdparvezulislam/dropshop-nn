import type { Metadata } from "next";
import { ContentEditor } from "@/features/cms/components/content-editor";

export const metadata: Metadata = {
  title: "New Banner - CMS - DropshopNN",
  robots: { index: false },
};

export default function NewBannerPage() {
  return <ContentEditor type="banner" backHref="/dashboard/content/banners" />;
}
