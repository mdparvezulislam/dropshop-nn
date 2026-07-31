import type { Metadata } from "next";
import { ContentEditor } from "@/features/cms/components/content-editor";

export const metadata: Metadata = {
  title: "New Page - CMS - NN Enterprise",
  robots: { index: false },
};

export default function NewPagePage() {
  return <ContentEditor type="page" backHref="/dashboard/content/pages" />;
}
