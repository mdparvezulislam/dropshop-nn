"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { checkPermission, sessionActor } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { FulfillmentService } from "../services/fulfillment-service";
import { ShipmentRepository } from "../repositories/shipment-repository";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import {
  assignCourierInputSchema,
  bulkShipmentStatusSchema,
  cancelShipmentInputSchema,
  createShipmentInputSchema,
  shipmentListQuerySchema,
  toPackageInput,
  updateShipmentNotesSchema,
  updateShipmentPackageSchema,
  updateShipmentStatusSchema,
} from "../types/fulfillment-validation";
import {
  getAllowedShipmentTransitions,
  getShipmentStatusLabel,
} from "../domain/shipment-state-machine";
import { COURIER_PROVIDERS, getCourierName } from "../domain/courier-catalog";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";
import type { OrderStatus } from "@/features/order/domain/state-machine";

/**
 * Admin fulfillment actions.
 *
 * Every action is permission-checked and Zod-validated, and returns the same
 * `{ success, data?, error? }` envelope. Failures surface a message the
 * operator can act on; stack traces stay in the server log.
 */

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const shipmentIdSchema = z.object({ shipmentId: objectIdSchema });

const FULFILLMENT_PATHS = ["/dashboard/shipments", "/dashboard/orders", "/dashboard"];

function revalidateFulfillment(): void {
  for (const path of FULFILLMENT_PATHS) revalidatePath(path);
}

function failure(scope: string, error: unknown): { success: false; error: string } {
  logger.error(`${scope} failed`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Something went wrong. Try again.",
  };
}

// ── Admin DTO ────────────────────────────────────────────────────────────

export interface AdminShipmentDto {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  providerName: string;
  status: ShipmentStatus;
  statusLabel: string;
  trackingCode?: string;
  trackingUrl?: string;
  consignmentId?: string;
  deliveryZone: string;
  parcelType: string;
  /** Grams. */
  parcelWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  packageCount: number;
  dimensions?: { length: number; width: number; height: number };
  /** BDT. */
  codAmount: number;
  deliveryCharge: number;
  codCharge: number;
  recipient: {
    name: string;
    phone: string;
    address: string;
    district: string;
    area: string;
  };
  pickupDate?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  deliveryDate?: string;
  returnDate?: string;
  deliveryNotes?: string;
  internalNotes?: string;
  lastFailureReason?: string;
  createdAt?: string;
  updatedAt?: string;
  allowedTransitions: Array<{ status: ShipmentStatus; label: string }>;
  history: Array<{
    status: ShipmentStatus;
    statusLabel: string;
    message: string;
    location?: string;
    at: string;
  }>;
}

const minorToBdt = (minor: number): number => Math.round(minor) / 100;
const iso = (date?: Date): string | undefined => (date ? new Date(date).toISOString() : undefined);

function toAdminDto(shipment: Shipment): AdminShipmentDto {
  return {
    id: shipment.id,
    shipmentNumber: shipment.shipmentNumber,
    orderId: shipment.orderId,
    orderNumber: shipment.orderNumber,
    provider: shipment.provider,
    providerName: getCourierName(shipment.provider),
    status: shipment.status,
    statusLabel: getShipmentStatusLabel(shipment.status),
    trackingCode: shipment.trackingCode,
    trackingUrl: shipment.trackingUrl,
    consignmentId: shipment.consignmentId,
    deliveryZone: shipment.deliveryZone,
    parcelType: shipment.parcelType,
    parcelWeight: shipment.parcelWeight,
    volumetricWeight: shipment.volumetricWeight ?? 0,
    chargeableWeight: shipment.chargeableWeight ?? shipment.parcelWeight,
    packageCount: shipment.packageCount ?? 1,
    dimensions: shipment.dimensions
      ? {
          length: shipment.dimensions.length,
          width: shipment.dimensions.width,
          height: shipment.dimensions.height,
        }
      : undefined,
    codAmount: minorToBdt(shipment.codAmount),
    deliveryCharge: minorToBdt(shipment.deliveryCharge),
    codCharge: minorToBdt(shipment.codCharge),
    recipient: {
      name: shipment.recipient.name,
      phone: shipment.recipient.phone,
      address: shipment.recipient.address,
      district: shipment.recipient.district,
      area: shipment.recipient.area,
    },
    pickupDate: iso(shipment.pickupDate),
    dispatchDate: iso(shipment.dispatchDate),
    estimatedDeliveryDate: iso(shipment.estimatedDeliveryDate),
    deliveryDate: iso(shipment.deliveryDate),
    returnDate: iso(shipment.returnDate),
    deliveryNotes: shipment.deliveryNotes,
    internalNotes: shipment.internalNotes,
    lastFailureReason: shipment.lastFailureReason,
    createdAt: iso(shipment.createdAt),
    updatedAt: iso(shipment.updatedAt),
    allowedTransitions: getAllowedShipmentTransitions(shipment.status).map((status) => ({
      status,
      label: getShipmentStatusLabel(status),
    })),
    history: [...shipment.history]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((entry) => ({
        status: entry.status,
        statusLabel: getShipmentStatusLabel(entry.status),
        message: entry.message,
        location: entry.location,
        at: new Date(entry.timestamp).toISOString(),
      })),
  };
}

