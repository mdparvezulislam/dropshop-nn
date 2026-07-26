import { permanentRedirect } from "next/navigation";

interface ProductAliasProps {
  params: Promise<{ slug: string }>;
}

/** Legacy alias — the canonical product route is /product/[slug]. */
export default async function ProductAliasPage({ params }: ProductAliasProps): Promise<never> {
  const { slug } = await params;
  permanentRedirect(`/product/${encodeURIComponent(slug)}`);
}
