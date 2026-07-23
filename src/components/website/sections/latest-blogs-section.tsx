import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import {
  estimateReadingTime,
  formatBlogDate,
  formatReadingTime,
} from "@/features/cms/utils/blog-utils";

export interface BlogPostCardData {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  readTime: string;
  category: string;
  coverImage?: string;
  authorName?: string;
}

interface LatestBlogsSectionProps {
  posts?: BlogPostCardData[];
  title?: string;
  description?: string;
}

export function mapCmsPostToBlogCard(post: {
  title: string;
  excerpt?: string;
  slug: string;
  bodyHtml?: string;
  category?: string;
  coverImage?: string;
  authorName?: string;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
}): BlogPostCardData {
  return {
    title: post.title,
    excerpt: post.excerpt || "",
    slug: `/blog/${post.slug}`,
    date: formatBlogDate(post.publishedAt ?? post.createdAt),
    readTime: formatReadingTime(estimateReadingTime(post.bodyHtml)),
    category: post.category || "Insights",
    coverImage: post.coverImage,
    authorName: post.authorName,
  };
}

export function LatestBlogsSection({
  posts = [],
  title = "Latest Insights",
  description = "Tips, guides, and updates for your business",
}: LatestBlogsSectionProps): React.ReactElement | null {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(222_47%_11%)]">
              {title}
            </h2>
            <p className="mt-2 text-[hsl(215_16%_47%)]">{description}</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={post.slug.startsWith("/") ? post.slug : `/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-[hsl(0_0%_91%)] bg-white transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="relative aspect-video bg-[hsl(0_0%_96%)]">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[hsl(215_16%_47%/0.3)]">
                    Blog Image
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[hsl(215_16%_47%)]">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                    {post.category}
                  </span>
                  {post.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold text-[hsl(222_47%_11%)] transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-xs text-[hsl(215_16%_47%)]">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
