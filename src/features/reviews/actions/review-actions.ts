"use server";

import { cache } from "react";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ReviewService, type ReviewableItem } from "../services/review-service";
import { ProductQuestionRepository } from "../repositories/review-repository";
import type { ProductRatingSummary } from "../domain/review-entity";
import { PRODUCT_QA_ENABLED } from "@/config/site";
import { logger } from "@/lib/utils/logger";

/**
 * Public review actions. Ratings and review content are always real: they can
 * only originate from a delivered order owned by the reviewer (enforced in
 * ReviewService). Output is allow-listed — no userId/orderId/moderation
 * internals reach the client.
 */

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id");

const createReviewSchema = z.object({
  productId: objectId,
  orderId: objectId,
  variantSku: z.string().trim().min(1).max(80).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  body: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const listSchema = z.object({
  productId: objectId,
  page: z.coerce.number().int().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.enum(["newest", "highest", "lowest"]).optional(),
});

export interface PublicReview {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  authorName: string;
  createdAt: string;
  /** Always true: reviews cannot exist without a matching delivered order. */
  verifiedPurchase: true;
  reply?: { body: string; repliedAt: string };
}

export interface MyReview extends Omit<PublicReview, "verifiedPurchase"> {
  productId: string;
  orderNumber: string;
  status: string;
  verifiedPurchase: true;
}

function displayName(fullName?: string | null): string {
  const name = (fullName ?? "").trim();
  if (!name) return "একজন ক্রেতা";
  // Surname initial only — reviews are public, full names are not needed.
  const parts = name.split(/\s+/);
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

async function sessionUser(): Promise<{ id: string; name?: string; email?: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; email?: string } | undefined;
  return user?.id ? { id: user.id, name: user.name, email: user.email } : null;
}

// ── Reads (request-deduped) ──────────────────────────────────────────────

const cachedSummary = cache(async (productId: string) =>
  new ReviewService().getRatingSummary(productId),
);

export async function getProductRatingAction(
  productId: string,
): Promise<ActionResult<ProductRatingSummary>> {
  try {
    const id = objectId.parse(productId);
    return { success: true, data: await cachedSummary(id) };
  } catch (error) {
    logger.error("getProductRatingAction failed", error);
    return { success: false, error: "রেটিং লোড করা যায়নি" };
  }
}

export async function listProductReviewsAction(
  input: z.input<typeof listSchema>,
): Promise<ActionResult<{ items: PublicReview[]; totalCount: number }>> {
  try {
    const parsed = listSchema.parse(input);
    const result = await new ReviewService().listForProduct(parsed.productId, {
      page: parsed.page,
      limit: parsed.limit,
      sort: parsed.sort,
    });

    return {
      success: true,
      data: {
        totalCount: result.totalCount,
        items: result.items.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          body: review.body,
          authorName: review.authorName,
          createdAt: new Date(review.createdAt ?? Date.now()).toISOString(),
          verifiedPurchase: true as const,
          reply: review.reply
            ? {
                body: review.reply.body,
                repliedAt: new Date(review.reply.repliedAt).toISOString(),
              }
            : undefined,
        })),
      },
    };
  } catch (error) {
    logger.error("listProductReviewsAction failed", error);
    return { success: false, error: "রিভিউ লোড করা যায়নি" };
  }
}

// ── Customer surface ─────────────────────────────────────────────────────

export async function getMyReviewsAction(): Promise<ActionResult<MyReview[]>> {
  try {
    const user = await sessionUser();
    if (!user) return { success: false, error: "লগইন করুন" };

    const reviews = await new ReviewService().listByUser(user.id);
    return {
      success: true,
      data: reviews.map((review) => ({
        id: review.id,
        productId: review.productId,
        orderNumber: review.orderNumber,
        rating: review.rating,
        title: review.title,
        body: review.body,
        authorName: review.authorName,
        status: review.status,
        createdAt: new Date(review.createdAt ?? Date.now()).toISOString(),
        verifiedPurchase: true as const,
        reply: review.reply
          ? { body: review.reply.body, repliedAt: new Date(review.reply.repliedAt).toISOString() }
          : undefined,
      })),
    };
  } catch (error) {
    logger.error("getMyReviewsAction failed", error);
    return { success: false, error: "রিভিউ লোড করা যায়নি" };
  }
}

