"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/action-guard";
import { ReviewService } from "../services/review-service";
import { ReviewRepository } from "../repositories/review-repository";
import { ReviewModel } from "../repositories/review-model";
import type { Review, ReviewStatus } from "../domain/review-entity";
import { logger } from "@/lib/utils/logger";
import { purgeTags } from "@/lib/cache";
import { CACHE_TAGS } from "@/config/cache-tags";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id");

const listReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).max(200).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["published", "pending", "rejected", "hidden", "all"]).default("all"),
});

export interface AdminReviewItem {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  status: ReviewStatus;
  orderNumber: string;
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
  rejectionReason?: string;
}

/** List reviews for the admin moderation panel. */
export async function listReviewsForModerationAction(
  input: z.input<typeof listReviewsSchema>,
): Promise<ActionResult<{ items: AdminReviewItem[]; totalCount: number; totalPages: number }>> {
  try {
    await requirePermission("products.product.update");

    const parsed = listReviewsSchema.parse(input);
    const repo = new ReviewRepository();
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (parsed.status !== "all") {
      filter.status = parsed.status;
    }

    const result = await repo.findPaginated(
      filter,
      { page: parsed.page, limit: parsed.limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    const items: AdminReviewItem[] = (result.items as unknown as Review[]).map((review) => ({
      id: review.id,
      productId: review.productId,
      authorName: review.authorName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      status: review.status,
      orderNumber: review.orderNumber,
      createdAt: new Date(review.createdAt ?? Date.now()).toISOString(),
      moderatedAt: review.moderatedAt
        ? new Date(review.moderatedAt).toISOString()
        : undefined,
      moderatedBy: review.moderatedBy,
      rejectionReason: review.rejectionReason,
    }));

    return {
      success: true,
      data: { items, totalCount: result.totalCount, totalPages: result.totalPages },
    };
  } catch (error) {
    logger.error("listReviewsForModerationAction failed", error);
    return { success: false, error: "রিভিউ লোড করা যায়নি" };
  }
}

const moderateReviewSchema = z.object({
  reviewId: objectId,
  status: z.enum(["published", "pending", "rejected", "hidden"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

/** Moderate a review: publish, reject, hide, or reset to pending. */
export async function moderateReviewAction(
  input: z.input<typeof moderateReviewSchema>,
): Promise<ActionResult<null>> {
  try {
    const { actor } = await requirePermission("products.product.update");
    const parsed = moderateReviewSchema.parse(input);

    const service = new ReviewService();
    await service.moderateReview(parsed.reviewId, parsed.status, actor.id, parsed.rejectionReason);

    revalidatePath("/dashboard/reviews");
    purgeTags(CACHE_TAGS.REVIEWS, CACHE_TAGS.PRODUCT_REVIEWS(parsed.reviewId), CACHE_TAGS.PRODUCTS);
    return { success: true, data: null };
  } catch (error) {
    logger.error("moderateReviewAction failed", error);
    const message =
      error instanceof Error && error.message ? error.message : "রিভিউ আপডেট করা যায়নি";
    return { success: false, error: message };
  }
}

/** Get counts of reviews by status for the moderation dashboard. */
export async function getReviewCountsAction(): Promise<
  ActionResult<{ published: number; pending: number; rejected: number; hidden: number }>
> {
  try {
    await requirePermission("products.product.view");

    const rows = await ReviewModel.aggregate<{ _id: string; count: number }>([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const map = new Map<string, number>(rows.map((r: { _id: string; count: number }) => [r._id, r.count]));
    const published = map.get("published") ?? 0;
    const pending = map.get("pending") ?? 0;
    const rejected = map.get("rejected") ?? 0;
    const hidden = map.get("hidden") ?? 0;

    return { success: true, data: { published, pending, rejected, hidden } };
  } catch (error) {
    logger.error("getReviewCountsAction failed", error);
    return { success: false, error: "পরিসংখ্যান লোড করা যায়নি" };
  }
}
