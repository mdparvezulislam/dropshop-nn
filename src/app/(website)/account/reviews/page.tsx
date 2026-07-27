import type { Metadata } from "next";
import {
  getMyReviewsAction,
  getReviewableItemsAction,
} from "@/features/reviews/actions/review-actions";
import { MyReviewsContent } from "./my-reviews-content";

export const metadata: Metadata = {
  title: "আমার রিভিউ",
  robots: { index: false },
};

/**
 * "My Reviews" — the customer's own reviews plus the delivered items they are
 * still eligible to review. Both lists come straight from the server actions;
 * an item only appears in "awaiting review" because the backend verified the
 * purchase, so the form never has to ask for an order number.
 */
export default async function MyReviewsPage() {
  const [reviewsResult, reviewableResult] = await Promise.all([
    getMyReviewsAction(),
    getReviewableItemsAction(),
  ]);

  return (
    <MyReviewsContent
      reviews={reviewsResult.success ? reviewsResult.data : []}
      reviewsError={reviewsResult.success ? null : reviewsResult.error}
      reviewable={reviewableResult.success ? reviewableResult.data : []}
      reviewableError={reviewableResult.success ? null : reviewableResult.error}
    />
  );
}
