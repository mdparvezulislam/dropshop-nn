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
      className="group overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xs transition-all duration-200 hover:border-amber-400 hover:shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-video bg-slate-100 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-500">
              আর্টিক্যাল
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
            {post.category && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-black text-amber-900">
                {post.category}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                {date}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              {readTime}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-black text-slate-900 transition-colors group-hover:text-amber-600">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="line-clamp-2 text-xs font-bold text-slate-600 leading-relaxed">{post.excerpt}</p>
          )}
          {post.authorName && (
            <p className="text-[11px] font-extrabold text-slate-500">By {post.authorName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
