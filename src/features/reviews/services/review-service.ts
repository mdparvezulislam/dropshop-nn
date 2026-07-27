import { ReviewRepository } from "../repositories/review-repository";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { ProductRepository } from "@/features/catalog/repositories/product-repository";
import type { ProductRatingSummary, Review, ReviewStatus } from "../domain/review-entity";
import type { OrderStatus } from "@/features/order/domain/state-machine";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Review business rules:
 *  - A review requires a DELIVERED order containing the product, owned by the
 *    reviewer. Verified-purchase is therefore structural — there is no code
 *    path that produces an unverified review.
 *  - One review per (order, product, variant); the unique index is the
 *    backstop, this service gives the friendly error.
 *  - Moderation states exist from day one so hiding abuse needs no migration.
 */

/** Statuses that mean the customer actually received the goods. */
const REVIEWABLE_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set(["delivered", "completed"]);

/** New reviews are visible immediately; flip to "pending" to pre-moderate. */
const DEFAULT_REVIEW_STATUS: ReviewStatus = "published";

export interface ReviewableItem {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  variantSku?: string;
  deliveredAt: string;
}

export interface CreateReviewInput {
  userId: string;
  authorName: string;
  /** Used as a secondary ownership match for orders placed before login linkage. */
  authorEmail?: string;
  orderId: string;
  productId: string;
  variantSku?: string;
  rating: number;
  title?: string;
  body?: string;
}

export class ReviewService {
  private readonly reviews = new ReviewRepository();
  private readonly orders = new OrderRepository();
  private readonly products = new ProductRepository();

  // ── Reads ──────────────────────────────────────────────────────────────

  async getRatingSummary(productId: string): Promise<ProductRatingSummary> {
    return this.reviews.getRatingSummary(productId);
  }

  async getRatingSummaries(productIds: string[]): Promise<Map<string, ProductRatingSummary>> {
    return this.reviews.getRatingSummaries(productIds);
  }

  async listForProduct(
    productId: string,
    options: { page?: number; limit?: number; sort?: "newest" | "highest" | "lowest" } = {},
  ): Promise<{ items: Review[]; totalCount: number }> {
    return this.reviews.findPublishedByProduct(productId, options);
  }

  async listByUser(userId: string): Promise<Review[]> {
    return this.reviews.findByUser(userId);
  }

  // ── Eligibility ────────────────────────────────────────────────────────

  /**
   * Products the user may still review: purchased, delivered, not yet reviewed.
   * Drives the "write a review" surfaces — the UI never guesses eligibility.
   */
  async listReviewableItems(userId: string, userEmail?: string): Promise<ReviewableItem[]> {
    const ownership: Record<string, unknown>[] = [{ "customer.customerId": userId }];
    if (userEmail) ownership.push({ "customer.email": userEmail });

    const result = await this.orders.findPaginated(
      { $or: ownership, status: { $in: [...REVIEWABLE_ORDER_STATUSES] } },
      { page: 1, limit: 50 },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    const orders = result.items;
    if (orders.length === 0) return [];

    const existing = await this.reviews.findByOrderIds(
      userId,
      orders.map((order) => order.id),
    );
    const reviewed = new Set(
      existing.map(
        (review) => `${review.orderId}::${review.productId}::${review.variantSku ?? ""}`,
      ),
    );

    const items: ReviewableItem[] = [];
    for (const order of orders) {
      for (const item of order.pricing.items) {
        const variantSku =
          item.variantSku && item.variantSku !== "SKU-DEFAULT" ? item.variantSku : undefined;
        const key = `${order.id}::${item.productId}::${variantSku ?? ""}`;
        if (reviewed.has(key)) continue;
        items.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          productId: item.productId,
          productName: item.productName,
          variantSku,
          deliveredAt: new Date(order.updatedAt ?? order.createdAt ?? Date.now()).toISOString(),
        });
      }
    }
    return items;
  }

  // ── Writes ─────────────────────────────────────────────────────────────

  async createReview(input: CreateReviewInput): Promise<Review> {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new ValidationError("রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে");
    }

    const order = await this.orders.findById(input.orderId);
    if (!order) throw new NotFoundError("অর্ডারটি পাওয়া যায়নি");

    // Ownership: the reviewer must own the order.
    const ownsOrder =
      order.customer.customerId === input.userId ||
      (Boolean(order.customer.email) && order.customer.email === input.authorEmail);
    if (!ownsOrder) throw new ValidationError("এই অর্ডারটি আপনার নয়");

    // Delivery: only received goods can be reviewed.
    if (!REVIEWABLE_ORDER_STATUSES.has(order.status)) {
      throw new ValidationError("ডেলিভারি সম্পন্ন হওয়ার পরে রিভিউ দেওয়া যাবে");
    }

    // The product must actually be in that order.
    const purchased = order.pricing.items.find(
      (item) =>
        item.productId === input.productId &&
        (input.variantSku ? item.variantSku === input.variantSku : true),
    );
    if (!purchased) throw new ValidationError("এই অর্ডারে প্রোডাক্টটি নেই");

    const product = await this.products.findById(input.productId);
    if (!product) throw new NotFoundError("প্রোডাক্টটি পাওয়া যায়নি");

    try {
      const review = await this.reviews.create({
        productId: input.productId,
        userId: input.userId,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        variantSku: input.variantSku,
        authorName: input.authorName,
        rating: input.rating,
        title: input.title?.trim() || undefined,
        body: input.body?.trim() || undefined,
        status: DEFAULT_REVIEW_STATUS,
      } as Partial<Review>);

      logger.info("ReviewService: review created", {
        reviewId: review.id,
        productId: input.productId,
      });
      return review;
    } catch (error) {
      // Unique index (orderId+productId+variantSku) — one review per item.
      if (error instanceof Error && /duplicate key/i.test(error.message)) {
        throw new ValidationError("আপনি ইতিমধ্যে এই প্রোডাক্টের রিভিউ দিয়েছেন");
      }
      throw error;
    }
  }

  /** Author-only edit; keeps moderation history intact. */
  async updateOwnReview(
    reviewId: string,
    userId: string,
    changes: { rating?: number; title?: string; body?: string },
  ): Promise<Review> {
    const review = await this.reviews.findById(reviewId);
    if (!review || review.userId !== userId) throw new NotFoundError("রিভিউটি পাওয়া যায়নি");

    if (changes.rating !== undefined) {
      if (!Number.isInteger(changes.rating) || changes.rating < 1 || changes.rating > 5) {
        throw new ValidationError("রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে");
      }
    }

    return this.reviews.update(reviewId, {
      ...(changes.rating !== undefined ? { rating: changes.rating } : {}),
      ...(changes.title !== undefined ? { title: changes.title.trim() || undefined } : {}),
      ...(changes.body !== undefined ? { body: changes.body.trim() || undefined } : {}),
    } as Partial<Review>);
  }

  async deleteOwnReview(reviewId: string, userId: string): Promise<boolean> {
    const review = await this.reviews.findById(reviewId);
    if (!review || review.userId !== userId) throw new NotFoundError("রিভিউটি পাওয়া যায়নি");
    return this.reviews.delete(reviewId);
  }

  /** Moderation entry point for the admin module (permission-checked upstream). */
  async moderateReview(
    reviewId: string,
    status: ReviewStatus,
    moderatorId: string,
    rejectionReason?: string,
  ): Promise<Review> {
    return this.reviews.update(reviewId, {
      status,
      moderatedAt: new Date(),
      moderatedBy: moderatorId,
      rejectionReason,
    } as Partial<Review>);
  }
}

export default ReviewService;
