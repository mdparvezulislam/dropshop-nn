import type { BaseDBEntity } from "@/lib/database/types";

/**
 * Product reviews. Every review is tied to a real delivered order item —
 * there is no path to create a review without a matching purchase, so
 * "verified purchase" is a structural guarantee, not a flag someone sets.
 */

export type ReviewStatus = "published" | "pending" | "rejected" | "hidden";

export interface Review extends BaseDBEntity {
  productId: string;
  userId: string;
  /** Order the purchase was made in — enforces one review per order item. */
  orderId: string;
  orderNumber: string;
  variantSku?: string;
  /** Display name snapshot; reviews survive profile edits/deletions. */
  authorName: string;
  /** 1–5 whole stars. */
  rating: number;
  title?: string;
  body?: string;
  /** Future: moderated review images. */
  images?: string[];
  status: ReviewStatus;
  /** Admin/seller response — architecture for a later phase. */
  reply?: {
    body: string;
    repliedAt: Date;
    repliedBy?: string;
  };
  /** Moderation trail. */
  moderatedAt?: Date;
  moderatedBy?: string;
  rejectionReason?: string;
}

export interface RatingBreakdown {
  /** Count of reviews per star value, keyed 1–5. */
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ProductRatingSummary {
  productId: string;
  /** Mean of published review ratings, rounded to 1 decimal. 0 = no reviews. */
  average: number;
  /** Number of published reviews. */
  count: number;
  breakdown: RatingBreakdown;
}

export const EMPTY_RATING_BREAKDOWN: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export function emptyRatingSummary(productId: string): ProductRatingSummary {
  return { productId, average: 0, count: 0, breakdown: { ...EMPTY_RATING_BREAKDOWN } };
}

/**
 * Product questions & answers. Modeled now so the storefront contract is
 * stable; the feature ships disabled behind PRODUCT_QA_ENABLED.
 */
export type QuestionStatus = "published" | "pending" | "rejected";

export interface ProductQuestion extends BaseDBEntity {
  productId: string;
  userId: string;
  authorName: string;
  body: string;
  status: QuestionStatus;
  answer?: {
    body: string;
    answeredAt: Date;
    answeredBy?: string;
    answeredByName?: string;
  };
}
