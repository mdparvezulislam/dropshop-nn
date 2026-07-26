import { permanentRedirect } from "next/navigation";

interface CollectionAliasProps {
  params: Promise<{ slug: string }>;
}

/** Legacy alias — the canonical collection route is /collections/[slug]. */
export default async function CollectionAliasPage({
  params,
}: CollectionAliasProps): Promise<never> {
  const { slug } = await params;
  permanentRedirect(`/collections/${encodeURIComponent(slug)}`);
}
