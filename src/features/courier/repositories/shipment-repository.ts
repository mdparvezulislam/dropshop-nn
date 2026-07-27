import { BaseRepository } from "@/lib/database/generic-repository";
import { ShipmentModel } from "./shipment-model";
import type { Shipment, ShipmentStatus, ParcelDimensions } from "../domain/shipment-entity";
import type { BaseDocument } from "@/lib/database/types";

interface ShipmentDocument extends BaseDocument {
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  consignmentId?: string;
  courierReference?: string;
  trackingCode?: string;
  trackingUrl?: string;
  provider: string;
  nativeStatus?: string;
  deliveryZone: string;
  parcelType: string;
  parcelWeight: number;
  volumetricWeight?: number;
  chargeableWeight?: number;
  packageCount?: number;
  codAmount: number;
  declaredValue: number;
  deliveryCharge: number;
  codCharge: number;
  returnCharge?: number;
  recipient: unknown;
  pickupAddressId?: string;
  pickupDate?: Date;
  dispatchDate?: Date;
  estimatedDeliveryDate?: Date;
  deliveryDate?: Date;
  returnDate?: Date;
  deliveryNotes?: string;
  internalNotes?: string;
  retryCount?: number;
  lastFailureReason?: string;
  lastSyncedAt?: Date;
  history: unknown[];
}

