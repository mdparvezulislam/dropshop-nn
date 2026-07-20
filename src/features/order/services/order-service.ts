import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { canTransition, isTerminal, isCancellable, requiresInventoryRelease, getHumanLabel, type OrderStatus, ORDER_STATUSES } from "../domain/state-machine";
import { EventBus } from "@/shared/lib/event-bus";
import { ValidationError, NotFoundError, ConflictError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import { generateUUID } from "@/shared/utils/id-utils";
import type { Order, CustomerSnapshot, ShippingSnapshot, OrderPricingSnapshot, OrderProfitPreview, OrderShippingInfo, OrderTimelineEntry, SupplierReference } from "../domain/order-entity";
import type { CreateOrderFromDraftInput } from "../types/validation";
import type { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";

export interface OrderFilter {
  status?: OrderStatus | "all";
  type?: string;
  resellerId?: string;
  search?: string;
}

export class OrderService {
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async createFromDraft(input: CreateOrderFromDraftInput): Promise<Order> {
    return runInTransaction(async () => {
      logger.info("OrderService: creating order from draft", {
        draftId: input.draftId,
        orderNumber: input.orderNumber,
      });

      const existing = await this.orderRepository.findByCheckoutDraft(input.draftId);
      if (existing) {
        throw new ConflictError("Order already exists for this checkout draft");
      }

      const timelineEntry: OrderTimelineEntry = {
        id: generateUUID(),
        eventType: "order.created",
        action: "order.created",
        summary: `Order ${input.orderNumber} created from checkout draft`,
        actor: input.customer.customerId ? {
          id: input.customer.customerId,
          name: input.customer.name,
          role: "customer",
        } : undefined,
        timestamp: new Date(),
      };

      const items = input.pricing.items.map((priceItem, index) => ({
        id: generateUUID(),
        productId: priceItem.productId,
        variantSku: priceItem.variantSku,
        productName: priceItem.productName,
        quantity: priceItem.quantity,
        unitPrice: priceItem.unitSellingPrice,
        totalPrice: priceItem.totalSellingPrice,
        unitCost: priceItem.unitCostBasis,
        totalCost: priceItem.totalCostBasis,
        unitProfit: priceItem.unitSellingPrice - priceItem.unitCostBasis,
        totalProfit: priceItem.totalProfit,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        status: "active",
      }));

      const orderData: Partial<Order> = {
        orderNumber: input.orderNumber,
        type: input.type,
        status: input.autoConfirmed ? "confirmed" : "draft",
        previousStatuses: [],
        checkoutDraftId: input.draftId,
        checkoutId: input.checkoutId,
        cartId: input.cartId,
        customer: input.customer,
        shipping: input.shipping,
        pricing: input.pricing,
        profitPreview: input.profitPreview,
        timeline: [timelineEntry],
        items: items as any,
        source: input.source,
        autoConfirmed: input.autoConfirmed,
        resellerId: input.resellerId,
        wholesaleId: input.wholesaleId,
      };

    if (input.autoConfirmed) {
      (orderData as Record<string, unknown>).confirmedAt = new Date();
    }

      const order = await this.orderRepository.create(orderData as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: order.id,
        eventType: "order.created",
        action: "order.created",
        summary: `Order ${order.orderNumber} created from checkout draft`,
        actor: input.customer.customerId ? {
          id: input.customer.customerId,
          name: input.customer.name,
          role: "customer",
        } : undefined,
      });

      await EventBus.publish("order.created", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        type: order.type,
        checkoutDraftId: order.checkoutDraftId,
        checkoutId: order.checkoutId,
        cartId: order.cartId,
        grandTotal: order.pricing.grandTotal,
        itemCount: order.items.length,
        currency: order.pricing.currency,
      }, { source: "order" });

      logger.info("OrderService: order created", {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });

      return order;
    });
  }

  async transitionStatus(
    orderId: string,
    toStatus: OrderStatus,
    actor?: { id: string; name?: string; role?: string },
    reason?: string,
  ): Promise<Order> {
    return runInTransaction(async () => {
      logger.info("OrderService: transitioning status", { orderId, toStatus });

      const order = await this.orderRepository.findById(orderId);
      if (!order) throw new NotFoundError("Order not found");

      const fromStatus = order.status as OrderStatus;

      if (fromStatus === toStatus) {
        throw new ValidationError(`Order is already in ${getHumanLabel(toStatus)} status`);
      }

      canTransition(fromStatus, toStatus);

      const updates: Partial<Order> & Record<string, unknown> = {
        status: toStatus,
        previousStatuses: [...order.previousStatuses, fromStatus],
      };

      if (toStatus === "completed") updates.completedAt = new Date() as any;
      if (toStatus === "cancelled") updates.cancelledAt = new Date() as any;
      if (toStatus === "returned") updates.returnedAt = new Date() as any;
      if (toStatus === "refunded") updates.refundedAt = new Date() as any;
      if (toStatus === "failed") updates.failedAt = new Date() as any;

      const timelineEntry: OrderTimelineEntry = {
        id: generateUUID(),
        eventType: "order.status_changed",
        action: "order.status_changed",
        summary: `Status changed from ${getHumanLabel(fromStatus)} to ${getHumanLabel(toStatus)}${reason ? `: ${reason}` : ""}`,
        actor: actor,
        changes: [{
          field: "status",
          oldValue: fromStatus,
          newValue: toStatus,
        }],
        metadata: reason ? { reason } : undefined,
        timestamp: new Date(),
      };

      const timeline = [...order.timeline, timelineEntry];
      updates.timeline = timeline as any;

      const updated = await this.orderRepository.update(orderId, updates as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: orderId,
        eventType: "order.status_changed",
        action: "order.status_changed",
        summary: `Status changed from ${getHumanLabel(fromStatus)} to ${getHumanLabel(toStatus)}${reason ? `: ${reason}` : ""}`,
        fromStatus,
        toStatus,
        actor,
        changes: [{ field: "status", oldValue: fromStatus, newValue: toStatus }],
        metadata: reason ? { reason } : undefined,
      });

      await this.publishStatusEvent(order, fromStatus, toStatus, actor, reason);

      if (requiresInventoryRelease(fromStatus) && isCancellable(toStatus)) {
        await this.requestInventoryRelease(order);
      }

      logger.info("OrderService: status transitioned", {
        orderId,
        from: fromStatus,
        to: toStatus,
      });

      return updated;
    });
  }

  async cancelOrder(
    orderId: string,
    reason: string,
    cancelledBy: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const currentStatus = order.status as OrderStatus;
    if (!isCancellable(currentStatus)) {
      throw new ValidationError(
        `Order in ${getHumanLabel(currentStatus)} status cannot be cancelled. Only ${ORDER_STATUSES.filter((s) => isCancellable(s)).map(getHumanLabel).join(", ")} orders can be cancelled.`,
      );
    }

    return this.transitionStatus(
      orderId,
      "cancelled",
      { id: cancelledBy, role: "admin" },
      reason,
    );
  }

  async requestReturn(
    orderId: string,
    reason: string,
    requestedBy?: string,
  ): Promise<Order> {
    return this.transitionStatus(
      orderId,
      "return_requested",
      requestedBy ? { id: requestedBy, role: "customer" } : undefined,
      reason,
    );
  }

  async processReturn(
    orderId: string,
    initiatedBy: string,
  ): Promise<Order> {
    return this.transitionStatus(
      orderId,
      "return_initiated",
      { id: initiatedBy, role: "admin" },
    );
  }

  async confirmReturn(
    orderId: string,
  ): Promise<Order> {
    return this.transitionStatus(
      orderId,
      "returned",
      { id: "system", role: "system" },
    );
  }

  async refundOrder(
    orderId: string,
    refundAmount: number,
    refundedBy: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const refunded = await this.transitionStatus(
      orderId,
      "refunded",
      { id: refundedBy, role: "admin" },
      `Refund of ${refundAmount} cents processed`,
    );

    return refunded;
  }

  async assignCourier(
    orderId: string,
    courierId: string,
    courierName: string,
    trackingNumber?: string,
    trackingUrl?: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const withCourier = await this.transitionStatus(orderId, "courier_assigned", actor);

    const shippingInfo: OrderShippingInfo = {
      courierId,
      courierName,
      trackingNumber,
      trackingUrl,
    };

    const timelineEntry: OrderTimelineEntry = {
      id: generateUUID(),
      eventType: "order.courier_assigned",
      action: "order.courier_assigned",
      summary: `Courier assigned: ${courierName}`,
      actor,
      changes: [
        { field: "courierId", newValue: courierId },
        { field: "courierName", newValue: courierName },
        ...(trackingNumber ? [{ field: "trackingNumber" as const, newValue: trackingNumber }] : []),
      ],
      timestamp: new Date(),
    };

    return this.orderRepository.update(orderId, {
      shippingInfo: shippingInfo as any,
      timeline: [...withCourier.timeline, timelineEntry] as any,
    } as any);
  }

  async updateTracking(
    orderId: string,
    trackingNumber: string,
    trackingUrl?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const changes: Array<{ field: string; oldValue?: unknown; newValue?: unknown }> = [
      { field: "trackingNumber", oldValue: order.shippingInfo?.trackingNumber, newValue: trackingNumber },
    ];
    if (trackingUrl) {
      changes.push({ field: "trackingUrl", oldValue: order.shippingInfo?.trackingUrl, newValue: trackingUrl });
    }

    const timelineEntry: OrderTimelineEntry = {
      id: generateUUID(),
      eventType: "order.tracking_updated",
      action: "order.tracking_updated",
      summary: `Tracking updated: ${trackingNumber}`,
      changes,
      timestamp: new Date(),
    };

    return this.orderRepository.update(orderId, {
      shippingInfo: {
        ...order.shippingInfo,
        trackingNumber,
        trackingUrl: trackingUrl ?? order.shippingInfo?.trackingUrl,
      } as any,
      timeline: [...order.timeline, timelineEntry] as any,
    } as any);
  }

  async addNote(
    orderId: string,
    note: string,
    internal: boolean = false,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const field = internal ? "internalNote" : "note";

    const timelineEntry: OrderTimelineEntry = {
      id: generateUUID(),
      eventType: "order.note_added",
      action: "order.note_added",
      summary: `${internal ? "Internal" : "Public"} note added`,
      actor,
      changes: [{ field, newValue: note.substring(0, 100) }],
      metadata: { noteLength: note.length, internal },
      timestamp: new Date(),
    };

    return this.orderRepository.update(orderId, {
      [field]: note as any,
      timeline: [...order.timeline, timelineEntry] as any,
    } as any);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.orderRepository.findByOrderNumber(orderNumber);
  }

  async listOrders(
    filter: OrderFilter,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Order>> {
    const dbFilter: Record<string, unknown> = {};
    if (filter.status && filter.status !== "all") dbFilter.status = filter.status;
    if (filter.type) dbFilter.type = filter.type;
    if (filter.resellerId) dbFilter.resellerId = filter.resellerId;

    return this.orderRepository.findPaginated(dbFilter, pagination, sort);
  }

  async getStatusSummary(): Promise<Record<string, number>> {
    return this.orderRepository.countByStatus();
  }

  private async publishStatusEvent(
    order: Order,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    actor?: { id: string; name?: string; role?: string },
    reason?: string,
  ): Promise<void> {
    const basePayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
    };

    const eventMap: Record<string, { type: string; payload: Record<string, unknown> }> = {
      confirmed: {
        type: "order.confirmed",
        payload: { confirmedBy: actor?.id ?? "system" },
      },
      packed: {
        type: "order.packed",
        payload: {},
      },
      ready_for_dispatch: {
        type: "order.ready_for_dispatch",
        payload: {},
      },
      courier_assigned: {
        type: "order.courier_assigned",
        payload: {
          courierId: order.shippingInfo?.courierId ?? "",
          courierName: order.shippingInfo?.courierName ?? "",
        },
      },
      shipped: {
        type: "order.shipped",
        payload: {
          trackingNumber: order.shippingInfo?.trackingNumber ?? "",
          trackingUrl: order.shippingInfo?.trackingUrl,
        },
      },
      out_for_delivery: {
        type: "order.out_for_delivery",
        payload: {},
      },
      delivered: {
        type: "order.delivered",
        payload: { deliveredAt: new Date().toISOString() },
      },
      completed: {
        type: "order.completed",
        payload: {
          totalCostBasis: order.profitPreview?.totalCostBasis ?? 0,
          totalRevenue: order.profitPreview?.totalRevenue ?? 0,
          totalProfit: order.profitPreview?.totalProfit ?? 0,
        },
      },
      cancelled: {
        type: "order.cancelled",
        payload: {
          reason,
          cancelledBy: actor?.id ?? "system",
          inventoryReleased: requiresInventoryRelease(fromStatus),
        },
      },
      return_requested: {
        type: "order.return_requested",
        payload: { reason, requestedBy: actor?.id },
      },
      return_initiated: {
        type: "order.return_initiated",
        payload: { initiatedBy: actor?.id ?? "system" },
      },
      returned: {
        type: "order.returned",
        payload: {},
      },
      refunded: {
        type: "order.refunded",
        payload: {
          refundAmount: order.profitPreview?.totalRevenue ?? 0,
          refundedBy: actor?.id ?? "system",
        },
      },
      failed: {
        type: "order.failed",
        payload: {
          reason: reason ?? "Unknown failure",
          failedStep: fromStatus,
        },
      },
    };

    const event = eventMap[toStatus];
    if (event) {
      await EventBus.publish(event.type, { ...basePayload, ...event.payload }, { source: "order" });
    }
  }

  private async requestInventoryRelease(order: Order): Promise<void> {
    try {
      const { InventoryService } = await import("@/features/inventory/services/inventory-service");
      const inventoryService = new InventoryService();

      for (const item of order.items) {
        try {
          const inventory = await inventoryService.getInventoryByProduct(
            item.productId,
            item.variantSku,
          );
          if (inventory) {
            await inventoryService.releaseStock(
              inventory.id,
              item.quantity,
              order.id,
            );
          }
        } catch (err) {
          logger.warn("OrderService: inventory release failed for item", {
            productId: item.productId,
            error: err,
          });
        }
      }

      await EventBus.publish("order.inventory_reserved", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: "release",
      }, { source: "order" });
    } catch (err) {
      logger.error("OrderService: inventory release service unavailable", err);
    }
  }
}

export default OrderService;
