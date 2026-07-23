import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import {
  estimateReadingTime,
  formatBlogDate,
  formatReadingTime,
} from "@/features/cms/utils/blog-utils";
import type { CmsContent } from "@/features/cms/domain/content-entity";

interface BlogCardProps {
  post: CmsContent;
}

export function BlogCard({ post }: BlogCardProps): React.ReactElement {
  const readTime = formatReadingTime(estimateReadingTime(post.bodyHtml));
  const date = formatBlogDate(post.publishedAt ?? post.createdAt);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:border-primary/20 hover:shadow-md"
    >
      <div className="relative aspect-video bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/20">
            Article
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/40">
          {post.category && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              {post.category}
            </span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-xs text-foreground/50">{post.excerpt}</p>
        )}
        {post.authorName && (
          <p className="text-[11px] text-foreground/40">By {post.authorName}</p>
        )}
      </div>
    </Link>
  );
}
