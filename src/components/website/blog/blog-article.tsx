"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, User } from "lucide-react";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import {
  estimateReadingTime,
  extractTableOfContents,
  formatBlogDate,
  formatReadingTime,
  injectHeadingIds,
} from "@/features/cms/utils/blog-utils";
import { Breadcrumb } from "@/components/website/breadcrumb";
import { useAnalytics } from "@/hooks/use-analytics";
import { ANALYTICS_EVENT_NAMES } from "@/features/analytics/domain/analytics-entity";
import { BlogCard } from "./blog-card";
import { BlogToc } from "./blog-toc";
import { ReadingProgress } from "./reading-progress";
import { ShareButtons } from "./share-buttons";

interface BlogArticleProps {
  post: CmsContent;
  related: CmsContent[];
}

export function BlogArticle({ post, related }: BlogArticleProps): React.ReactElement {
  const { track } = useAnalytics();
  const toc = useMemo(() => extractTableOfContents(post.bodyHtml), [post.bodyHtml]);
  const bodyHtml = useMemo(() => injectHeadingIds(post.bodyHtml, toc), [post.bodyHtml, toc]);
  const [activeId, setActiveId] = useState<string | undefined>(toc[0]?.id);
  const readTime = formatReadingTime(estimateReadingTime(post.bodyHtml));
  const date = formatBlogDate(post.publishedAt ?? post.createdAt);

  useEffect(() => {
    track(ANALYTICS_EVENT_NAMES.BLOG_VIEWED, {
      module: "blog",
      entityType: "blog",
      entityId: post.id,
      metadata: { title: post.title, slug: post.slug, category: post.category ?? "" },
    });
  }, [post.id, post.title, post.slug, post.category, track]);

  useEffect(() => {
    if (toc.length === 0) return;
    const elements = toc
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.5, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <>
      <ReadingProgress />
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-(--content-max) px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
      >
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

        <header className="mx-auto mt-6 max-w-3xl space-y-4 text-center">
          {post.category && (
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {post.category}
            </Link>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-base text-muted-foreground sm:text-lg">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            {post.authorName && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.authorName}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readTime}
            </span>
          </div>
          <div className="flex justify-center pt-2">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </header>

        {post.coverImage && (
          <div className="relative mx-auto mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0">
            <div className="mb-6 flex lg:hidden">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>
            <div
              className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-a:text-primary prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {post.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border/50 pt-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="hidden space-y-8 lg:block">
            <ShareButtons title={post.title} slug={post.slug} sticky />
            <BlogToc headings={toc} activeId={activeId} />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl border-t border-border/50 pt-12">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">Related articles</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        )}
      </motion.article>
    </>
  );
}
