import { ShipmentRepository, type ShipmentFilters } from "../repositories/shipment-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import { PickupAddressRepository } from "../repositories/pickup-address-repository";
import { ChargeService } from "./charge-service";
import {
  calculateChargeableWeight,
  calculateVolumetricWeight,
  type ParcelDimensions,
  type Shipment,
  type ShipmentStatus,
  type ShipmentTimelineEntry,
} from "../domain/shipment-entity";
import {
  assertShipmentTransition,
  getShipmentStatusLabel,
  isShipmentTerminal,
  milestoneFieldForStatus,
  orderStatusForShipmentStatus,
} from "../domain/shipment-state-machine";
import { buildTrackingUrl, getCourierName, isSupportedCourier } from "../domain/courier-catalog";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { OrderService } from "@/features/order/services/order-service";
import { isValidTransition, type OrderStatus } from "@/features/order/domain/state-machine";
import type { Order } from "@/features/order/domain/order-entity";
import { EventBus } from "@/lib/event-bus/event-bus";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { generateUUID } from "@/lib/utils/id-utils";

export interface FulfillmentActor {
  id: string;
  name?: string;
  role?: string;
}

export interface PackageInput {
  /** Actual weight in grams. */
  weightGrams: number;
  dimensions?: ParcelDimensions;
  packageCount?: number;
  parcelType?: "document" | "parcel" | "liquid";
}

export interface CreateShipmentInput {
  orderId: string;
  provider: string;
  deliveryZone?: "inside_city" | "outside_city" | "sub_city" | "remote_area";
  package?: PackageInput;
  /** The courier's tracking number, when the operator already has one. */
  trackingCode?: string;
  pickupAddressId?: string;
  estimatedDeliveryDate?: Date;
  deliveryNotes?: string;
  internalNotes?: string;
}

export interface AssignCourierInput {
  shipmentId: string;
  provider: string;
  trackingCode?: string;
  consignmentId?: string;
  estimatedDeliveryDate?: Date;
}

export interface UpdatePackageInput {
  shipmentId: string;
  package: PackageInput;
  /** Recalculates the delivery/COD charge from zone + weight when true. */
  recalculateCharges?: boolean;
}

export interface FulfillmentQueueCounts {
  awaitingConfirmation: number;
  readyToPack: number;
  readyToShip: number;
  inTransit: number;
  delayed: number;
  returned: number;
}

export interface ShipmentStatistics {
  total: number;
  byStatus: Record<string, number>;
  byProvider: Array<{ provider: string; providerName: string; count: number; delivered: number }>;
  delivered: number;
  inCustody: number;
  returned: number;
  /** Percentage, 1 decimal. `null` when nothing has reached a terminal state yet. */
  deliverySuccessRate: number | null;
}

/** A shipment counts as delayed after this long without any status movement. */
export const DELAYED_SHIPMENT_HOURS = 72;

const ACTIVE_CUSTODY_STATUSES: ShipmentStatus[] = [
  "booked",
  "pickup_requested",
  "picked_up",
  "in_transit",
  "hub_received",
  "out_for_delivery",
  "failed",
];

/**
 * The single fulfillment orchestrator.
 *
 * Everything that moves a parcel goes through here: shipment creation, courier
 * assignment, package data, status transitions and the order-side sync. There
 * is deliberately no second path — the previous `CourierService` duplicated
 * this logic against the same collection and wrote a status (`created`) that
 * the schema did not even allow, so every shipment it produced was rejected.
 *
 * Two rules this service exists to enforce:
 *  1. A shipment status only moves along an edge the shipment state machine
 *     allows, and the order only follows when the ORDER state machine allows
 *     that edge too. The shipment can never force an illegal order state.
 *  2. Nothing courier-side is invented. No tracking number, consignment id or
 *     delivery scan is written unless a human or a real courier supplied it.
 */
export class FulfillmentService {
  private readonly shipments: ShipmentRepository;
  private readonly orders: OrderRepository;
  private readonly orderService: OrderService;
  private readonly audit: LogisticsAuditRepository;
  private readonly pickupAddresses: PickupAddressRepository;
  private readonly charges: ChargeService;

