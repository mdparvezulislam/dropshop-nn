import type { ReactElement } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { listProductQuestionsAction } from "@/features/reviews/actions/review-actions";
import { formatReviewDate } from "./rating-stars";

/**
 * Product Q&A — empty-safe by design.
 *
 * `listProductQuestionsAction` returns `[]` while PRODUCT_QA_ENABLED is off,
 * so this renders nothing at all rather than an empty "Questions" shell that
 * implies a feature the storefront does not have yet.
 */
export async function ProductQuestions({
  productId,
}: {
  productId: string;
}): Promise<ReactElement | null> {
  const result = await listProductQuestionsAction(productId);
  if (!result.success || result.data.length === 0) return null;

  return (
    <section aria-labelledby="product-qa-heading" className="mt-8">
      <h2 id="product-qa-heading" className="text-base font-black text-slate-900">
        প্রশ্ন ও উত্তর
      </h2>
      <ul className="mt-3 space-y-3">
        {result.data.map((question) => (
          <li
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
          >
            <p className="flex items-start gap-2 text-sm font-black text-slate-900">
              <MessageCircleQuestion
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                aria-hidden
              />
              {question.body}
            </p>
            <p className="mt-1 text-[11px] font-bold text-slate-500">
              {question.authorName} • {formatReviewDate(question.createdAt)}
            </p>
            {question.answer && (
              <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium leading-relaxed whitespace-pre-line text-slate-700">
                  {question.answer.body}
                </p>
                <p className="mt-1 text-[11px] font-bold text-slate-500">
                  {question.answer.answeredByName ?? "DropshopNN"} •{" "}
                  {formatReviewDate(question.answer.answeredAt)}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