/** Delivered-but-unreviewed items — the only valid inputs to createReviewAction. */
export async function getReviewableItemsAction(): Promise<ActionResult<ReviewableItem[]>> {
  try {
    const user = await sessionUser();
    if (!user) return { success: false, error: "লগইন করুন" };
    const items = await new ReviewService().listReviewableItems(user.id, user.email);
    return { success: true, data: items };
  } catch (error) {
    logger.error("getReviewableItemsAction failed", error);
    return { success: false, error: "তথ্য লোড করা যায়নি" };
  }
}

export async function createReviewAction(
  input: z.input<typeof createReviewSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await sessionUser();
    if (!user) return { success: false, error: "রিভিউ দিতে লগইন করুন" };

    const parsed = createReviewSchema.parse(input);
    const review = await new ReviewService().createReview({
      userId: user.id,
      authorName: displayName(user.name),
      authorEmail: user.email,
      orderId: parsed.orderId,
      productId: parsed.productId,
      variantSku: parsed.variantSku,
      rating: parsed.rating,
      title: parsed.title,
      body: parsed.body,
    });

    revalidatePath("/account/reviews");
    return { success: true, data: { id: review.id } };
  } catch (error) {
    logger.error("createReviewAction failed", error);
    // Service errors are customer-facing Bangla validation messages.
    const message =
      error instanceof Error && error.message && !/database|mongo/i.test(error.message)
        ? error.message
        : "রিভিউ জমা দেওয়া যায়নি";
    return { success: false, error: message };
  }
}

export async function updateMyReviewAction(
  reviewId: string,
  changes: { rating?: number; title?: string; body?: string },
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await sessionUser();
    if (!user) return { success: false, error: "লগইন করুন" };

    const id = objectId.parse(reviewId);
    const parsed = createReviewSchema
      .pick({ rating: true, title: true, body: true })
      .partial()
      .parse(changes);

    const review = await new ReviewService().updateOwnReview(id, user.id, parsed);
    revalidatePath("/account/reviews");
    return { success: true, data: { id: review.id } };
  } catch (error) {
    logger.error("updateMyReviewAction failed", error);
    return { success: false, error: "রিভিউ আপডেট করা যায়নি" };
  }
}

export async function deleteMyReviewAction(reviewId: string): Promise<ActionResult<null>> {
  try {
    const user = await sessionUser();
    if (!user) return { success: false, error: "লগইন করুন" };

    await new ReviewService().deleteOwnReview(objectId.parse(reviewId), user.id);
    revalidatePath("/account/reviews");
    return { success: true, data: null };
  } catch (error) {
    logger.error("deleteMyReviewAction failed", error);
    return { success: false, error: "রিভিউ মুছে ফেলা যায়নি" };
  }
}

// ── Product Q&A (architecture in place; disabled until enabled in config) ─

export interface PublicQuestion {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  answer?: { body: string; answeredAt: string; answeredByName?: string };
}

export async function listProductQuestionsAction(
  productId: string,
): Promise<ActionResult<PublicQuestion[]>> {
  if (!PRODUCT_QA_ENABLED) return { success: true, data: [] };
  try {
    const id = objectId.parse(productId);
    const questions = await new ProductQuestionRepository().findPublishedByProduct(id);
    return {
      success: true,
      data: questions.map((q) => ({
        id: q.id,
        body: q.body,
        authorName: q.authorName,
        createdAt: new Date(q.createdAt ?? Date.now()).toISOString(),
        answer: q.answer
          ? {
              body: q.answer.body,
              answeredAt: new Date(q.answer.answeredAt).toISOString(),
              answeredByName: q.answer.answeredByName,
            }
          : undefined,
      })),
    };
  } catch (error) {
    logger.error("listProductQuestionsAction failed", error);
    return { success: false, error: "প্রশ্ন লোড করা যায়নি" };
  }
}

export async function askProductQuestionAction(
  productId: string,
  body: string,
): Promise<ActionResult<{ id: string }>> {
  if (!PRODUCT_QA_ENABLED) {
    return { success: false, error: "এই সুবিধাটি শীঘ্রই চালু হবে" };
  }
  try {
    const user = await sessionUser();
    if (!user) return { success: false, error: "প্রশ্ন করতে লগইন করুন" };

    const id = objectId.parse(productId);
    const text = z.string().trim().min(5).max(1000).parse(body);

    const question = await new ProductQuestionRepository().create({
      productId: id,
      userId: user.id,
      authorName: displayName(user.name),
      body: text,
      // Questions are pre-moderated by design.
      status: "pending",
    } as never);

    return { success: true, data: { id: question.id } };
  } catch (error) {
    logger.error("askProductQuestionAction failed", error);
    return { success: false, error: "প্রশ্ন জমা দেওয়া যায়নি" };
  }
}