  constructor() {
    this.shipments = new ShipmentRepository();
    this.orders = new OrderRepository();
    this.orderService = new OrderService();
    this.audit = new LogisticsAuditRepository();
    this.pickupAddresses = new PickupAddressRepository();
    this.charges = new ChargeService();
  }

  // ── Creation ───────────────────────────────────────────────────────────

  /**
   * Creates the shipment for an order. The order must be past confirmation —
   * a shipment for an unconfirmed order is how stock leaves the building for a
   * sale that was never agreed.
   */
  async createShipment(input: CreateShipmentInput, actor: FulfillmentActor): Promise<Shipment> {
    if (!isSupportedCourier(input.provider)) {
      throw new ValidationError(`Unknown courier: ${input.provider}`);
    }

    const order = await this.orders.findById(input.orderId);
    if (!order) throw new NotFoundError("Order not found");

    const shippableFrom: OrderStatus[] = [
      "confirmed",
      "picking",
      "packed",
      "ready_for_dispatch",
      "courier_assigned",
      "shipped",
    ];
    if (!shippableFrom.includes(order.status)) {
      throw new ValidationError(
        `Order ${order.orderNumber} is ${order.status} — confirm and pack it before creating a shipment.`,
      );
    }

    const existing = await this.shipments.findLatestByOrderId(order.id);
    if (existing && !isShipmentTerminal(existing.status)) {
      throw new ConflictError(
        `Shipment ${existing.shipmentNumber} is already active for this order.`,
      );
    }

    const zone = input.deliveryZone ?? this.inferDeliveryZone(order);
    const pkg = this.normalizePackage(input.package);
    const charge = await this.charges.calculateCharges({
      deliveryZone: zone,
      parcelWeight: pkg.chargeableWeight,
      codAmount: order.pricing.grandTotal,
    });

    const pickupAddressId =
      input.pickupAddressId ?? (await this.pickupAddresses.findDefaultAddress())?.id;

    const trackingCode = input.trackingCode?.trim() || undefined;
    const shipmentNumber = await this.nextShipmentNumber();

    const history: ShipmentTimelineEntry[] = [
      {
        status: "draft",
        timestamp: new Date(),
        message: `Shipment created for order ${order.orderNumber} via ${getCourierName(input.provider)}`,
        actorId: actor.id,
      },
    ];

    const shipment = await this.shipments.create({
      shipmentNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      provider: input.provider.toLowerCase(),
      status: "draft",
      trackingCode,
      trackingUrl: buildTrackingUrl(input.provider, trackingCode),
      deliveryZone: zone,
      parcelType: pkg.parcelType,
      parcelWeight: pkg.weightGrams,
      dimensions: pkg.dimensions,
      volumetricWeight: pkg.volumetricWeight,
      chargeableWeight: pkg.chargeableWeight,
      packageCount: pkg.packageCount,
      codAmount: order.shipping.paymentMethod === "cod" ? order.pricing.grandTotal : 0,
      declaredValue: order.pricing.grandTotal,
      deliveryCharge: charge.deliveryCharge,
      codCharge: charge.codCharge,
      recipient: {
        name: order.shipping.receiverName,
        phone: order.shipping.phone,
        alternativePhone: order.shipping.alternativePhone,
        address: order.shipping.address,
        district: order.shipping.district,
        // Couriers require a non-empty area. Checkout collects district + full
        // address only, so the district stands in — the street address carries
        // the thana either way.
        area: order.shipping.upazila || order.shipping.area || order.shipping.district,
      },
      pickupAddressId,
      estimatedDeliveryDate: input.estimatedDeliveryDate,
      deliveryNotes: input.deliveryNotes,
      internalNotes: input.internalNotes,
      retryCount: 0,
      history,
    } as Partial<Shipment>);

    await this.audit.create({
      referenceNumber: shipmentNumber,
      shipmentId: shipment.id,
      orderId: order.id,
      provider: shipment.provider,
      action: "shipment_created",
      actorId: actor.id,
      newStatus: "draft",
      reason: `Shipment created for order ${order.orderNumber}`,
    } as never);

    await this.appendOrderTimeline(order, {
      eventType: "order.shipment_created",
      action: "order.shipment_created",
      summary: `Shipment ${shipmentNumber} created — ${getCourierName(shipment.provider)}`,
      actor,
      changes: [{ field: "shipmentNumber", newValue: shipmentNumber }],
    });

    await EventBus.publish(
      "courier.shipment_created",
      {
        shipmentId: shipment.id,
        shipmentNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        provider: shipment.provider,
      },
      { source: "fulfillment" },
    );

    logger.info("FulfillmentService: shipment created", {
      shipmentId: shipment.id,
      orderId: order.id,
    });

    return shipment;
  }

