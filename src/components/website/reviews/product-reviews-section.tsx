import type { ReactElement } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  getProductRatingAction,
  listProductReviewsAction,
} from "@/features/reviews/actions/review-actions";
import { RatingSummary } from "./rating-summary";
import { ProductQuestions } from "./product-questions";
import { ReviewList, parseReviewPage, parseReviewSort } from "./review-list";

/**
 * PDP reviews block. Streamed behind a <Suspense> on the product page so the
 * hero never waits on review aggregation.
 *
 * Sort/page state lives in `?rsort=` / `?rpage=` and is read here rather than
 * in the page, keeping the rest of the PDP out of the dynamic path.
 */

const REVIEWS_PER_PAGE = 10;

/** Review params we own; everything else on the URL is preserved verbatim. */
const OWNED_PARAMS = new Set(["rsort", "rpage"]);

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export interface ProductReviewsSectionProps {
  productId: string;
  /** Used to build sort/pagination hrefs that stay on this product. */
  productSlug: string;
  searchParams: Promise<RawSearchParams>;
}

export async function ProductReviewsSection({
  productId,
  productSlug,
  searchParams,
}: ProductReviewsSectionProps): Promise<ReactElement> {
  const params = await searchParams;
  const sort = parseReviewSort(firstValue(params.rsort));
  const page = parseReviewPage(firstValue(params.rpage));

  const preservedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (OWNED_PARAMS.has(key)) continue;
    const single = firstValue(value);
    if (single) preservedParams[key] = single;
  }

  const [ratingResult, listResult] = await Promise.all([
    getProductRatingAction(productId),
    listProductReviewsAction({ productId, page, limit: REVIEWS_PER_PAGE, sort }),
  ]);

  const summary = ratingResult.success ? ratingResult.data : null;
  const list = listResult.success ? listResult.data : null;

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="scroll-mt-24 border-t border-slate-200 pt-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="reviews-heading" className="text-lg font-black text-slate-900 sm:text-xl">
            রেটিং ও রিভিউ
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            শুধু ডেলিভারি সম্পন্ন অর্ডারের ক্রেতারাই রিভিউ দিতে পারেন।
          </p>
        </div>
        <Link
          href="/account/reviews"
          className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-black text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          রিভিউ লিখুন
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-6">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {summary ? (
            <RatingSummary summary={summary} />
          ) : (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800"
            >
              {ratingResult.success ? "" : ratingResult.error}
            </p>
          )}
        </div>

        <div className="min-w-0">
          {list ? (
            <ReviewList
              items={list.items}
              totalCount={list.totalCount}
              page={page}
              pageSize={REVIEWS_PER_PAGE}
              sort={sort}
              basePath={`/product/${productSlug}`}
              preservedParams={preservedParams}
              hash="#reviews"
            />
          ) : (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800"
            >
              {listResult.success ? "" : listResult.error}
            </p>
          )}
        </div>
      </div>

      <ProductQuestions productId={productId} />
    </section>
  );
}

export function ProductReviewsSkeleton(): ReactElement {
  return (
    <div className="border-t border-slate-200 pt-8" aria-hidden>
      <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-6">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
