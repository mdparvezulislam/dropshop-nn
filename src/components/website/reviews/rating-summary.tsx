import type { ReactElement } from "react";
import { Star } from "lucide-react";
import type { ProductRatingSummary } from "@/features/reviews/domain/review-entity";
import { cn } from "@/lib/utils/cn";
import { RatingStars, formatBnAverage, toBnDigits } from "./rating-stars";

/**
 * Average + 1–5 star distribution for a product.
 *
 * Every number comes from `ProductRatingSummary`. When `count` is 0 the
 * component says so plainly instead of drawing empty bars around a fake mean.
 */

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

export interface RatingSummaryProps {
  summary: ProductRatingSummary;
  className?: string;
}

export function RatingSummary({ summary, className }: RatingSummaryProps): ReactElement {
  if (summary.count === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xs",
          className,
        )}
      >
        <Star className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
        <p className="mt-2.5 text-sm font-black text-slate-800">এখনো কোনো রিভিউ নেই</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
          এই প্রোডাক্টটি কিনে ডেলিভারি বুঝে নেওয়ার পর আপনিই প্রথম রিভিউ দিতে পারবেন।
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6", className)}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="shrink-0 text-center sm:text-left">
          <p aria-hidden className="text-4xl font-black leading-none text-slate-900 tabular-nums">
            {formatBnAverage(summary.average)}
          </p>
          <RatingStars value={summary.average} size="lg" className="mt-2" />
          <p className="mt-1.5 text-xs font-bold text-slate-500">
            {toBnDigits(summary.count)}টি রিভিউ
          </p>
        </div>

        <ul aria-label="রেটিং বিভাজন" className="min-w-0 flex-1 space-y-1.5">
          {STAR_ROWS.map((star) => {
            const value = summary.breakdown[star];
            const percent = Math.round((value / summary.count) * 100);
            return (
              <li key={star} className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex w-8 shrink-0 items-center gap-0.5 text-xs font-black text-slate-700 tabular-nums"
                >
                  {toBnDigits(star)}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <span
                  role="img"
                  aria-label={`${toBnDigits(star)} স্টার: ${toBnDigits(value)}টি রিভিউ`}
                  className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100"
                >
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span
                  aria-hidden
                  className="w-7 shrink-0 text-right text-xs font-bold text-slate-500 tabular-nums"
                >
                  {toBnDigits(value)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
