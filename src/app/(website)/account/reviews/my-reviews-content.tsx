"use client";

import { useState, useTransition, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, MessageSquare, PencilLine, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/website/reviews/review-form";
import {
  RatingStars,
  formatReviewDate,
  toBnDigits,
} from "@/components/website/reviews/rating-stars";
import { deleteMyReviewAction, type MyReview } from "@/features/reviews/actions/review-actions";
import type { ReviewableItem } from "@/features/reviews/services/review-service";

/**
 * Customer review hub. Two lists, both server-supplied:
 *  - items the backend says are still reviewable (delivered + unreviewed)
 *  - the reviews this customer already published
 *
 * Nothing here infers eligibility; the "write a review" form is only reachable
 * from a ReviewableItem, which already carries its verified orderId.
 */

const STATUS_LABELS: Readonly<Record<string, { label: string; className: string }>> = {
  published: { label: "প্রকাশিত", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  pending: { label: "পর্যালোচনায়", className: "border-amber-200 bg-amber-50 text-amber-800" },
  rejected: { label: "প্রত্যাখ্যাত", className: "border-red-200 bg-red-50 text-red-800" },
  hidden: { label: "লুকানো", className: "border-slate-200 bg-slate-50 text-slate-700" },
};

function StatusBadge({ status }: { status: string }): ReactElement {
  const meta = STATUS_LABELS[status] ?? {
    label: status,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

function ErrorNote({ message }: { message: string }): ReactElement {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
    >
      {message}
    </p>
  );
}

/** Stable key for a reviewable line item (an order can hold several variants). */
function itemKey(item: ReviewableItem): string {
  return `${item.orderId}:${item.productId}:${item.variantSku ?? ""}`;
}

export interface MyReviewsContentProps {
  reviews: MyReview[];
  reviewsError: string | null;
  reviewable: ReviewableItem[];
  reviewableError: string | null;
}

export function MyReviewsContent({
  reviews,
  reviewsError,
  reviewable,
  reviewableError,
}: MyReviewsContentProps): ReactElement {
  const router = useRouter();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (reviewId: string): void => {
    setDeletingId(reviewId);
    startTransition(async () => {
      const result = await deleteMyReviewAction(reviewId);
      if (result.success) {
        toast.success("রিভিউ মুছে ফেলা হয়েছে");
        setConfirmingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black text-slate-900">আমার রিভিউ</h1>
        <p className="mt-0.5 text-xs font-bold text-slate-500">
          ডেলিভারি সম্পন্ন অর্ডারের প্রোডাক্টে রিভিউ দিন, আর আগের রিভিউ যেকোনো সময় সম্পাদনা করুন।
        </p>
      </div>

      {/* ── Awaiting review ─────────────────────────────────────────────── */}
      <section aria-labelledby="awaiting-heading" className="space-y-3">
        <h2 id="awaiting-heading" className="text-sm font-black text-slate-900">
          রিভিউ দেওয়ার অপেক্ষায়
          {reviewable.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800">
              {toBnDigits(reviewable.length)}
            </span>
          )}
        </h2>

        {reviewableError ? (
          <ErrorNote message={reviewableError} />
        ) : reviewable.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <BadgeCheck className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
            <p className="mt-2.5 text-sm font-black text-slate-800">রিভিউর অপেক্ষায় কিছু নেই</p>
            <p className="mt-1 text-xs font-bold text-slate-500">
              ডেলিভারি সম্পন্ন হলে সেই প্রোডাক্টগুলো এখানে দেখা যাবে।
            </p>
            <Link
              href="/account/orders"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-black text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              আমার অর্ডার দেখুন
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviewable.map((item) => {
              const key = itemKey(item);
              const open = openItem === key;
              return (
                <li
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900">{item.productName}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                        অর্ডার <span className="font-mono">{item.orderNumber}</span>
                        {item.variantSku ? ` • ${item.variantSku}` : ""} • ডেলিভারি{" "}
                        {formatReviewDate(item.deliveredAt)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setOpenItem(open ? null : key)}
                      aria-expanded={open}
                      className="min-h-10 bg-amber-500 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-600"
                    >
                      <Star className="h-4 w-4" aria-hidden />
                      {open ? "বন্ধ করুন" : "রিভিউ লিখুন"}
                    </Button>
                  </div>

                  {open && (
                    <ReviewForm
                      mode="create"
                      productId={item.productId}
                      orderId={item.orderId}
                      variantSku={item.variantSku}
                      productName={item.productName}
                      className="mt-4 border-slate-200 bg-slate-50/60"
                      onSuccess={() => setOpenItem(null)}
                      onCancel={() => setOpenItem(null)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Published reviews ───────────────────────────────────────────── */}
      <section aria-labelledby="my-reviews-heading" className="space-y-3">
        <h2 id="my-reviews-heading" className="text-sm font-black text-slate-900">
          আমার দেওয়া রিভিউ
          {reviews.length > 0 && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700">
              {toBnDigits(reviews.length)}
            </span>
          )}
        </h2>

        {reviewsError ? (
          <ErrorNote message={reviewsError} />
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Star className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
            <p className="mt-2.5 text-sm font-black text-slate-800">এখনো কোনো রিভিউ দেননি</p>
            <p className="mt-1 text-xs font-bold text-slate-500">
              কেনাকাটার পর আপনার মতামত অন্য ক্রেতাদের সিদ্ধান্ত নিতে সাহায্য করবে।
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-amber-500 px-5 text-xs font-black text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              শপিং শুরু করুন
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => {
              const editing = editingId === review.id;
              const confirming = confirmingId === review.id;
              return (
                <li
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <RatingStars value={review.rating} size="sm" />
                    <StatusBadge status={review.status} />
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

                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">
                    অর্ডার <span className="font-mono">{review.orderNumber}</span>
                  </p>

                  {editing ? (
                    <ReviewForm
                      mode="edit"
                      reviewId={review.id}
                      initial={{
                        rating: review.rating,
                        title: review.title,
                        body: review.body,
                      }}
                      className="mt-3 border-slate-200 bg-slate-50/60"
                      onSuccess={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      {review.title && (
                        <h3 className="mt-2 text-sm font-black text-slate-900">{review.title}</h3>
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

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(review.id);
                            setConfirmingId(null);
                          }}
                          className="min-h-10 text-xs font-black"
                        >
                          <PencilLine className="h-4 w-4" aria-hidden />
                          সম্পাদনা
                        </Button>

                        {confirming ? (
                          <div
                            role="group"
                            aria-label="রিভিউ মুছে ফেলার নিশ্চিতকরণ"
                            className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5"
                          >
                            <span className="text-xs font-black text-red-800">
                              রিভিউটি স্থায়ীভাবে মুছে যাবে। নিশ্চিত?
                            </span>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => handleDelete(review.id)}
                              loading={deletingId === review.id}
                              disabled={deletingId === review.id}
                              className="min-h-10 text-xs font-black"
                            >
                              হ্যাঁ, মুছুন
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setConfirmingId(null)}
                              disabled={deletingId === review.id}
                              className="min-h-10 text-xs font-black"
                            >
                              বাতিল
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmingId(review.id)}
                            className="min-h-10 text-xs font-black text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            মুছুন
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
