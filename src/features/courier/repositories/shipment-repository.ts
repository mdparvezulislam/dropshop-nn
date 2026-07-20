import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ShipmentModel } from "./shipment-model";
import type { Shipment } from "../domain/shipment-entity";
import type { DatabaseQueryOptions } from "@/shared/lib/database/types";

export class ShipmentRepository extends BaseRepository<any, Shipment> {
  constructor() {
    super(ShipmentModel, (doc) => ({
      id: doc.id,
      shipmentNumber: doc.shipmentNumber,
      orderId: doc.orderId,
      orderNumber: doc.orderNumber,
      courierReference: doc.courierReference,
      trackingCode: doc.trackingCode,
      provider: doc.provider,
      status: doc.status,
      deliveryZone: doc.deliveryZone,
      parcelType: doc.parcelType,
      parcelWeight: doc.parcelWeight,
      dimensions: doc.dimensions,
      codAmount: doc.codAmount,
      declaredValue: doc.declaredValue,
      deliveryCharge: doc.deliveryCharge,
      codCharge: doc.codCharge,
      history: doc.history ? doc.history.map((h: any) => ({
        status: h.status,
        timestamp: h.timestamp,
        message: h.message,
        actorId: h.actorId,
      })) : [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata) : undefined,
    }));
  }

  async findByShipmentNumber(shipmentNumber: string, options?: DatabaseQueryOptions): Promise<Shipment | null> {
    return this.findOne({ shipmentNumber }, options);
  }

  async findByOrderId(orderId: string, options?: DatabaseQueryOptions): Promise<Shipment[]> {
    return this.find({ orderId }, options);
  }

  async findByTrackingCode(trackingCode: string, options?: DatabaseQueryOptions): Promise<Shipment | null> {
    return this.findOne({ trackingCode }, options);
  }
}
export default ShipmentRepository;
