"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
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
      className="mx-auto max-w-(--content-max) px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Guides, product insights, and growth playbooks for Bangladesh commerce.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pushFilters({ search: query || undefined, page: undefined });
            }}
            placeholder="Search articles..."
            className="pl-9"
            aria-label="Search blog"
          />
        </div>
        <Button
          type="button"
          onClick={() => pushFilters({ search: query || undefined, page: undefined })}
        >
          Search
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => pushFilters({ category: undefined, page: undefined })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              !activeCategory
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => pushFilters({ category, page: undefined })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                activeCategory === category
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
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
                "rounded-full px-2.5 py-0.5 text-[11px] transition-colors",
                activeTag === tag
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground",
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {totalCount} article{totalCount === 1 ? "" : "s"}
        {activeCategory ? ` in ${activeCategory}` : ""}
        {activeTag ? ` tagged #${activeTag}` : ""}
        {initialSearch ? ` for “${initialSearch}”` : ""}
      </p>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm text-muted-foreground">No published articles found.</p>
          <Link href="/blog" className="mt-3 inline-block text-sm text-primary hover:underline">
            Clear filters
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
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => pushFilters({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
}
