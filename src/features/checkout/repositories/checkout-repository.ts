import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { CheckoutSessionModel, OrderDraftModel } from "./checkout-model";
import type {
  CheckoutSession,
  CheckoutPriceItem,
  CheckoutInventoryItem,
  CheckoutShippingInfo,
  CheckoutTotals,
  CheckoutProfitPreview,
  CheckoutStep,
  OrderDraft,
} from "../domain/checkout-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface CheckoutSessionDocument extends BaseDocument {
  cartId: string;
  type: string;
  step: string;
  resolvedPrices: CheckoutPriceItem[];
  inventoryValidations: CheckoutInventoryItem[];
  inventoryReservations: CheckoutInventoryItem[];
  shipping?: CheckoutShippingInfo;
  shippingCompleted: boolean;
  totals?: CheckoutTotals;
  profitPreview?: CheckoutProfitPreview;
  draftId?: string;
  expiresAt: Date;
}

interface OrderDraftDocument extends BaseDocument {
  checkoutId: string;
  cartId: string;
  type: string;
  resolvedPrices: CheckoutPriceItem[];
  inventoryReservations: CheckoutInventoryItem[];
  shipping: CheckoutShippingInfo;
  totals: CheckoutTotals;
  profitPreview?: CheckoutProfitPreview;
}

function sessionToDomain(doc: any): CheckoutSession {
  return {
    id: doc.id ?? doc._id.toString(),
    cartId: doc.cartId,
    type: doc.type,
    step: doc.step,
    status: doc.status,
    resolvedPrices: doc.resolvedPrices || [],
    inventoryValidations: doc.inventoryValidations || [],
    inventoryReservations: doc.inventoryReservations || [],
    shipping: doc.shipping,
    shippingCompleted: doc.shippingCompleted ?? false,
    totals: doc.totals,
    profitPreview: doc.profitPreview,
    draftId: doc.draftId,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

function draftToDomain(doc: any): OrderDraft {
  return {
    id: doc.id ?? doc._id.toString(),
    checkoutId: doc.checkoutId,
    cartId: doc.cartId,
    type: doc.type,
    resolvedPrices: doc.resolvedPrices || [],
    inventoryReservations: doc.inventoryReservations || [],
    shipping: doc.shipping,
    totals: doc.totals,
    profitPreview: doc.profitPreview,
    metadata: doc.metadata,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    status: doc.status ?? "active",
  };
}

export class CheckoutSessionRepository extends BaseRepository<CheckoutSessionDocument, CheckoutSession> {
  constructor() {
    super(CheckoutSessionModel as any, sessionToDomain);
  }

  async findActiveByCart(cartId: string): Promise<CheckoutSession | null> {
    return this.findOne({ cartId, status: "active" });
  }

  async updateStep(id: string, step: CheckoutStep): Promise<CheckoutSession> {
    return this.update(id, { step } as any);
  }
}

export class OrderDraftRepository extends BaseRepository<OrderDraftDocument, OrderDraft> {
  constructor() {
    super(OrderDraftModel as any, draftToDomain);
  }
}
