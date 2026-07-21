import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { WishlistItemModel, type WishlistItemDocument } from "./wishlist-item-model";
import type { WishlistItem } from "../domain/wishlist-item-entity";

export class WishlistItemRepository extends BaseRepository<WishlistItemDocument, WishlistItem> {
  constructor() {
    super(WishlistItemModel, (doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      productId: doc.productId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    }));
  }

  async findByUser(userId: string): Promise<WishlistItem[]> {
    return this.find({ userId, isDeleted: { $ne: true } });
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<WishlistItem | null> {
    return this.findOne({ userId, productId, isDeleted: { $ne: true } });
  }

  async countByUser(userId: string): Promise<number> {
    return this.count({ userId, isDeleted: { $ne: true } });
  }
}
export default WishlistItemRepository;
