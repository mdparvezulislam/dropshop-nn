import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import {
  canTransition,
  isTerminal,
  isCancellable,
  requiresInventoryRelease,
  getHumanLabel,
  type OrderStatus,
  ORDER_STATUSES,
} from "../domain/state-machine";
import { EventBus } from "@/lib/event-bus";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import { generateUUID } from "@/lib/utils/id-utils";
import type {
  Order,
  CustomerSnapshot,
  ShippingSnapshot,
  OrderPricingSnapshot,
  OrderProfitPreview,
  OrderShippingInfo,
  OrderTimelineEntry,
  SupplierReference,
} from "../domain/order-entity";
import type { CreateOrderFromDraftInput } from "../types/validation";
import type { PaginationParams, SortParams, PaginatedResult } from "@/types";
import type { CreateManualOrderInput } from "../types/validation";

export interface OrderFilter {
  status?: OrderStatus | "all";
  type?: string;
  resellerId?: string;
  search?: string;
  paymentStatus?: string;
  courierName?: string;
  district?: string;
  dateFilter?: "today" | "yesterday" | "this_week" | "this_month";
  priority?: string;
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
        actor: input.customer.customerId
          ? {
              id: input.customer.customerId,
              name: input.customer.name,
              role: "customer",
            }
          : undefined,
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
        resellerName: input.resellerName,
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
        actor: input.customer.customerId
          ? {
              id: input.customer.customerId,
              name: input.customer.name,
              role: "customer",
            }
          : undefined,
      });

      await EventBus.publish(
        "order.created",
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: order.type,
          checkoutDraftId: order.checkoutDraftId,
          checkoutId: order.checkoutId,
          cartId: order.cartId,
          grandTotal: order.pricing.grandTotal,
          itemCount: order.items.length,
          currency: order.pricing.currency,
        },
        { source: "order" },
      );

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
        changes: [
          {
            field: "status",
            oldValue: fromStatus,
            newValue: toStatus,
          },
        ],
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

      if (requiresInventoryRelease(fromStatus) && toStatus === "cancelled") {
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

  async cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const currentStatus = order.status as OrderStatus;
    if (!isCancellable(currentStatus)) {
      throw new ValidationError(
        `Order in ${getHumanLabel(currentStatus)} status cannot be cancelled. Only ${ORDER_STATUSES.filter(
          (s) => isCancellable(s),
        )
          .map(getHumanLabel)
          .join(", ")} orders can be cancelled.`,
      );
    }

    return this.transitionStatus(orderId, "cancelled", { id: cancelledBy, role: "admin" }, reason);
  }

  async requestReturn(orderId: string, reason: string, requestedBy?: string): Promise<Order> {
    return this.transitionStatus(
      orderId,
      "return_requested",
      requestedBy ? { id: requestedBy, role: "customer" } : undefined,
      reason,
    );
  }

  async processReturn(orderId: string, initiatedBy: string): Promise<Order> {
    return this.transitionStatus(orderId, "return_initiated", { id: initiatedBy, role: "admin" });
  }

  async confirmReturn(orderId: string): Promise<Order> {
    return this.transitionStatus(orderId, "returned", { id: "system", role: "system" });
  }

  async refundOrder(orderId: string, refundAmount: number, refundedBy: string): Promise<Order> {
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

  async updateOrderPayment(input: {
    orderId: string;
    paymentStatus: string;
    advancePaid?: number;
    paymentMethod?: string;
    deliveryCharge?: number;
  }): Promise<Order> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const grandTotal = order.pricing?.grandTotal || 0;
    const advancePaid = Math.max(0, Number(input.advancePaid || 0));
    const dueAmount = input.paymentStatus === "paid" ? 0 : Math.max(0, grandTotal - advancePaid);

    const updatePayload: Record<string, any> = {
      paymentStatus: input.paymentStatus,
      advancePaid,
      dueAmount,
      "pricing.advancePaid": advancePaid,
      "pricing.dueAmount": dueAmount,
      "metadata.advancePaid": advancePaid,
      "metadata.paymentStatus": input.paymentStatus,
    };

    if (input.paymentMethod) {
      updatePayload["shipping.paymentMethod"] = input.paymentMethod;
    }
    if (input.deliveryCharge !== undefined) {
      updatePayload["shipping.deliveryCharge"] = input.deliveryCharge;
      updatePayload["shipping.deliveryFee"] = input.deliveryCharge * 100;
    }

    const updated = await this.orderRepository.update(input.orderId, updatePayload);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: input.orderId,
      eventType: "order.payment_updated",
      action: "order.payment_updated" as any,
      summary: `Payment updated: Status=${input.paymentStatus}, Advance=৳${advancePaid}, Due=৳${dueAmount}`,
    });

    return updated;
  }

  async updateOrderAddress(input: {
    orderId: string;
    customerName?: string;
    phone?: string;
    division?: string;
    district?: string;
    upazila?: string;
    address?: string;
    deliveryNote?: string;
  }): Promise<Order> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const updates: Record<string, any> = {};
    if (input.customerName) {
      updates["customer.name"] = input.customerName;
      updates["shipping.receiverName"] = input.customerName;
    }
    if (input.phone) {
      updates["customer.phone"] = input.phone;
      updates["shipping.phone"] = input.phone;
    }
    if (input.division) updates["shipping.division"] = input.division;
    if (input.district) updates["shipping.district"] = input.district;
    if (input.upazila !== undefined) updates["shipping.upazila"] = input.upazila;
    if (input.address) updates["shipping.address"] = input.address;
    if (input.deliveryNote !== undefined) updates["shipping.deliveryNote"] = input.deliveryNote;

    const updated = await this.orderRepository.update(input.orderId, updates);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: input.orderId,
      eventType: "order.updated",
      action: "order.updated" as any,
      summary: `Address updated for ${input.customerName || order.customer.name}`,
    });

    return updated;
  }

  async updateTracking(
    orderId: string,
    trackingNumber: string,
    trackingUrl?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const changes: Array<{ field: string; oldValue?: unknown; newValue?: unknown }> = [
      {
        field: "trackingNumber",
        oldValue: order.shippingInfo?.trackingNumber,
        newValue: trackingNumber,
      },
    ];
    if (trackingUrl) {
      changes.push({
        field: "trackingUrl",
        oldValue: order.shippingInfo?.trackingUrl,
        newValue: trackingUrl,
      });
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
    if (filter.paymentStatus) dbFilter["pricing.paymentStatus"] = filter.paymentStatus;
    if (filter.courierName) dbFilter["shippingInfo.courierName"] = filter.courierName;
    if (filter.district) dbFilter["shipping.district"] = filter.district;
    if (filter.priority) dbFilter.priority = filter.priority;

    if (filter.dateFilter) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (filter.dateFilter) {
        case "today":
          dbFilter.createdAt = { $gte: startOfDay };
          break;
        case "yesterday": {
          const yesterday = new Date(startOfDay.getTime() - 86400000);
          dbFilter.createdAt = { $gte: yesterday, $lt: startOfDay };
          break;
        }
        case "this_week": {
          const weekStart = new Date(startOfDay.getTime() - startOfDay.getDay() * 86400000);
          dbFilter.createdAt = { $gte: weekStart };
          break;
        }
        case "this_month": {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dbFilter.createdAt = { $gte: monthStart };
          break;
        }
      }
    }

    if (filter.search) {
      // User input is escaped — a search string must never become a regex operator.
      const escaped = filter.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = { $regex: escaped, $options: "i" };
      dbFilter.$or = [
        { orderNumber: searchRegex },
        { "customer.name": searchRegex },
        { "customer.phone": searchRegex },
        { "shippingInfo.trackingNumber": searchRegex },
      ];
    }

    return this.orderRepository.findPaginated(dbFilter, pagination, sort);
  }

  async createManualOrder(input: CreateManualOrderInput): Promise<Order> {
    return runInTransaction(async () => {
      const subtotal = input.items.reduce(
        (sum, item) => sum + item.unitSellingPrice * item.quantity,
        0,
      );
      const grandTotal = subtotal + input.discountTotal + input.taxTotal + input.shippingCost;

      const pricingItems = input.items.map((item) => {
        const totalSelling = item.unitSellingPrice * item.quantity;
        const totalCost =
          (item.unitCostBasis ?? Math.round(item.unitSellingPrice * 0.7)) * item.quantity;
        return {
          productId: item.productId,
          variantSku: item.variantSku,
          productName: item.productName,
          quantity: item.quantity,
          unitSellingPrice: item.unitSellingPrice,
          unitCostBasis: item.unitCostBasis ?? Math.round(item.unitSellingPrice * 0.7),
          totalSellingPrice: totalSelling,
          totalCostBasis: totalCost,
          totalProfit: totalSelling - totalCost,
          marginPercent:
            totalSelling > 0 ? Math.round(((totalSelling - totalCost) / totalSelling) * 100) : 0,
          currency: item.currency ?? "BDT",
          pricingSource: item.pricingSource,
        };
      });

      const totalRevenue = pricingItems.reduce((s, i) => s + i.totalSellingPrice, 0);
      const totalCostBasis = pricingItems.reduce((s, i) => s + i.totalCostBasis, 0);

      const timelineEntry: OrderTimelineEntry = {
        id: generateUUID(),
        eventType: "order.created",
        action: "order.created",
        summary: `Manual order ${input.orderNumber} created (source: ${input.source})`,
        timestamp: new Date(),
      };

      const orderData: Partial<Order> = {
        orderNumber: input.orderNumber,
        type: input.type,
        status: "pending",
        previousStatuses: [],
        checkoutDraftId: `manual-${Date.now()}`,
        checkoutId: `manual-${Date.now()}`,
        cartId: `manual-${Date.now()}`,
        customer: input.customer,
        shipping: input.shipping,
        pricing: {
          items: pricingItems as any,
          subtotal,
          discountTotal: input.discountTotal,
          taxTotal: input.taxTotal,
          grandTotal,
          currency: "BDT",
        },
        profitPreview: {
          totalCostBasis,
          totalRevenue,
          totalProfit: totalRevenue - totalCostBasis,
          averageMargin:
            totalRevenue > 0
              ? Math.round(((totalRevenue - totalCostBasis) / totalRevenue) * 100)
              : 0,
        },
        timeline: [timelineEntry],
        source: input.source,
        note: input.note,
        items: pricingItems.map((pi, i) => ({
          id: generateUUID(),
          productId: pi.productId,
          variantSku: pi.variantSku,
          productName: pi.productName,
          quantity: pricingItems[i]?.quantity ?? pi.quantity,
          unitPrice: pi.unitSellingPrice,
          totalPrice: pi.totalSellingPrice,
          unitCost: pi.unitCostBasis,
          totalCost: pi.totalCostBasis,
          unitProfit: pi.totalProfit,
          totalProfit: pi.totalProfit,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          status: "active",
        })),
      };

      const order = await this.orderRepository.create(orderData as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: order.id,
        eventType: "order.created",
        action: "order.created",
        summary: `Manual order ${order.orderNumber} created (source: ${input.source})`,
      });

      await EventBus.publish(
        "order.created",
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: order.type,
          grandTotal: order.pricing.grandTotal,
          source: input.source,
        },
        { source: "order" },
      );

      return order;
    });
  }

  async bulkAction(
    action: string,
    orderIds: string[],
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const orderId of orderIds) {
      try {
        switch (action) {
          case "confirm":
            await this.transitionStatus(
              orderId,
              "confirmed",
              { id: "system", role: "admin" },
              "Bulk confirm",
            );
            break;
          case "pack":
            await this.transitionStatus(
              orderId,
              "packed",
              { id: "system", role: "admin" },
              "Bulk pack",
            );
            break;
          case "cancel":
            await this.cancelOrder(orderId, "Cancelled via bulk action", "system");
            break;
          default:
            failed++;
            continue;
        }
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  async getDashboardStats(): Promise<Record<string, number>> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      const { OrderModel } = await import("../repositories/order-model");
      const { CheckoutSessionRepository } = await import("@/features/checkout/repositories/checkout-repository");
      const checkoutRepo = new CheckoutSessionRepository();

      const [orderList, checkouts] = await Promise.all([
        OrderModel.find({}).select("status pricing createdAt").lean(),
        checkoutRepo.findPaginated({ type: "reseller" }, { page: 1, limit: 1000 }),
      ]);

      const checkoutList = checkouts?.items || [];

      const result: Record<string, number> = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        today: 0,
        total_cod: orderList.length + checkoutList.length,
      };

      orderList.forEach((o: any) => {
        const st = String(o.status || "pending").toLowerCase();
        if (["draft", "pending", "new", "wfp"].includes(st)) result.pending++;
        else if (["confirmed"].includes(st)) result.confirmed++;
        else if (["processing", "packed"].includes(st)) result.processing++;
        else if (["shipped", "in_courier", "ready_for_dispatch", "courier_assigned", "shipment"].includes(st)) result.shipped++;
        else if (["delivered", "completed"].includes(st)) result.delivered++;
        else if (["cancelled", "cancel"].includes(st)) result.cancelled++;
        else if (["returned", "wfr", "return_requested"].includes(st)) result.returned++;

        if (o.createdAt && new Date(o.createdAt) >= todayStart) {
          result.today++;
        }
      });

      checkoutList.forEach((c: any) => {
        const st = String(c.status || "pending").toLowerCase();
        if (["draft", "pending", "new", "wfp"].includes(st)) result.pending++;
        else if (["completed", "confirmed"].includes(st)) result.confirmed++;

        if (c.createdAt && new Date(c.createdAt) >= todayStart) {
          result.today++;
        }
      });

      return result;
    } catch {
      return {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        today: 0,
        total_cod: 0,
      };
    }
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
            await inventoryService.releaseStock(inventory.id, item.quantity, order.id);
          }
        } catch (err) {
          logger.warn("OrderService: inventory release failed for item", {
            productId: item.productId,
            error: err,
          });
        }
      }

      await EventBus.publish(
        "order.inventory_reserved",
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          action: "release",
        },
        { source: "order" },
      );
    } catch (err) {
      logger.error("OrderService: inventory release service unavailable", err);
    }
  }
}

export default OrderService;
