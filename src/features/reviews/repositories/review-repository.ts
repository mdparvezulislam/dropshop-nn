import { BaseRepository } from "@/lib/database/generic-repository";
import { ReviewModel, ProductQuestionModel } from "./review-model";
import type { ReviewDocumentType, ProductQuestionDocumentType } from "./review-model";
import {
  EMPTY_RATING_BREAKDOWN,
  emptyRatingSummary,
  type ProductQuestion,
  type ProductRatingSummary,
  type RatingBreakdown,
  type Review,
} from "../domain/review-entity";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class ReviewRepository extends BaseRepository<ReviewDocumentType, Review> {
  constructor() {
    super(ReviewModel, ReviewRepository.mapToDomain);
  }

  private static mapToDomain(doc: ReviewDocumentType): Review {
    return {
      id: doc._id.toString(),
      productId: doc.productId?.toString(),
      userId: doc.userId,
      orderId: doc.orderId,
      orderNumber: doc.orderNumber,
      variantSku: doc.variantSku ?? undefined,
      authorName: doc.authorName,
      rating: doc.rating,
      title: doc.title ?? undefined,
      body: doc.body ?? undefined,
      images: doc.images ?? [],
      status: doc.status,
      reply: doc.reply
        ? {
            body: doc.reply.body,
            repliedAt: doc.reply.repliedAt,
            repliedBy: doc.reply.repliedBy ?? undefined,
          }
        : undefined,
      moderatedAt: doc.moderatedAt ?? undefined,
      moderatedBy: doc.moderatedBy ?? undefined,
      rejectionReason: doc.rejectionReason ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted ?? false,
      deletedAt: doc.deletedAt ?? undefined,
    };
  }

  /**
   * Rating summary for ONE product, computed in the database from published
   * reviews only. Never derived from anything but real review rows.
   */
  async getRatingSummary(productId: string): Promise<ProductRatingSummary> {
    const map = await this.getRatingSummaries([productId]);
    return map.get(productId) ?? emptyRatingSummary(productId);
  }

  /**
   * Batched rating summaries — one aggregation for a whole product page/grid
   * so listings never fan out into a query per card.
   */
  async getRatingSummaries(productIds: string[]): Promise<Map<string, ProductRatingSummary>> {
    const result = new Map<string, ProductRatingSummary>();
    if (productIds.length === 0) return result;

    try {
      await this.ensureConnected();
      const { Types } = await import("mongoose");
      const objectIds = productIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
      if (objectIds.length === 0) return result;

      const rows = await this.model
        .aggregate<{ _id: unknown; ratings: Array<{ rating: number; count: number }> }>([
          {
            $match: {
              productId: { $in: objectIds },
              status: "published",
              isDeleted: { $ne: true },
            },
          },
          { $group: { _id: { productId: "$productId", rating: "$rating" }, count: { $sum: 1 } } },
          {
            $group: {
              _id: "$_id.productId",
              ratings: { $push: { rating: "$_id.rating", count: "$count" } },
            },
          },
        ])
        .exec();

      for (const row of rows) {
        const productId = String(row._id);
        const breakdown: RatingBreakdown = { ...EMPTY_RATING_BREAKDOWN };
        let total = 0;
        let sum = 0;
        for (const entry of row.ratings) {
          const star = Math.min(5, Math.max(1, Math.round(entry.rating))) as 1 | 2 | 3 | 4 | 5;
          breakdown[star] += entry.count;
          total += entry.count;
          sum += star * entry.count;
        }
        result.set(productId, {
          productId,
          average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
          count: total,
          breakdown,
        });
      }

      return result;
    } catch (error) {
      logger.error("ReviewRepository getRatingSummaries failed", error);
      // Ratings are additive trust data — never break a product page over them.
      return result;
    }
  }

  async findPublishedByProduct(
    productId: string,
    options: { page?: number; limit?: number; sort?: "newest" | "highest" | "lowest" } = {},
  ): Promise<{ items: Review[]; totalCount: number }> {
    try {
      await this.ensureConnected();
      const page = Math.max(1, options.page ?? 1);
      const limit = Math.min(50, Math.max(1, options.limit ?? 10));
      const filter = { productId, status: "published", isDeleted: { $ne: true } } as any;

      const sort: Record<string, 1 | -1> =
        options.sort === "highest"
          ? { rating: -1, createdAt: -1 }
          : options.sort === "lowest"
            ? { rating: 1, createdAt: -1 }
            : { createdAt: -1 };

      const [docs, totalCount] = await Promise.all([
        this.model
          .find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      return {
        items: docs.map((doc: any) => ReviewRepository.mapToDomain(doc as ReviewDocumentType)),
        totalCount,
      };
    } catch (error) {
      logger.error("ReviewRepository findPublishedByProduct failed", error, { productId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByUser(userId: string, limit = 50): Promise<Review[]> {
    try {
      await this.ensureConnected();
      const docs = await this.model
        .find({ userId, isDeleted: { $ne: true } } as any)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();
      return docs.map((doc: any) => ReviewRepository.mapToDomain(doc as ReviewDocumentType));
    } catch (error) {
      logger.error("ReviewRepository findByUser failed", error, { userId });
      throw new DatabaseError("Database query error", error);
    }
  }

  /** Existing reviews for a set of order ids — used to hide already-reviewed items. */
  async findByOrderIds(userId: string, orderIds: string[]): Promise<Review[]> {
    if (orderIds.length === 0) return [];
    try {
      await this.ensureConnected();
      const docs = await this.model
        .find({ userId, orderId: { $in: orderIds }, isDeleted: { $ne: true } } as any)
        .lean()
        .exec();
      return docs.map((doc: any) => ReviewRepository.mapToDomain(doc as ReviewDocumentType));
    } catch (error) {
      logger.error("ReviewRepository findByOrderIds failed", error, { userId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async getStatusCounts(): Promise<{ published: number; pending: number; rejected: number; hidden: number }> {
    try {
      await this.ensureConnected();
      const rows = await this.model.aggregate<{ _id: string; count: number }>([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const map = new Map<string, number>(rows.map((r) => [r._id, r.count]));
      return {
        published: map.get("published") ?? 0,
        pending: map.get("pending") ?? 0,
        rejected: map.get("rejected") ?? 0,
        hidden: map.get("hidden") ?? 0,
      };
    } catch (error) {
      logger.error("ReviewRepository getStatusCounts failed", error);
      return { published: 0, pending: 0, rejected: 0, hidden: 0 };
    }
  }
}

export class ProductQuestionRepository extends BaseRepository<
  ProductQuestionDocumentType,
  ProductQuestion
> {
  constructor() {
    super(ProductQuestionModel, ProductQuestionRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductQuestionDocumentType): ProductQuestion {
    return {
      id: doc._id.toString(),
      productId: doc.productId?.toString(),
      userId: doc.userId,
      authorName: doc.authorName,
      body: doc.body,
      status: doc.status,
      answer: doc.answer
        ? {
            body: doc.answer.body,
            answeredAt: doc.answer.answeredAt,
            answeredBy: doc.answer.answeredBy ?? undefined,
            answeredByName: doc.answer.answeredByName ?? undefined,
          }
        : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted ?? false,
      deletedAt: doc.deletedAt ?? undefined,
    };
  }

  async findPublishedByProduct(productId: string, limit = 20): Promise<ProductQuestion[]> {
    try {
      await this.ensureConnected();
      const docs = await this.model
        .find({ productId, status: "published", isDeleted: { $ne: true } } as any)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();
      return docs.map((doc: any) =>
        ProductQuestionRepository.mapToDomain(doc as ProductQuestionDocumentType),
      );
    } catch (error) {
      logger.error("ProductQuestionRepository findPublishedByProduct failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }
}