  // ── Courier assignment ─────────────────────────────────────────────────

  /**
   * Records the courier hand-off. In manual mode the operator books in the
   * courier's own panel and enters the real tracking number here; nothing is
   * generated on their behalf.
   */
  async assignCourier(input: AssignCourierInput, actor: FulfillmentActor): Promise<Shipment> {
    if (!isSupportedCourier(input.provider)) {
      throw new ValidationError(`Unknown courier: ${input.provider}`);
    }

    const shipment = await this.requireShipment(input.shipmentId);
    if (isShipmentTerminal(shipment.status)) {
      throw new ValidationError(
        `Shipment ${shipment.shipmentNumber} is ${getShipmentStatusLabel(shipment.status)} and cannot be reassigned.`,
      );
    }

    const trackingCode = input.trackingCode?.trim() || shipment.trackingCode;
    const provider = input.provider.toLowerCase();
    const providerChanged = provider !== shipment.provider;

    const message = trackingCode
      ? `Assigned to ${getCourierName(provider)} — tracking ${trackingCode}`
      : `Assigned to ${getCourierName(provider)} — awaiting tracking number`;

    const updated = await this.shipments.update(shipment.id, {
      provider,
      trackingCode,
      consignmentId: input.consignmentId?.trim() || shipment.consignmentId,
      trackingUrl: buildTrackingUrl(provider, trackingCode),
      estimatedDeliveryDate: input.estimatedDeliveryDate ?? shipment.estimatedDeliveryDate,
      history: [
        ...shipment.history,
        { status: shipment.status, timestamp: new Date(), message, actorId: actor.id },
      ],
    } as Partial<Shipment>);

    await this.audit.create({
      referenceNumber: shipment.shipmentNumber,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      provider,
      action: providerChanged ? "courier_reassigned" : "courier_assigned",
      actorId: actor.id,
      oldStatus: shipment.status,
      newStatus: shipment.status,
      reason: message,
    } as never);

    // Mirror onto the order so /account/orders and /track-order see it.
    const order = await this.orders.findById(shipment.orderId);
    if (order) {
      await this.orders.update(order.id, {
        shippingInfo: {
          ...order.shippingInfo,
          courierId: provider,
          courierName: getCourierName(provider),
          trackingNumber: trackingCode,
          trackingUrl: buildTrackingUrl(provider, trackingCode),
          estimatedDeliveryDate:
            input.estimatedDeliveryDate ?? order.shippingInfo?.estimatedDeliveryDate,
        },
      } as Partial<Order>);

      await this.appendOrderTimeline(order, {
        eventType: "order.courier_assigned",
        action: "order.courier_assigned",
        summary: message,
        actor,
        changes: [
          {
            field: "courierName",
            oldValue: order.shippingInfo?.courierName,
            newValue: getCourierName(provider),
          },
          ...(trackingCode ? [{ field: "trackingNumber", newValue: trackingCode }] : []),
        ],
      });
    }

    await EventBus.publish(
      "courier.shipment_assigned",
      { shipmentId: shipment.id, orderId: shipment.orderId, provider, trackingCode },
      { source: "fulfillment" },
    );

    return updated;
  }

