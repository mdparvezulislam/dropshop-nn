import { ShipmentRepository } from "../repositories/shipment-repository";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { ChargeService } from "./charge-service";
import type { Shipment, ShipmentStatus, ParcelDimensions } from "../domain/shipment-entity";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";
import { runInTransaction } from "@/lib/database/query-builder";

export interface CreateShipmentInput {
  orderId: string;
  provider: string; // e.g. steadfast
  deliveryZone: "inside_city" | "outside_city" | "sub_city" | "remote_area";
  parcelType: "document" | "parcel" | "liquid";
  parcelWeight: number; // in grams
  dimensions: ParcelDimensions;
}

export class CourierService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly chargeService: ChargeService;
  private readonly orderRepository: OrderRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.chargeService = new ChargeService();
    this.orderRepository = new OrderRepository();
  }

  async createShipment(input: CreateShipmentInput, options?: { session?: any }): Promise<Shipment> {
    const execute = async (session: any) => {
      // 1. Verify if shipment already exists for order
      const existingList = await this.shipmentRepository.findByOrderId(input.orderId);
      if (existingList.length > 0) {
        return existingList[0];
      }

      // 2. Fetch order metadata
      const order = await this.orderRepository.findById(input.orderId, { session });
      if (!order) {
        throw new Error(`Order not found: ${input.orderId}`);
      }

      if (order.status === "draft") {
        throw new Error("Cannot create shipment for draft order drafts");
      }

      // 3. Resolve Delivery and COD charges
      const charges = await this.chargeService.calculateCharges({
        deliveryZone: input.deliveryZone,
        parcelWeight: input.parcelWeight,
        codAmount: order.pricing.grandTotal, // COD amount is usually full order value
      });

      // 4. Instantiate provider adapter
      const providerAdapter = CourierProviderRegistry.get(input.provider);

      // Generate shipment serial number
      const shipmentNumber = `DS-SH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Setup temp shipment entity
      const tempShipment: any = {
        shipmentNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        courierReference: "PENDING",
        trackingCode: "PENDING",
        provider: input.provider,
        status: "created" as ShipmentStatus,
        deliveryZone: input.deliveryZone,
        parcelType: input.parcelType,
        parcelWeight: input.parcelWeight,
        dimensions: input.dimensions,
        codAmount: order.pricing.grandTotal,
        declaredValue: order.pricing.grandTotal,
        deliveryCharge: charges.deliveryCharge,
        codCharge: charges.codCharge,
        history: [
          {
            status: "created" as ShipmentStatus,
            timestamp: new Date(),
            message: "Fulfillment shipment initialized in platform system",
          },
        ],
      };

      // 5. Submit to external provider
      const providerRes = await providerAdapter.createShipment(tempShipment, order);
      if (!providerRes.success) {
        throw new Error(`Courier Provider submission failed: ${providerRes.error}`);
      }

      tempShipment.courierReference = providerRes.courierReference;
      tempShipment.trackingCode = providerRes.trackingCode;

      // 6. Save Shipment record
      const shipment = await this.shipmentRepository.create(tempShipment, { session });

      await EventBus.publish(
        "courier.shipment_created",
        {
          shipmentId: shipment.id,
          shipmentNumber: shipment.shipmentNumber,
          orderId: shipment.orderId,
          orderNumber: shipment.orderNumber,
          provider: shipment.provider,
          codAmount: shipment.codAmount,
        },
        { source: "courier" },
      );

      logger.info("CourierService: shipment successfully registered", {
        shipmentId: shipment.id,
        trackingCode: shipment.trackingCode,
      });

      return shipment;
    };

    if (options?.session) {
      return execute(options.session);
    }
    return runInTransaction(execute);
  }

  async requestPickup(
    shipmentId: string,
    details: any,
    options?: { session?: any },
  ): Promise<Shipment> {
    return runInTransaction(async (session) => {
      const shipment = await this.shipmentRepository.findById(shipmentId, { session });
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      const providerAdapter = CourierProviderRegistry.get(shipment.provider);
      const res = await providerAdapter.requestPickup(shipment, details);
      if (!res.success) {
        throw new Error(`Courier pickup request rejected by provider: ${res.error}`);
      }

      const historyUpdate = [
        ...shipment.history,
        {
          status: "pickup_requested" as ShipmentStatus,
          timestamp: new Date(),
          message: `Pickup scheduled successfully. Ref: ${res.pickupReference || "N/A"}`,
        },
      ];

      const updated = await this.shipmentRepository.update(
        shipmentId,
        {
          status: "pickup_requested",
          history: historyUpdate,
        },
        { session },
      );

      await EventBus.publish(
        "courier.pickup_requested",
        {
          shipmentId: updated.id,
          courierReference: updated.courierReference,
          pickupTime: new Date().toISOString(),
        },
        { source: "courier" },
      );

      logger.info("CourierService: pickup scheduled successfully", { shipmentId });
      return updated;
    });
  }

  async transitionStatus(
    shipmentId: string,
    toStatus: ShipmentStatus,
    message: string,
    actorId?: string,
    options?: { session?: any },
  ): Promise<Shipment> {
    return runInTransaction(async (session) => {
      const shipment = await this.shipmentRepository.findById(shipmentId, { session });
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      if (shipment.status === toStatus) {
        return shipment;
      }

      const historyUpdate = [
        ...shipment.history,
        {
          status: toStatus,
          timestamp: new Date(),
          message,
          actorId,
        },
      ];

      const updated = await this.shipmentRepository.update(
        shipmentId,
        {
          status: toStatus,
          history: historyUpdate,
        },
        { session },
      );

      // Map event releases based on status transitions
      const eventMap: Record<string, string> = {
        picked_up: "courier.shipment_picked_up",
        in_transit: "courier.shipment_in_transit",
        delivered: "courier.shipment_delivered",
        returned: "courier.shipment_returned",
        cancelled: "courier.shipment_cancelled",
      };

      const eventName = eventMap[toStatus] || "courier.tracking_updated";
      await EventBus.publish(
        eventName,
        {
          shipmentId: updated.id,
          orderId: updated.orderId,
          trackingCode: updated.trackingCode,
          status: updated.status,
          deliveredAt: toStatus === "delivered" ? new Date().toISOString() : undefined,
          returnedAt: toStatus === "returned" ? new Date().toISOString() : undefined,
          cancelledAt: toStatus === "cancelled" ? new Date().toISOString() : undefined,
          codCollected: toStatus === "delivered" ? updated.codAmount : 0,
        },
        { source: "courier" },
      );

      logger.info(`CourierService: shipment transitioned to ${toStatus}`, { shipmentId });
      return updated;
    });
  }
}

export default CourierService;
