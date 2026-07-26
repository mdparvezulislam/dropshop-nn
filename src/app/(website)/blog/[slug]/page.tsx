import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBlogPostAction } from "@/features/cms/actions/content-actions";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/features/cms/utils/blog-utils";
import { BlogArticle } from "@/components/website/blog/blog-article";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicBlogPostAction(slug);
  const post = (result.success ? result.data?.post : null) as CmsContent | null;

  if (!post) {
    return { title: "Article Not Found - DropshopNN" };
  }

  const title = post.seo?.metaTitle || post.title;
  const description =
    post.seo?.metaDescription || post.excerpt || `Read ${post.title} on DropshopNN`;
  const image = post.seo?.ogImage || post.coverImage;

  return {
    title: `${title} - DropshopNN`,
    description,
    robots: post.seo?.robots || undefined,
    alternates: {
      canonical: post.seo?.canonicalUrl || `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seo?.ogTitle || title,
      description: post.seo?.ogDescription || description,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: (post.seo?.twitterCard as "summary_large_image") || "summary_large_image",
      title: post.seo?.twitterTitle || title,
      description: post.seo?.twitterDescription || description,
      images: post.seo?.twitterImage || image ? [post.seo?.twitterImage || image || ""] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await getPublicBlogPostAction(slug);

  if (!result.success || !result.data?.post) {
    notFound();
  }

  const post = result.data.post as CmsContent;
  const related = (result.data.related as CmsContent[]) ?? [];

  const articleLd =
    post.seo?.jsonLd ||
    buildArticleJsonLd({
      title: post.title,
      description: post.excerpt,
      slug: post.slug,
      coverImage: post.coverImage,
      authorName: post.authorName,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    });

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "https://dropshopnn.com/" },
    { name: "Blog", url: "https://dropshopnn.com/blog" },
    { name: post.title, url: `https://dropshopnn.com/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogArticle post={post} related={related} />
    </>
  );
}