  /**
   * Attempts to book the parcel with the courier.
   *
   * With a live API adapter this stores the courier's consignment id and moves
   * the shipment to `booked`. With every provider in manual mode it instead
   * parks the shipment at `pending_booking` and returns the reason — the
   * operator books in the courier panel and records the tracking number. It
   * never invents a consignment id to make the button look like it worked.
   */
  async bookShipment(
    shipmentId: string,
    actor: FulfillmentActor,
  ): Promise<{
    shipment: Shipment;
    booked: boolean;
    requiresManualBooking: boolean;
    message: string;
  }> {
    const shipment = await this.requireShipment(shipmentId);

    if (!["draft", "pending_booking", "failed"].includes(shipment.status)) {
      throw new ValidationError(
        `Shipment ${shipment.shipmentNumber} is ${getShipmentStatusLabel(shipment.status)} and cannot be booked again.`,
      );
    }

    const adapter = CourierProviderRegistry.get(shipment.provider);
    const result = await adapter.createShipment(shipment);

    if (result.success) {
      const trackingCode = result.trackingCode ?? shipment.trackingCode;
      const message = `Booked with ${getCourierName(shipment.provider)}${
        result.consignmentId ? ` — consignment ${result.consignmentId}` : ""
      }`;

      const booked = await this.shipments.update(shipmentId, {
        status: "booked",
        consignmentId: result.consignmentId ?? result.courierReference,
        courierReference: result.courierReference,
        trackingCode,
        trackingUrl: result.trackingUrl ?? buildTrackingUrl(shipment.provider, trackingCode),
        lastSyncedAt: new Date(),
        lastFailureReason: undefined,
        history: [
          ...shipment.history,
          { status: "booked" as ShipmentStatus, timestamp: new Date(), message, actorId: actor.id },
        ],
      } as Partial<Shipment>);

      await this.audit.create({
        referenceNumber: shipment.shipmentNumber,
        shipmentId,
        orderId: shipment.orderId,
        provider: shipment.provider,
        action: "shipment_booked",
        actorId: actor.id,
        oldStatus: shipment.status,
        newStatus: "booked",
        reason: message,
      } as never);

      await this.syncOrderStatus(shipment.orderId, "booked", actor, message);
      return { shipment: booked, booked: true, requiresManualBooking: false, message };
    }

    const message =
      result.error ?? `${getCourierName(shipment.provider)} booking could not be completed.`;

    const parked =
      shipment.status === "pending_booking"
        ? await this.shipments.update(shipmentId, {
            lastFailureReason: message,
          } as Partial<Shipment>)
        : await this.shipments.update(shipmentId, {
            status: "pending_booking",
            lastFailureReason: message,
            history: [
              ...shipment.history,
              {
                status: "pending_booking" as ShipmentStatus,
                timestamp: new Date(),
                message,
                actorId: actor.id,
              },
            ],
          } as Partial<Shipment>);

    return {
      shipment: parked,
      booked: false,
      requiresManualBooking: result.requiresManualBooking ?? false,
      message,
    };
  }

  // ── Package data ───────────────────────────────────────────────────────

  async updatePackage(input: UpdatePackageInput, actor: FulfillmentActor): Promise<Shipment> {
    const shipment = await this.requireShipment(input.shipmentId);
    const pkg = this.normalizePackage(input.package);

    const patch: Partial<Shipment> = {
      parcelWeight: pkg.weightGrams,
      dimensions: pkg.dimensions,
      volumetricWeight: pkg.volumetricWeight,
      chargeableWeight: pkg.chargeableWeight,
      packageCount: pkg.packageCount,
      parcelType: pkg.parcelType,
    };

    if (input.recalculateCharges) {
      const charge = await this.charges.calculateCharges({
        deliveryZone: shipment.deliveryZone as "inside_city",
        parcelWeight: pkg.chargeableWeight,
        codAmount: shipment.codAmount,
      });
      patch.deliveryCharge = charge.deliveryCharge;
      patch.codCharge = charge.codCharge;
    }

    patch.history = [
      ...shipment.history,
      {
        status: shipment.status,
        timestamp: new Date(),
        message: `Package updated — ${pkg.packageCount} pkg, ${pkg.weightGrams}g actual / ${pkg.chargeableWeight}g chargeable`,
        actorId: actor.id,
      },
    ];

    return this.shipments.update(shipment.id, patch);
  }