// ── Reads ────────────────────────────────────────────────────────────────

export interface ShipmentListResult {
  items: AdminShipmentDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listShipmentsAction(
  query: unknown = {},
): Promise<ActionResult<ShipmentListResult>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.View");

    const filters = shipmentListQuerySchema.parse(query);
    const page = await new FulfillmentService().listShipments(filters);

    return {
      success: true,
      data: {
        items: page.items.map(toAdminDto),
        total: page.total,
        page: page.page,
        limit: page.limit,
        totalPages: page.totalPages,
      },
    };
  } catch (error) {
    return failure("listShipmentsAction", error);
  }
}

export async function getShipmentAction(
  shipmentId: string,
): Promise<ActionResult<AdminShipmentDto | null>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.View");

    const id = objectIdSchema.parse(shipmentId);
    const shipment = await new FulfillmentService().getShipment(id);
    return { success: true, data: shipment ? toAdminDto(shipment) : null };
  } catch (error) {
    return failure("getShipmentAction", error);
  }
}

export async function getShipmentForOrderAction(
  orderId: string,
): Promise<ActionResult<AdminShipmentDto | null>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.View");

    const id = objectIdSchema.parse(orderId);
    const shipment = await new FulfillmentService().getShipmentForOrder(id);
    return { success: true, data: shipment ? toAdminDto(shipment) : null };
  } catch (error) {
    return failure("getShipmentForOrderAction", error);
  }
}

export interface FulfillmentDashboardData {
  queues: Awaited<ReturnType<FulfillmentService["getQueueCounts"]>>;
  statistics: Awaited<ReturnType<FulfillmentService["getShipmentStatistics"]>>;
  delayed: Array<{
    id: string;
    shipmentNumber: string;
    orderNumber: string;
    providerName: string;
    statusLabel: string;
    /** Whole hours since the last status movement. */
    stalledHours: number;
  }>;
}

export async function getFulfillmentDashboardAction(): Promise<
  ActionResult<FulfillmentDashboardData>
> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.View");

    const service = new FulfillmentService();
    const [queues, statistics, delayedShipments] = await Promise.all([
      service.getQueueCounts(),
      service.getShipmentStatistics(),
      service.getDelayedShipments(10),
    ]);

    const now = Date.now();
    return {
      success: true,
      data: {
        queues,
        statistics,
        delayed: delayedShipments.map((s) => ({
          id: s.id,
          shipmentNumber: s.shipmentNumber,
          orderNumber: s.orderNumber,
          providerName: getCourierName(s.provider),
          statusLabel: getShipmentStatusLabel(s.status),
          stalledHours: s.updatedAt
            ? Math.floor((now - new Date(s.updatedAt).getTime()) / 3600_000)
            : 0,
        })),
      },
    };
  } catch (error) {
    return failure("getFulfillmentDashboardAction", error);
  }
}

/** Courier options for the assignment selectors, with their integration mode. */
export async function listCourierProvidersAction(): Promise<
  ActionResult<Array<{ id: string; name: string; nameBn: string; integration: string; note: string }>>
> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.View");
    return {
      success: true,
      data: COURIER_PROVIDERS.map((p) => ({
        id: p.id,
        name: p.name,
        nameBn: p.nameBn,
        integration: p.integration,
        note: p.note,
      })),
    };
  } catch (error) {
    return failure("listCourierProvidersAction", error);
  }
}

/** Orders that are confirmed/packed but have no shipment yet — the ship queue. */
export async function listShippableOrdersAction(
  limit = 25,
): Promise<
  ActionResult<
    Array<{
      id: string;
      orderNumber: string;
      status: OrderStatus;
      customerName: string;
      district: string;
      grandTotal: number;
      placedAt?: string;
      hasShipment: boolean;
    }>
  >
> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.View");

    const orders = await new OrderRepository().findPaginated(
      { status: { $in: ["confirmed", "picking", "packed", "ready_for_dispatch"] } },
      { page: 1, limit: Math.min(100, Math.max(1, limit)) },
      { sortBy: "createdAt", sortOrder: "asc" },
    );

    // One query for every order's shipment rather than one per row.
    const shipments = await new ShipmentRepository().findLatestByOrderIds(
      orders.items.map((o) => o.id),
    );

    return {
      success: true,
      data: orders.items.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customer.name,
        district: order.shipping.district || "",
        grandTotal: minorToBdt(order.pricing.grandTotal),
        placedAt: iso(order.createdAt),
        hasShipment: shipments.has(order.id),
      })),
    };
  } catch (error) {
    return failure("listShippableOrdersAction", error);
  }
}

