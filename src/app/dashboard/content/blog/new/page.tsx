import type { Metadata } from "next";
import { ContentEditor } from "@/features/cms/components/content-editor";

export const metadata: Metadata = {
  title: "New Blog Post - CMS - NN Enterprise",
  robots: { index: false },
};

export default function NewBlogPostPage() {
  return <ContentEditor type="blog" backHref="/dashboard/content/blog" />;
}
