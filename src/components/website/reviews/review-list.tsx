import type { ReactElement } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, MessageSquare, Star } from "lucide-react";
import type { PublicReview } from "@/features/reviews/actions/review-actions";
import { cn } from "@/lib/utils/cn";
import { RatingStars, formatReviewDate, toBnDigits } from "./rating-stars";

/**
 * Server-rendered review list. Sorting and pagination are plain links driven
 * by `?rsort=` / `?rpage=`, so the whole list stays server-rendered — no
 * client fetching, no hydration cost, and every state is shareable.
 */

export type ReviewSort = "newest" | "highest" | "lowest";

const SORT_OPTIONS: ReadonlyArray<{ value: ReviewSort; label: string }> = [
  { value: "newest", label: "সাম্প্রতিক" },
  { value: "highest", label: "সর্বোচ্চ রেটিং" },
  { value: "lowest", label: "সর্বনিম্ন রেটিং" },
];

export function parseReviewSort(value: string | undefined): ReviewSort {
  return value === "highest" || value === "lowest" ? value : "newest";
}

export function parseReviewPage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 && page <= 200 ? page : 1;
}

export interface ReviewListProps {
  items: PublicReview[];
  totalCount: number;
  page: number;
  pageSize: number;
  sort: ReviewSort;
  /** Path the sort/pagination links point at, e.g. "/product/some-slug". */
  basePath: string;
  /** Unrelated query params to carry through those links. */
  preservedParams?: Record<string, string>;
  /** Fragment appended so the browser lands back on the reviews section. */
  hash?: string;
}

export function ReviewList({
  items,
  totalCount,
  page,
  pageSize,
  sort,
  basePath,
  preservedParams,
  hash = "",
}: ReviewListProps): ReactElement {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const buildHref = (next: { rsort?: ReviewSort; rpage?: number }): string => {
    const search = new URLSearchParams(preservedParams ?? {});
    const nextSort = next.rsort ?? sort;
    // Changing the sort resets to page 1 — stale page numbers surface nothing.
    const nextPage = next.rpage ?? 1;
    if (nextSort !== "newest") search.set("rsort", nextSort);
    if (nextPage > 1) search.set("rpage", String(nextPage));
    const query = search.toString();
    return `${basePath}${query ? `?${query}` : ""}${hash}`;
  };

  if (totalCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Star className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
        <p className="mt-2.5 text-sm font-black text-slate-800">এখনো কোনো রিভিউ নেই</p>
        <p className="mt-1 text-xs font-bold text-slate-500">
          ডেলিভারি সম্পন্ন হওয়া ক্রেতারাই এখানে প্রথম মতামত জানাবেন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {totalCount > 1 && (
        <nav
          aria-label="রিভিউ সাজান"
          className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5"
        >
          {SORT_OPTIONS.map((option) => {
            const active = option.value === sort;
            return (
              <Link
                key={option.value}
                href={buildHref({ rsort: option.value })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-black transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>
      )}

      <ul className="space-y-3">
        {items.map((review) => (
          <li
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <RatingStars value={review.rating} size="sm" />
              <span className="text-sm font-black text-slate-900">{review.authorName}</span>
              {/* Structurally true: a review cannot exist without a delivered order. */}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                ভেরিফায়েড ক্রয়
              </span>
              <time
                dateTime={review.createdAt}
                className="ml-auto text-[11px] font-bold text-slate-500"
              >
                {formatReviewDate(review.createdAt)}
              </time>
            </div>

            {review.title && (
              <h3 className="mt-2.5 text-sm font-black text-slate-900">{review.title}</h3>
            )}
            {review.body && (
              <p className="mt-1.5 text-sm font-medium leading-relaxed whitespace-pre-line text-slate-700">
                {review.body}
              </p>
            )}

            {review.reply && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-black text-slate-900">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                  বিক্রেতার উত্তর
                  <time
                    dateTime={review.reply.repliedAt}
                    className="ml-auto font-bold text-slate-500"
                  >
                    {formatReviewDate(review.reply.repliedAt)}
                  </time>
                </p>
                <p className="mt-1 text-xs font-medium leading-relaxed whitespace-pre-line text-slate-700">
                  {review.reply.body}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav aria-label="রিভিউ পেজিনেশন" className="flex items-center justify-center gap-2 pt-1">
          {page > 1 ? (
            <Link
              href={buildHref({ rpage: page - 1 })}
              rel="prev"
              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              আগের
            </Link>
          ) : (
            <span className="min-h-10" />
          )}
          <span className="px-2 text-xs font-black text-slate-600">
            পেজ {toBnDigits(page)} / {toBnDigits(totalPages)}
          </span>
          {page < totalPages ? (
            <Link
              href={buildHref({ rpage: page + 1 })}
              rel="next"
              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              পরের
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : (
            <span className="min-h-10" />
          )}
        </nav>
      )}
    </div>
  );
}
