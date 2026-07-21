import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getBlogTaxonomyAction,
  listPublicBlogAction,
} from "@/features/cms/actions/content-actions";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import { BlogListing } from "@/shared/components/website/blog/blog-listing";
import type { PaginatedResult } from "@/shared/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog - DropshopNN",
  description:
    "Guides, product insights, and growth playbooks for dropshipping and wholesale commerce in Bangladesh.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog - DropshopNN",
    description: "Commerce insights for Bangladesh entrepreneurs.",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page) || "1") || 1);
  const category = first(sp.category);
  const tag = first(sp.tag);
  const search = first(sp.search);
  const limit = 12;

  const [listRes, taxRes] = await Promise.all([
    listPublicBlogAction({ page, limit, category, tag, search }),
    getBlogTaxonomyAction(),
  ]);

  const data = (listRes.success ? listRes.data : null) as PaginatedResult<CmsContent> | null;
  const posts = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const categories = taxRes.success ? taxRes.data?.categories ?? [] : [];
  const tags = taxRes.success ? taxRes.data?.tags ?? [] : [];

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-(--content-max) px-4 py-20 text-center text-sm text-muted-foreground">
          Loading articles...
        </div>
      }
    >
      <BlogListing
        posts={posts}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        categories={categories}
        tags={tags}
        activeCategory={category}
        activeTag={tag}
        search={search}
      />
    </Suspense>
  );
}
