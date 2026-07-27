import type { ReactElement } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared rating display primitives.
 *
 * Everything here renders values it is handed — there is no default star
 * value and no fallback average. A product with no reviews renders an honest
 * empty state, never "0.0 ★★★★★".
 *
 * Accessibility model: the five star glyphs are decoration. A single wrapper
 * carries `role="img"` plus a Bangla `aria-label`, so a screen reader
 * announces "৫ এর মধ্যে ৪.৫ রেটিং" once instead of five separate icons.
 */

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

/** Latin → Bangla digits, for storefront copy that is Bangla-first. */
export function toBnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/** One-decimal average in Bangla digits: 4.5 → "৪.৫". */
export function formatBnAverage(average: number): string {
  return toBnDigits(average.toFixed(1));
}

/** "৫ এর মধ্যে ৪.৫ রেটিং" — the single announced string for a star row. */
export function ratingAriaLabel(average: number): string {
  return `৫ এর মধ্যে ${formatBnAverage(average)} রেটিং`;
}

/** Bangla long date. Actions always hand us a valid ISO string. */
export function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STAR_SIZES = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
} as const;

export type RatingStarSize = keyof typeof STAR_SIZES;

const STAR_INDEXES = [0, 1, 2, 3, 4] as const;

export interface RatingStarsProps {
  /** 0–5; fractional values render a partially filled star. */
  value: number;
  size?: RatingStarSize;
  className?: string;
  /** Overrides the generated aria-label. Ignored when `decorative`. */
  label?: string;
  /** Set when a labelled ancestor already announces the rating. */
  decorative?: boolean;
}

export function RatingStars({
  value,
  size = "md",
  className,
  label,
  decorative = false,
}: RatingStarsProps): ReactElement {
  const clamped = Math.max(0, Math.min(5, value));
  const fillPercent = (clamped / 5) * 100;
  const starClass = STAR_SIZES[size];

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : (label ?? ratingAriaLabel(clamped))}
      className={cn("relative inline-flex shrink-0 align-middle", className)}
    >
      <span className="flex" aria-hidden>
        {STAR_INDEXES.map((index) => (
          <Star key={index} className={cn(starClass, "shrink-0 text-slate-300")} />
        ))}
      </span>
      {/* Clipped overlay gives a real partial star without a second glyph set. */}
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
        aria-hidden
      >
        <span className="flex h-full items-center">
          {STAR_INDEXES.map((index) => (
            <Star key={index} className={cn(starClass, "shrink-0 fill-amber-400 text-amber-400")} />
          ))}
        </span>
      </span>
    </span>
  );
}

export interface CompactRatingProps {
  /** Real average from published reviews. */
  average: number;
  /** Real published review count. Nothing renders when this is 0. */
  count: number;
  size?: RatingStarSize;
  className?: string;
  /** Renders as a link (e.g. "#reviews") instead of a plain span. */
  href?: string;
  /** "bare" shows just "(১২)" — for dense surfaces like product cards. */
  countLabel?: "full" | "bare";
  /** Render "এখনো কোনো রিভিউ নেই" instead of nothing when count is 0. */
  showEmpty?: boolean;
}

/**
 * Average + count in one line. Returns `null` when there are no reviews so
 * callers cannot accidentally show an invented rating.
 */
export function CompactRating({
  average,
  count,
  size = "sm",
  className,
  href,
  countLabel = "full",
  showEmpty = false,
}: CompactRatingProps): ReactElement | null {
  if (count <= 0) {
    if (!showEmpty) return null;
    return (
      <span className={cn("text-xs font-bold text-slate-500", className)}>এখনো কোনো রিভিউ নেই</span>
    );
  }

  const accessibleLabel = `${ratingAriaLabel(average)}, ${toBnDigits(count)}টি রিভিউ`;
  const visual = (
    <>
      <RatingStars value={average} size={size} decorative />
      <span aria-hidden className="font-black text-slate-900 tabular-nums">
        {formatBnAverage(average)}
      </span>
      <span aria-hidden className="font-bold text-slate-500 tabular-nums">
        {countLabel === "bare" ? `(${toBnDigits(count)})` : `(${toBnDigits(count)}টি রিভিউ)`}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${accessibleLabel} — রিভিউ দেখুন`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md text-xs transition-colors hover:text-amber-700",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
          className,
        )}
      >
        {visual}
      </Link>
    );
  }

  return (
    <span
      role="img"
      aria-label={accessibleLabel}
      className={cn("inline-flex items-center gap-1.5 text-xs", className)}
    >
      {visual}
    </span>
  );
}
