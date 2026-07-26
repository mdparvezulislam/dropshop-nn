import { permanentRedirect } from "next/navigation";

interface BrandAliasProps {
  params: Promise<{ slug: string }>;
}

/** Legacy alias — the canonical brand route is /brands/[slug]. */
export default async function BrandAliasPage({ params }: BrandAliasProps): Promise<never> {
  const { slug } = await params;
  permanentRedirect(`/brands/${encodeURIComponent(slug)}`);
}