// ── Writes ───────────────────────────────────────────────────────────────

export async function createShipmentAction(input: unknown): Promise<ActionResult<AdminShipmentDto>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = createShipmentInputSchema.parse(input);
    const shipment = await new FulfillmentService().createShipment(
      {
        orderId: parsed.orderId,
        provider: parsed.provider,
        deliveryZone: parsed.deliveryZone,
        trackingCode: parsed.trackingCode,
        pickupAddressId: parsed.pickupAddressId,
        estimatedDeliveryDate: parsed.estimatedDeliveryDate,
        deliveryNotes: parsed.deliveryNotes,
        internalNotes: parsed.internalNotes,
        package: parsed.package ? toPackageInput(parsed.package) : undefined,
      },
      sessionActor(session),
    );

    revalidateFulfillment();
    return { success: true, data: toAdminDto(shipment) };
  } catch (error) {
    return failure("createShipmentAction", error);
  }
}

export async function assignCourierAction(input: unknown): Promise<ActionResult<AdminShipmentDto>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = assignCourierInputSchema.parse(input);
    const shipment = await new FulfillmentService().assignCourier(parsed, sessionActor(session));

    revalidateFulfillment();
    return { success: true, data: toAdminDto(shipment) };
  } catch (error) {
    return failure("assignCourierAction", error);
  }
}

export async function updateShipmentStatusAction(
  input: unknown,
): Promise<ActionResult<AdminShipmentDto>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = updateShipmentStatusSchema.parse(input);
    const shipment = await new FulfillmentService().updateShipmentStatus(
      parsed.shipmentId,
      parsed.toStatus,
      sessionActor(session),
      { message: parsed.message, location: parsed.location },
    );

    revalidateFulfillment();
    return { success: true, data: toAdminDto(shipment) };
  } catch (error) {
    return failure("updateShipmentStatusAction", error);
  }
}

export async function bulkUpdateShipmentStatusAction(input: unknown): Promise<
  ActionResult<{
    updated: number;
    failed: number;
    errors: Array<{ shipmentId: string; error: string }>;
  }>
> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = bulkShipmentStatusSchema.parse(input);
    const result = await new FulfillmentService().bulkUpdateStatus(
      parsed.shipmentIds,
      parsed.toStatus,
      sessionActor(session),
      parsed.message,
    );

    revalidateFulfillment();
    return { success: true, data: result };
  } catch (error) {
    return failure("bulkUpdateShipmentStatusAction", error);
  }
}

export async function updateShipmentPackageAction(
  input: unknown,
): Promise<ActionResult<AdminShipmentDto>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = updateShipmentPackageSchema.parse(input);
    const shipment = await new FulfillmentService().updatePackage(
      {
        shipmentId: parsed.shipmentId,
        package: toPackageInput(parsed.package),
        recalculateCharges: parsed.recalculateCharges,
      },
      sessionActor(session),
    );

    revalidateFulfillment();
    return { success: true, data: toAdminDto(shipment) };
  } catch (error) {
    return failure("updateShipmentPackageAction", error);
  }
}

export async function updateShipmentNotesAction(
  input: unknown,
): Promise<ActionResult<AdminShipmentDto>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = updateShipmentNotesSchema.parse(input);
    const shipment = await new FulfillmentService().updateNotes(
      parsed.shipmentId,
      { deliveryNotes: parsed.deliveryNotes, internalNotes: parsed.internalNotes },
      sessionActor(session),
    );

    revalidateFulfillment();
    return { success: true, data: toAdminDto(shipment) };
  } catch (error) {
    return failure("updateShipmentNotesAction", error);
  }
}

export async function cancelShipmentAction(input: unknown): Promise<ActionResult<AdminShipmentDto>> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const parsed = cancelShipmentInputSchema.parse(input);
    const shipment = await new FulfillmentService().cancelShipment(
      parsed.shipmentId,
      parsed.reason,
      sessionActor(session),
    );

    revalidateFulfillment();
    return { success: true, data: toAdminDto(shipment) };
  } catch (error) {
    return failure("cancelShipmentAction", error);
  }
}

export async function bookShipmentAction(input: unknown): Promise<
  ActionResult<{
    shipment: AdminShipmentDto;
    booked: boolean;
    requiresManualBooking: boolean;
    message: string;
  }>
> {
  try {
    const session = await auth();
    checkPermission(session, "Courier.Manage");

    const { shipmentId } = shipmentIdSchema.parse(input);
    const result = await new FulfillmentService().bookShipment(shipmentId, sessionActor(session));

    revalidateFulfillment();
    return {
      success: true,
      data: {
        shipment: toAdminDto(result.shipment),
        booked: result.booked,
        requiresManualBooking: result.requiresManualBooking,
        message: result.message,
      },
    };
  } catch (error) {
    return failure("bookShipmentAction", error);
  }
}