  async updateNotes(
    shipmentId: string,
    notes: { deliveryNotes?: string; internalNotes?: string },
    actor: FulfillmentActor,
  ): Promise<Shipment> {
    const shipment = await this.requireShipment(shipmentId);
    const which = notes.deliveryNotes !== undefined ? "Delivery" : "Internal";
    return this.shipments.update(shipmentId, {
      ...(notes.deliveryNotes !== undefined ? { deliveryNotes: notes.deliveryNotes } : {}),
      ...(notes.internalNotes !== undefined ? { internalNotes: notes.internalNotes } : {}),
      history: [
        ...shipment.history,
        {
          status: shipment.status,
          timestamp: new Date(),
          message: `${which} note updated`,
          actorId: actor.id,
        },
      ],
    } as Partial<Shipment>);
  }

  // ── Status transitions ─────────────────────────────────────────────────

  /**
   * Moves a shipment along the state machine and drags the order with it when
   * the order's own machine permits the implied edge.
   */
  async updateShipmentStatus(
    shipmentId: string,
    toStatus: ShipmentStatus,
    actor: FulfillmentActor,
    options?: { message?: string; location?: string; nativeStatus?: string },
  ): Promise<Shipment> {
    const shipment = await this.requireShipment(shipmentId);

    if (shipment.status === toStatus) {
      return shipment;
    }

    // Throws InvalidShipmentTransitionError with a human-readable message.
    assertShipmentTransition(shipment.status, toStatus);

    if (toStatus === "picked_up" && !shipment.trackingCode) {
      throw new ValidationError(
        "Record the courier's tracking number before marking the parcel picked up.",
      );
    }

    const now = new Date();
    const message =
      options?.message?.trim() ||
      `Status updated to ${getShipmentStatusLabel(toStatus)} by ${actor.name ?? actor.role ?? "staff"}`;

    const patch: Partial<Shipment> = {
      status: toStatus,
      nativeStatus: options?.nativeStatus,
      history: [
        ...shipment.history,
        {
          status: toStatus,
          nativeStatus: options?.nativeStatus,
          timestamp: now,
          message,
          location: options?.location,
          actorId: actor.id,
        },
      ],
    };

    const milestone = milestoneFieldForStatus(toStatus);
    if (milestone) {
      (patch as Record<string, unknown>)[milestone] = now;
    }

    const updated = await this.shipments.update(shipmentId, patch);

    await this.audit.create({
      referenceNumber: shipment.shipmentNumber,
      shipmentId,
      orderId: shipment.orderId,
      provider: shipment.provider,
      action: "status_changed",
      actorId: actor.id,
      oldStatus: shipment.status,
      newStatus: toStatus,
      reason: message,
    } as never);

    await this.syncOrderStatus(shipment.orderId, toStatus, actor, message);

    await EventBus.publish(
      "courier.shipment_status_changed",
      {
        shipmentId,
        orderId: shipment.orderId,
        fromStatus: shipment.status,
        toStatus,
        trackingCode: shipment.trackingCode,
      },
      { source: "fulfillment" },
    );

    if (toStatus === "in_transit" || toStatus === "picked_up") {
      await EventBus.publish("order.shipped", {
        orderId: shipment.orderId,
        trackingNumber: shipment.trackingCode,
        customerId: shipment.recipient?.phone,
      });
    } else if (toStatus === "delivered") {
      await EventBus.publish("order.delivered", {
        orderId: shipment.orderId,
        customerId: shipment.recipient?.phone,
      });
    } else if (toStatus === "returned") {
      await EventBus.publish("order.returned", {
        orderId: shipment.orderId,
        customerId: shipment.recipient?.phone,
      });
    } else if (toStatus === "cancelled") {
      await EventBus.publish("order.cancelled", {
        orderId: shipment.orderId,
        customerId: shipment.recipient?.phone,
      });
    }

    return updated;
  }

