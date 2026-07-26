import { BaseRepository } from "@/lib/database/generic-repository";
import { ShipmentModel } from "./shipment-model";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";
import type { BaseDocument } from "@/lib/database/types";

interface ShipmentDocument extends BaseDocument {
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  consignmentId?: string;
  courierReference?: string;
  trackingCode: string;
  trackingUrl?: string;
  provider: string;
  nativeStatus?: string;
  deliveryZone: string;
  parcelType: string;
  parcelWeight: number;
  codAmount: number;
  declaredValue: number;
  deliveryCharge: number;
  codCharge: number;
  returnCharge?: number;
  recipient: any;
  pickupAddressId?: string;
  retryCount?: number;
  lastFailureReason?: string;
  lastSyncedAt?: Date;
  history: any[];
}

function mapToDomain(doc: any): Shipment {
  return {
    id: doc.id ?? doc._id?.toString(),
    shipmentNumber: doc.shipmentNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    consignmentId: doc.consignmentId,
    courierReference: doc.courierReference,
    trackingCode: doc.trackingCode,
    trackingUrl: doc.trackingUrl,
    provider: doc.provider,
    status: doc.status as ShipmentStatus,
    nativeStatus: doc.nativeStatus,
    deliveryZone: doc.deliveryZone ?? "inside_city",
    parcelType: doc.parcelType ?? "parcel",
    parcelWeight: doc.parcelWeight ?? 500,
    dimensions: doc.dimensions,
    codAmount: doc.codAmount ?? 0,
    declaredValue: doc.declaredValue ?? 0,
    deliveryCharge: doc.deliveryCharge ?? 0,
    codCharge: doc.codCharge ?? 0,
    returnCharge: doc.returnCharge ?? 0,
    recipient: doc.recipient,
    pickupAddressId: doc.pickupAddressId,
    retryCount: doc.retryCount ?? 0,
    lastFailureReason: doc.lastFailureReason,
    lastSyncedAt: doc.lastSyncedAt ? new Date(doc.lastSyncedAt) : undefined,
    history: (doc.history || []).map((h: any) => ({
      ...h,
      timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class ShipmentRepository extends BaseRepository<ShipmentDocument, Shipment> {
  constructor() {
    super(ShipmentModel as any, mapToDomain);
  }

  async findByShipmentNumber(shipmentNumber: string): Promise<Shipment | null> {
    const doc = await ShipmentModel.findOne({ shipmentNumber, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async findByTrackingCode(trackingCode: string): Promise<Shipment | null> {
    const doc = await ShipmentModel.findOne({ trackingCode, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    const docs = await ShipmentModel.find({ orderId, isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async findWithFilters(filters: {
    search?: string;
    provider?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Shipment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query: any = { isDeleted: { $ne: true } };

    if (filters.provider && filters.provider !== "all") {
      query.provider = filters.provider;
    }

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters.search?.trim()) {
      const regex = new RegExp(filters.search.trim(), "i");
      query.$or = [
        { shipmentNumber: regex },
        { trackingCode: regex },
        { consignmentId: regex },
        { orderNumber: regex },
        { "recipient.name": regex },
        { "recipient.phone": regex },
      ];
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ShipmentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ShipmentModel.countDocuments(query),
    ]);

    const items = docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export default ShipmentRepository;
