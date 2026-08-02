import { BaseRepository } from "@/lib/database/generic-repository";
import { OrderModel } from "./order-model";
import type {
  Order,
  OrderTimelineEntry,
  OrderItem,
  CustomerSnapshot,
  ShippingSnapshot,
  OrderPricingSnapshot,
  OrderProfitPreview,
  OrderShippingInfo,
  SupplierReference,
} from "../domain/order-entity";
import type { OrderStatus } from "../domain/state-machine";
import type { BaseDocument } from "@/lib/database/types";
import type { PaginationParams, SortParams, PaginatedResult } from "@/types";

export interface OrderDocument extends BaseDocument {
  orderNumber: string;
  type: string;
  status: string;
  previousStatuses: string[];
  checkoutDraftId: string;
  checkoutId: string;
  cartId: string;
  customer: CustomerSnapshot;
  shipping: ShippingSnapshot;
  pricing: OrderPricingSnapshot;
  profitPreview?: OrderProfitPreview;
  shippingInfo?: OrderShippingInfo;
  timeline: OrderTimelineEntry[];
  items: OrderItem[];
  note?: string;
  internalNote?: string;
  tags?: string[];
  supplierReferences?: SupplierReference[];
  source?: string;
  autoConfirmed?: boolean;
  resellerId?: string;
  resellerName?: string;
  resellerShopName?: string;
  wholesaleId?: string;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  returnedAt?: Date;
  refundedAt?: Date;
  failedAt?: Date;
  expiresAt?: Date;
}

function toDomain(doc: any): Order {
  return {
    id: doc.id ?? doc._id.toString(),
    orderNumber: doc.orderNumber,
    type: doc.type,
    status: doc.status ?? "draft",
    previousStatuses: doc.previousStatuses || [],
    priority: doc.priority ?? "normal",
    checkoutDraftId: doc.checkoutDraftId,
    checkoutId: doc.checkoutId,
    cartId: doc.cartId,
    customer: doc.customer,
    shipping: doc.shipping,
    pricing: doc.pricing,
    profitPreview: doc.profitPreview,
    shippingInfo: doc.shippingInfo,
    timeline: doc.timeline || [],
    items: doc.items || [],
    note: doc.note,
    internalNote: doc.internalNote,
    tags: doc.tags,
    supplierReferences: doc.supplierReferences,
    source: doc.source,
    autoConfirmed: doc.autoConfirmed,
    resellerId: doc.resellerId,
    resellerName: doc.resellerName,
    resellerShopName: doc.resellerShopName || doc.resellerStoreName || doc.storeName || doc.shopName || doc.metadata?.resellerShopName || doc.metadata?.storeName,
    wholesaleId: doc.wholesaleId,
    confirmedAt: doc.confirmedAt,
    completedAt: doc.completedAt,
    cancelledAt: doc.cancelledAt,
    returnedAt: doc.returnedAt,
    refundedAt: doc.refundedAt,
    failedAt: doc.failedAt,
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

export class OrderRepository extends BaseRepository<OrderDocument, Order> {
  constructor() {
    super(OrderModel as any, toDomain);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.findOne({ orderNumber });
  }

  async findByCheckoutDraft(draftId: string): Promise<Order | null> {
    return this.findOne({ checkoutDraftId: draftId });
  }

  async findByStatus(
    status: OrderStatus,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Order>> {
    return this.findPaginated({ status }, pagination, sort);
  }

  async findByReseller(
    resellerId: string,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Order>> {
    return this.findPaginated({ resellerId }, pagination, sort);
  }

  async findByType(
    type: string,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Order>> {
    return this.findPaginated({ type }, pagination, sort);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, { status } as any);
  }

  async addTimelineEntry(id: string, entry: OrderTimelineEntry): Promise<Order> {
    return this.update(id, {
      $push: { timeline: entry },
    } as any);
  }

  async pushTimelineEntry(id: string, entry: OrderTimelineEntry): Promise<Order> {
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { $push: { timeline: entry } },
      { new: true, returnDocument: "after" },
    );
    if (!doc) {
      return this.updateStatus(id, "draft");
    }
    return toDomain(doc);
  }

  async findInStatuses(statuses: OrderStatus[]): Promise<Order[]> {
    return this.find({ status: { $in: statuses } });
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await OrderModel.aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default OrderRepository;