  /**
   * Bulk status update. Each shipment is validated independently so one
   * invalid transition never rolls back the rest — the caller gets a per-id
   * report instead of an all-or-nothing failure.
   */
  async bulkUpdateStatus(
    shipmentIds: string[],
    toStatus: ShipmentStatus,
    actor: FulfillmentActor,
    message?: string,
  ): Promise<{
    updated: number;
    failed: number;
    errors: Array<{ shipmentId: string; error: string }>;
  }> {
    const errors: Array<{ shipmentId: string; error: string }> = [];
    let updated = 0;

    for (const id of shipmentIds) {
      try {
        await this.updateShipmentStatus(id, toStatus, actor, { message });
        updated++;
      } catch (error) {
        errors.push({
          shipmentId: id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { updated, failed: errors.length, errors };
  }

  async cancelShipment(
    shipmentId: string,
    reason: string,
    actor: FulfillmentActor,
  ): Promise<Shipment> {
    return this.updateShipmentStatus(shipmentId, "cancelled", actor, {
      message: `Shipment cancelled: ${reason}`,
    });
  }

  // ── Reads ──────────────────────────────────────────────────────────────

  async getShipment(shipmentId: string): Promise<Shipment | null> {
    return this.shipments.findById(shipmentId);
  }

  async getShipmentForOrder(orderId: string): Promise<Shipment | null> {
    return this.shipments.findLatestByOrderId(orderId);
  }

  async listShipments(filters: ShipmentFilters) {
    return this.shipments.findWithFilters(filters);
  }

  /**
   * Live operational counts for the fulfillment dashboard. Every number is a
   * database count — nothing is estimated or carried over from a previous run.
   */
  async getQueueCounts(): Promise<FulfillmentQueueCounts> {
    const threshold = new Date(Date.now() - DELAYED_SHIPMENT_HOURS * 3600_000);

    const [orderCounts, shipmentCounts, delayed] = await Promise.all([
      this.orders.countByStatus(),
      this.shipments.countByStatus(),
      this.shipments.countDelayed(threshold, ACTIVE_CUSTODY_STATUSES),
    ]);

    const sum = (source: Record<string, number>, keys: string[]) =>
      keys.reduce((total, key) => total + (source[key] ?? 0), 0);

    return {
      awaitingConfirmation: sum(orderCounts, ["pending"]),
      readyToPack: sum(orderCounts, ["confirmed", "picking"]),
      readyToShip: sum(orderCounts, ["packed", "ready_for_dispatch"]),
      inTransit: sum(shipmentCounts, [
        "booked",
        "pickup_requested",
        "picked_up",
        "in_transit",
        "hub_received",
        "out_for_delivery",
      ]),
      delayed,
      returned: sum(shipmentCounts, ["returned"]),
    };
  }

  async getShipmentStatistics(): Promise<ShipmentStatistics> {
    const [byStatus, byProvider] = await Promise.all([
      this.shipments.countByStatus(),
      this.shipments.countByProvider(),
    ]);

    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    const delivered = byStatus.delivered ?? 0;
    const returned = (byStatus.returned ?? 0) + (byStatus.lost ?? 0);
    const inCustody = ACTIVE_CUSTODY_STATUSES.reduce((sum, s) => sum + (byStatus[s] ?? 0), 0);

    // Rate over resolved shipments only — counting in-flight parcels as
    // failures would report a falsely low success rate every busy day.
    const resolved = delivered + returned;

    return {
      total,
      byStatus,
      byProvider: byProvider.map((p) => ({ ...p, providerName: getCourierName(p.provider) })),
      delivered,
      inCustody,
      returned,
      deliverySuccessRate: resolved > 0 ? Math.round((delivered / resolved) * 1000) / 10 : null,
    };
  }

  async getDelayedShipments(limit = 20): Promise<Shipment[]> {
    const threshold = new Date(Date.now() - DELAYED_SHIPMENT_HOURS * 3600_000);
    return this.shipments.findDelayed(threshold, ACTIVE_CUSTODY_STATUSES, limit);
  }

  // ── Internals ──────────────────────────────────────────────────────────

  private async requireShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipments.findById(shipmentId);
    if (!shipment) throw new NotFoundError("Shipment not found");
    return shipment;
  }

  private normalizePackage(input?: PackageInput): {
    weightGrams: number;
    dimensions?: ParcelDimensions;
    volumetricWeight: number;
    chargeableWeight: number;
    packageCount: number;
    parcelType: string;
  } {
    const weightGrams = Math.max(0, Math.round(input?.weightGrams ?? 500));
    const dimensions = input?.dimensions
      ? {
          length: Math.max(0, input.dimensions.length ?? 0),
          width: Math.max(0, input.dimensions.width ?? 0),
          height: Math.max(0, input.dimensions.height ?? 0),
        }
      : undefined;

    return {
      weightGrams,
      dimensions,
      volumetricWeight: calculateVolumetricWeight(dimensions),
      chargeableWeight: calculateChargeableWeight(weightGrams, dimensions),
      packageCount: Math.max(1, Math.round(input?.packageCount ?? 1)),
      parcelType: input?.parcelType ?? "parcel",
    };
  }

  /** Dhaka-city orders are the cheap zone; everything else is outside-city. */
  private inferDeliveryZone(order: Order): "inside_city" | "outside_city" {
    const district = (order.shipping.district ?? "").toLowerCase();
    const division = (order.shipping.division ?? "").toLowerCase();
    return district.includes("dhaka") || division.includes("dhaka")
      ? "inside_city"
      : "outside_city";
  }

  /**
   * Shipment numbers are sequential-ish and human-quotable. The random suffix
   * keeps two concurrent creates from colliding on the unique index; a retry
   * on collision keeps that from surfacing as a 500.
   */
  private async nextShipmentNumber(): Promise<string> {
    const stamp = new Date();
    const datePart = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(
      stamp.getDate(),
    ).padStart(2, "0")}`;

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.floor(100000 + Math.random() * 900000);
      const candidate = `SHP-${datePart}-${suffix}`;
      const existing = await this.shipments.findByShipmentNumber(candidate);
      if (!existing) return candidate;
    }
    throw new ConflictError("Could not allocate a shipment number. Try again.");
  }

  /**
   * Applies the order-side consequence of a shipment event — but only along an
   * edge the order state machine actually allows. A courier reporting
   * "delivered" on an order that was already cancelled must not resurrect it.
   */
  private async syncOrderStatus(
    orderId: string,
    shipmentStatus: ShipmentStatus,
    actor: FulfillmentActor,
    reason: string,
  ): Promise<void> {
    const target = orderStatusForShipmentStatus(shipmentStatus);
    if (!target) return;

    const order = await this.orders.findById(orderId);
    if (!order) return;
    if (order.status === target) return;

    if (!isValidTransition(order.status, target)) {
      logger.info("FulfillmentService: order status left unchanged (transition not allowed)", {
        orderId,
        orderStatus: order.status,
        shipmentStatus,
        wanted: target,
      });
      return;
    }

    try {
      await this.orderService.transitionStatus(orderId, target, actor, reason);
    } catch (error) {
      // The shipment is already saved and correct; a refused order transition
      // is logged, never thrown back at the operator as a failed status update.
      logger.warn("FulfillmentService: order status sync failed", { orderId, target, error });
    }
  }

  private async appendOrderTimeline(
    order: Order,
    entry: {
      eventType: string;
      action: string;
      summary: string;
      actor?: FulfillmentActor;
      changes?: Array<{ field: string; oldValue?: unknown; newValue?: unknown }>;
    },
  ): Promise<void> {
    try {
      const fresh = await this.orders.findById(order.id);
      if (!fresh) return;
      await this.orders.update(order.id, {
        timeline: [
          ...fresh.timeline,
          {
            id: generateUUID(),
            eventType: entry.eventType,
            action: entry.action,
            summary: entry.summary,
            actor: entry.actor,
            changes: entry.changes,
            timestamp: new Date(),
          },
        ],
      } as Partial<Order>);
    } catch (error) {
      logger.warn("FulfillmentService: could not append order timeline entry", {
        orderId: order.id,
        error,
      });
    }
  }
}

export default FulfillmentService;
