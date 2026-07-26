"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { BlogCard } from "./blog-card";
import { useState } from "react";

interface BlogListingProps {
  posts: CmsContent[];
  totalCount: number;
  page: number;
  totalPages: number;
  categories: string[];
  tags: string[];
  activeCategory?: string;
  activeTag?: string;
  search?: string;
}

export function BlogListing({
  posts,
  totalCount,
  page,
  totalPages,
  categories,
  tags,
  activeCategory,
  activeTag,
  search: initialSearch,
}: BlogListingProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialSearch ?? "");

  const pushFilters = (next: Record<string, string | undefined>): void => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (!next.page) params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/blog?${qs}` : "/blog");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-(--content-max) px-4 py-10 sm:px-6 lg:px-8 lg:py-14 bg-[hsl(0_0%_98%)] text-slate-900 min-h-screen"
    >
      <div className="mx-auto max-w-2xl text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900">
          DropshopNN ব্লগ ও আর্টিক্যালের ক্যাটালগ
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-bold text-slate-600">
          বাংলাদেশে ড্রপশিপিং, ই-কমার্স ব্যবসা বৃদ্ধি ও পাইকারি কেনাকাটার জন্য সেরা গাইডলাইন।
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pushFilters({ search: query || undefined, page: undefined });
            }}
            placeholder="আর্টিক্যাল বা টিপস খুঁজুন..."
            className="pl-10 h-10 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-amber-500 shadow-2xs"
            aria-label="Search blog"
          />
        </div>
        <Button
          type="button"
          className="h-10 px-5 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
          onClick={() => pushFilters({ search: query || undefined, page: undefined })}
        >
          খুঁজুন
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => pushFilters({ category: undefined, page: undefined })}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-extrabold transition-colors",
              !activeCategory
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
            )}
          >
            সবগুলো
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => pushFilters({ category, page: undefined })}
              className={cn(
                "rounded-full border px-3.5 py-1 text-xs font-extrabold transition-colors",
                activeCategory === category
                  ? "border-amber-500 bg-amber-50 text-amber-900"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {tags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                pushFilters({
                  tag: activeTag === tag ? undefined : tag,
                  page: undefined,
                })
              }
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors",
                activeTag === tag
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-800 hover:bg-slate-300",
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs font-bold text-slate-600">
        মোট {totalCount} টি আর্টিক্যাল পাওয়া গেছে
      </p>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <p className="text-xs font-bold text-slate-600">কোনো আর্টিক্যাল পাওয়া যায়নি।</p>
          <Link
            href="/blog"
            className="mt-3 inline-block text-xs font-extrabold text-amber-600 hover:underline"
          >
            ফিল্টার রিমুভ করুন
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => pushFilters({ page: String(page - 1) })}
            className="text-xs font-bold border-slate-300 text-slate-800"
          >
            পূর্ববর্তী
          </Button>
          <span className="text-xs font-bold text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => pushFilters({ page: String(page + 1) })}
            className="text-xs font-bold border-slate-300 text-slate-800"
          >
            পরবর্তী
          </Button>
        </div>
      )}
    </motion.div>
  );
}
