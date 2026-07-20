import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { CartModel } from "./cart-model";
import type { Cart, CartItem } from "../domain/cart-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface CartDocument extends BaseDocument {
  type: string;
  sessionId?: string;
  userId?: string;
  resellerId?: string;
  wholesaleId?: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
  notes?: string;
  expiresAt?: Date;
  lastActivityAt: Date;
}

function toDomain(doc: any): Cart {
  return {
    id: doc.id ?? doc._id.toString(),
    type: doc.type,
    status: doc.status,
    sessionId: doc.sessionId,
    userId: doc.userId,
    resellerId: doc.resellerId,
    wholesaleId: doc.wholesaleId,
    items: doc.items || [],
    itemCount: doc.itemCount ?? 0,
    subtotal: doc.subtotal ?? 0,
    currency: doc.currency ?? "USD",
    notes: doc.notes,
    expiresAt: doc.expiresAt,
    lastActivityAt: doc.lastActivityAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class CartRepository extends BaseRepository<CartDocument, Cart> {
  constructor() {
    super(CartModel as any, toDomain);
  }

  async findActiveBySession(sessionId: string): Promise<Cart | null> {
    return this.findOne({ sessionId, status: "active" });
  }

  async findActiveByUser(userId: string): Promise<Cart | null> {
    return this.findOne({ userId, status: "active" });
  }

  async findActiveByReseller(resellerId: string): Promise<Cart | null> {
    return this.findOne({ resellerId, status: "active" });
  }

  async findAbandoned(before: Date): Promise<Cart[]> {
    return this.find({ status: "active", lastActivityAt: { $lt: before } });
  }

  async markConverted(id: string): Promise<Cart> {
    return this.update(id, { status: "converted" } as any);
  }
}

export default CartRepository;
