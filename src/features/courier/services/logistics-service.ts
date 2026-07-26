import { ShipmentRepository } from "../repositories/shipment-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import { PickupAddressRepository } from "../repositories/pickup-address-repository";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";

export class LogisticsService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly auditRepository: LogisticsAuditRepository;
  private readonly pickupAddressRepository: PickupAddressRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.auditRepository = new LogisticsAuditRepository();
    this.pickupAddressRepository = new PickupAddressRepository();
  }

  async createShipment(data: {
    orderId: string;
    orderNumber: string;
    provider: string;
    deliveryZone?: string;
    parcelType?: string;
    parcelWeight?: number;
    codAmount: number;
    deliveryCharge?: number;
    recipient: {
      name: string;
      phone: string;
      alternativePhone?: string;
      address: string;
      district: string;
      area: string;
    };
    pickupAddressId?: string;
    actorId?: string;
  }): Promise<Shipment> {
    const defaultAddress = await this.pickupAddressRepository.findDefaultAddress();
    const pickupAddressId = data.pickupAddressId || defaultAddress?.id;

    const shipmentNum = `SHP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const shipment = await this.shipmentRepository.create({
      shipmentNumber: shipmentNum,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      trackingCode,
      provider: data.provider.toLowerCase(),
      status: "draft",
      deliveryZone: data.deliveryZone || "inside_city",
      parcelType: data.parcelType || "parcel",
      parcelWeight: data.parcelWeight || 500,
      codAmount: data.codAmount,
      declaredValue: data.codAmount,
      deliveryCharge: data.deliveryCharge || 6000,
      codCharge: 0,
      recipient: data.recipient,
      pickupAddressId,
      retryCount: 0,
      history: [
        {
          status: "draft",
          timestamp: new Date(),
          message: "Shipment draft created in platform logistics hub",
          actorId: data.actorId || "system",
        },
      ],
    } as any);

    await this.auditRepository.create({
      referenceNumber: shipmentNum,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      provider: shipment.provider,
      action: "shipment_created",
      actorId: data.actorId || "system",
      newStatus: "draft",
      reason: `Shipment draft generated for Order #${shipment.orderNumber}`,
    });

    await EventBus.publish(
      "courier.shipment_created",
      { shipmentId: shipment.id, trackingCode, orderId: shipment.orderId },
      { source: "logistics-service" },
    );

    return shipment;
  }

  async bookShipment(shipmentId: string, actorId: string = "system"): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${shipmentId}`);
    }

    if (
      shipment.status !== "draft" &&
      shipment.status !== "pending_booking" &&
      shipment.status !== "failed"
    ) {
      throw new Error(
        `Shipment ${shipment.shipmentNumber} cannot be booked in status ${shipment.status}`,
      );
    }

    const adapter = CourierProviderRegistry.get(shipment.provider);
    let result;
    try {
      result = await adapter.createShipment(shipment, { orderId: shipment.orderId });
    } catch (err: any) {
      logger.error("LogisticsService: booking failed", err, { shipmentId });
      await this.shipmentRepository.update(shipmentId, {
        status: "failed",
        retryCount: (shipment.retryCount || 0) + 1,
        lastFailureReason: err.message,
        history: [
          ...shipment.history,
          {
            status: "failed",
            timestamp: new Date(),
            message: `Booking failed: ${err.message}`,
            actorId,
          },
        ],
      } as any);

      await EventBus.publish(
        "courier.booking_failed",
        { shipmentId, reason: err.message },
        { source: "logistics-service" },
      );

      throw err;
    }

    if (!result.success) {
      throw new Error(result.error || "Courier booking rejected by provider");
    }

    const updated = await this.shipmentRepository.update(shipmentId, {
      status: "booked",
      consignmentId: result.consignmentId || result.courierReference,
      courierReference: result.courierReference,
      trackingCode: result.trackingCode || shipment.trackingCode,
      trackingUrl: result.trackingUrl,
      lastSyncedAt: new Date(),
      history: [
        ...shipment.history,
        {
          status: "booked",
          timestamp: new Date(),
          message: `Booked successfully via ${shipment.provider.toUpperCase()}. Consignment ID: ${result.consignmentId}`,
          actorId,
        },
      ],
    } as any);

    await this.auditRepository.create({
      referenceNumber: shipment.shipmentNumber,
      shipmentId,
      orderId: shipment.orderId,
      provider: shipment.provider,
      action: "shipment_booked",
      actorId,
      oldStatus: shipment.status,
      newStatus: "booked",
      reason: `Consignment ID: ${result.consignmentId}`,
    });

    // Integration Hook: Update Order Engine Status to "in_transit" / "processing"
    try {
      const { OrderRepository } = await import("@/features/order/repositories/order-repository");
      const orderRepo = new OrderRepository();
      const order = await orderRepo.findById(shipment.orderId);
      if (
        order &&
        ["confirmed", "ready_for_dispatch", "packed", "shipped"].includes(order.status as string)
      ) {
        await orderRepo.update(shipment.orderId, {
          shippingInfo: {
            ...order.shippingInfo,
            courierName: shipment.provider,
            trackingNumber: result.trackingCode || shipment.trackingCode,
            trackingUrl: result.trackingUrl,
          },
        } as any);
      }
    } catch (e) {
      logger.warn("LogisticsService: failed to sync order status update", {
        orderId: shipment.orderId,
      });
    }

    await EventBus.publish(
      "courier.shipment_booked",
      { shipmentId, consignmentId: result.consignmentId, trackingCode: result.trackingCode },
      { source: "logistics-service" },
    );

    return updated;
  }

  async cancelShipment(
    shipmentId: string,
    reason: string = "Cancelled by merchant",
    actorId: string = "system",
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${shipmentId}`);
    }

    const adapter = CourierProviderRegistry.get(shipment.provider);
    await adapter.cancelShipment(shipment.trackingCode, shipment.consignmentId);

    const updated = await this.shipmentRepository.update(shipmentId, {
      status: "cancelled",
      history: [
        ...shipment.history,
        {
          status: "cancelled",
          timestamp: new Date(),
          message: `Shipment cancelled: ${reason}`,
          actorId,
        },
      ],
    } as any);

    await this.auditRepository.create({
      referenceNumber: shipment.shipmentNumber,
      shipmentId,
      orderId: shipment.orderId,
      provider: shipment.provider,
      action: "shipment_cancelled",
      actorId,
      oldStatus: shipment.status,
      newStatus: "cancelled",
      reason,
    });

    return updated;
  }

  async bulkBookShipments(
    shipmentIds: string[],
    actorId: string = "system",
  ): Promise<{ booked: number; failed: number; errors: string[] }> {
    let booked = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of shipmentIds) {
      try {
        await this.bookShipment(id, actorId);
        booked++;
      } catch (err: any) {
        failed++;
        errors.push(`Shipment ${id}: ${err.message}`);
      }
    }

    return { booked, failed, errors };
  }
}

export default LogisticsService;
