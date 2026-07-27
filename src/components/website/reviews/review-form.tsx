"use client";

import { useId, useState, useTransition, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  createReviewAction,
  updateMyReviewAction,
} from "@/features/reviews/actions/review-actions";
import { Button } from "@/components/ui/button";
import { toBnDigits } from "./rating-stars";

/**
 * Review composer.
 *
 * The order a review belongs to is never typed by the customer: create mode
 * only accepts a `productId` + `orderId` pair lifted from a `ReviewableItem`
 * (delivered, owned, unreviewed). The server re-verifies both, this just keeps
 * the UI from ever offering an unverifiable path.
 */

const TITLE_MAX = 120;
const BODY_MAX = 4000;

const RATING_WORDS: Readonly<Record<number, string>> = {
  1: "খুব খারাপ",
  2: "খারাপ",
  3: "মোটামুটি",
  4: "ভালো",
  5: "চমৎকার",
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

interface SharedProps {
  /** Shown above the form so the customer knows what they are rating. */
  productName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export type ReviewFormProps = SharedProps &
  (
    | {
        mode: "create";
        productId: string;
        /** Always from a ReviewableItem — never user input. */
        orderId: string;
        variantSku?: string;
      }
    | {
        mode: "edit";
        reviewId: string;
        initial: { rating: number; title?: string; body?: string };
      }
  );

export function ReviewForm(props: ReviewFormProps): ReactElement {
  const { productName, onSuccess, onCancel, className } = props;
  const router = useRouter();
  const fieldId = useId();
  const isEdit = props.mode === "edit";

  const [rating, setRating] = useState<number>(isEdit ? props.initial.rating : 0);
  const [title, setTitle] = useState<string>(isEdit ? (props.initial.title ?? "") : "");
  const [body, setBody] = useState<string>(isEdit ? (props.initial.body ?? "") : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (rating < 1) {
      setError("অনুগ্রহ করে ১ থেকে ৫ এর মধ্যে রেটিং নির্বাচন করুন।");
      return;
    }
    setError(null);

    startTransition(async () => {
      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();

      const result = isEdit
        ? await updateMyReviewAction(props.reviewId, {
            rating,
            // Edit mode sends the literal value so a cleared field really clears.
            title: trimmedTitle,
            body: trimmedBody,
          })
        : await createReviewAction({
            productId: props.productId,
            orderId: props.orderId,
            variantSku: props.variantSku,
            rating,
            title: trimmedTitle || undefined,
            body: trimmedBody || undefined,
          });

      if (result.success) {
        toast.success(isEdit ? "রিভিউ আপডেট হয়েছে" : "আপনার রিভিউ জমা হয়েছে। ধন্যবাদ!");
        onSuccess?.();
        router.refresh();
        return;
      }

      setError(result.error);
      toast.error(result.error);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5", className)}
    >
      {productName && (
        <p className="text-xs font-bold text-slate-500">
          রিভিউ দিচ্ছেন: <span className="font-black text-slate-900">{productName}</span>
        </p>
      )}

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-black text-slate-900">
          রেটিং <span className="text-red-600">*</span>
        </legend>
        <div
          role="radiogroup"
          aria-label="৫ এর মধ্যে রেটিং নির্বাচন করুন"
          aria-required="true"
          className="flex items-center gap-0.5"
        >
          {STAR_VALUES.map((value) => (
            <label
              key={value}
              className="relative cursor-pointer"
              title={`${toBnDigits(value)} — ${RATING_WORDS[value]}`}
            >
              <input
                type="radio"
                name={`rating-${fieldId}`}
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                disabled={pending}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                  "hover:bg-amber-50",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-500",
                )}
              >
                <Star
                  aria-hidden
                  className={cn(
                    "h-6 w-6 transition-colors",
                    value <= rating ? "fill-amber-400 text-amber-500" : "text-slate-300",
                  )}
                />
              </span>
              <span className="sr-only">
                {toBnDigits(value)} স্টার — {RATING_WORDS[value]}
              </span>
            </label>
          ))}
          {rating > 0 && (
            <span aria-hidden className="ml-2 text-xs font-black text-slate-700">
              {RATING_WORDS[rating]}
            </span>
          )}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-title`} className="block text-xs font-black text-slate-900">
          শিরোনাম <span className="font-bold text-slate-500">(ঐচ্ছিক)</span>
        </label>
        <input
          id={`${fieldId}-title`}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={TITLE_MAX}
          disabled={pending}
          aria-describedby={`${fieldId}-title-count`}
          placeholder="এক লাইনে আপনার অভিজ্ঞতা"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 disabled:opacity-60"
        />
        <p
          id={`${fieldId}-title-count`}
          className="text-right text-[11px] font-bold text-slate-500"
        >
          {toBnDigits(title.length)} / {toBnDigits(TITLE_MAX)}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-body`} className="block text-xs font-black text-slate-900">
          বিস্তারিত <span className="font-bold text-slate-500">(ঐচ্ছিক)</span>
        </label>
        <textarea
          id={`${fieldId}-body`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={BODY_MAX}
          rows={5}
          disabled={pending}
          aria-describedby={`${fieldId}-body-count`}
          placeholder="প্রোডাক্টের মান, ডেলিভারি ও ব্যবহারের অভিজ্ঞতা লিখুন"
          className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium leading-relaxed text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 disabled:opacity-60"
        />
        <p id={`${fieldId}-body-count`} className="text-right text-[11px] font-bold text-slate-500">
          {toBnDigits(body.length)} / {toBnDigits(BODY_MAX)}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          loading={pending}
          disabled={pending}
          className="min-h-11 flex-1 bg-amber-500 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-600 sm:flex-initial sm:px-6"
        >
          {isEdit ? "আপডেট করুন" : "রিভিউ জমা দিন"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
            className="min-h-11 text-xs font-black"
          >
            বাতিল
          </Button>
        )}
      </div>
    </form>
  );
}