/** Lean mongoose documents come back untyped; `mapToDomain` is the type boundary. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawDoc = Record<string, any>;

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function mapDimensions(raw: RawDoc | undefined): ParcelDimensions | undefined {
  if (!raw) return undefined;
  // `depth` is the pre-WEBSITE-009 name for what is now `length`.
  const length = raw.length ?? raw.depth ?? 0;
  const width = raw.width ?? 0;
  const height = raw.height ?? 0;
  if (!length && !width && !height) return undefined;
  return { length, width, height };
}

function mapToDomain(doc: RawDoc): Shipment {
  return {
    id: doc.id ?? doc._id?.toString(),
    shipmentNumber: doc.shipmentNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    consignmentId: doc.consignmentId ?? undefined,
    courierReference: doc.courierReference ?? undefined,
    trackingCode: doc.trackingCode ?? undefined,
    trackingUrl: doc.trackingUrl ?? undefined,
    provider: doc.provider,
    status: doc.status as ShipmentStatus,
    nativeStatus: doc.nativeStatus ?? undefined,
    deliveryZone: doc.deliveryZone ?? "inside_city",
    parcelType: doc.parcelType ?? "parcel",
    parcelWeight: doc.parcelWeight ?? 0,
    dimensions: mapDimensions(doc.dimensions),
    volumetricWeight: doc.volumetricWeight ?? 0,
    chargeableWeight: doc.chargeableWeight ?? 0,
    packageCount: doc.packageCount ?? 1,
    codAmount: doc.codAmount ?? 0,
    declaredValue: doc.declaredValue ?? 0,
    deliveryCharge: doc.deliveryCharge ?? 0,
    codCharge: doc.codCharge ?? 0,
    returnCharge: doc.returnCharge ?? 0,
    recipient: doc.recipient,
    pickupAddressId: doc.pickupAddressId ?? undefined,
    pickupDate: toDate(doc.pickupDate),
    dispatchDate: toDate(doc.dispatchDate),
    estimatedDeliveryDate: toDate(doc.estimatedDeliveryDate),
    deliveryDate: toDate(doc.deliveryDate),
    returnDate: toDate(doc.returnDate),
    deliveryNotes: doc.deliveryNotes ?? undefined,
    internalNotes: doc.internalNotes ?? undefined,
    retryCount: doc.retryCount ?? 0,
    lastFailureReason: doc.lastFailureReason ?? undefined,
    lastSyncedAt: toDate(doc.lastSyncedAt),
    history: (doc.history || []).map((h: RawDoc) => ({
      status: h.status,
      nativeStatus: h.nativeStatus ?? undefined,
      timestamp: toDate(h.timestamp) ?? new Date(),
      message: h.message,
      location: h.location ?? undefined,
      actorId: h.actorId ?? undefined,
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

export interface ShipmentFilters {
  search?: string;
  provider?: string;
  status?: string;
  /** Any of these statuses — used by the fulfillment queues. */
  statuses?: ShipmentStatus[];
  orderId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ShipmentPage {
  items: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class ShipmentRepository extends BaseRepository<ShipmentDocument, Shipment> {
  constructor() {
    super(ShipmentModel as never, mapToDomain as never);
  }

  async findByShipmentNumber(shipmentNumber: string): Promise<Shipment | null> {
    const doc = await ShipmentModel.findOne({ shipmentNumber, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async findByTrackingCode(trackingCode: string): Promise<Shipment | null> {
    if (!trackingCode.trim()) return null;
    const doc = await ShipmentModel.findOne({
      trackingCode: trackingCode.trim(),
      isDeleted: { $ne: true },
    }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    const docs = await ShipmentModel.find({ orderId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d: RawDoc) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  /** The current shipment for an order — the most recently created one. */
  async findLatestByOrderId(orderId: string): Promise<Shipment | null> {
    const doc = await ShipmentModel.findOne({ orderId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  /** Latest shipment per order id, in one query — no N+1 on the orders list. */
  async findLatestByOrderIds(orderIds: string[]): Promise<Map<string, Shipment>> {
    if (orderIds.length === 0) return new Map();
    const docs = await ShipmentModel.find({
      orderId: { $in: orderIds },
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    const map = new Map<string, Shipment>();
    for (const doc of docs as RawDoc[]) {
      // Sorted newest-first, so the first hit per order wins.
      if (!map.has(doc.orderId)) {
        map.set(doc.orderId, mapToDomain({ ...doc, id: doc._id.toString() }));
      }
    }
    return map;
  }

  private buildQuery(filters: ShipmentFilters): Record<string, unknown> {
    const query: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (filters.provider && filters.provider !== "all") {
      query.provider = filters.provider;
    }

    if (filters.statuses?.length) {
      query.status = { $in: filters.statuses };
    } else if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters.orderId) {
      query.orderId = filters.orderId;
    }

    if (filters.search?.trim()) {
      // Escaped: a search box must never inject a regex operator.
      const regex = { $regex: escapeRegExp(filters.search.trim()), $options: "i" };
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
      const range: Record<string, Date> = {};
      if (filters.startDate) range.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
      query.createdAt = range;
    }

    return query;
  }

  async findWithFilters(filters: ShipmentFilters): Promise<ShipmentPage> {
    const query = this.buildQuery(filters);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ShipmentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ShipmentModel.countDocuments(query),
    ]);

    return {
      items: (docs as RawDoc[]).map((d) => mapToDomain({ ...d, id: d._id.toString() })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** Shipment counts grouped by status — one aggregation, not one query per tile. */
  async countByStatus(): Promise<Record<string, number>> {
    const rows = await ShipmentModel.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = {};
    for (const row of rows as Array<{ _id: string; count: number }>) {
      result[row._id] = row.count;
    }
    return result;
  }

  /** Counts per courier provider, for the fulfillment dashboard. */
  async countByProvider(): Promise<Array<{ provider: string; count: number; delivered: number }>> {
    const rows = await ShipmentModel.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);
    return (rows as Array<{ _id: string; count: number; delivered: number }>).map((r) => ({
      provider: r._id,
      count: r.count,
      delivered: r.delivered,
    }));
  }

  /**
   * Shipments stuck in courier custody past `thresholdDate` — the "delayed"
   * queue. A shipment counts as delayed on its last movement, not its creation
   * date, so a slow-but-moving parcel is not flagged.
   */
  async findDelayed(
    thresholdDate: Date,
    activeStatuses: ShipmentStatus[],
    limit = 50,
  ): Promise<Shipment[]> {
    const docs = await ShipmentModel.find({
      isDeleted: { $ne: true },
      status: { $in: activeStatuses },
      updatedAt: { $lt: thresholdDate },
    })
      .sort({ updatedAt: 1 })
      .limit(limit)
      .lean();
    return (docs as RawDoc[]).map((d) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async countDelayed(thresholdDate: Date, activeStatuses: ShipmentStatus[]): Promise<number> {
    return ShipmentModel.countDocuments({
      isDeleted: { $ne: true },
      status: { $in: activeStatuses },
      updatedAt: { $lt: thresholdDate },
    });
  }
}

export default ShipmentRepository;
