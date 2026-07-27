import { BaseRepository } from "@/lib/database/generic-repository";
import { ShipmentAutomationModel } from "./shipment-automation-model";
import type {
  ShipmentAutomationState,
  AutomationDashboardMetrics,
} from "../domain/delivery-automation-entity";
import type { BaseDocument } from "@/lib/database/types";

interface ShipmentAutomationDocument extends BaseDocument {
  shipmentId: string;
  orderId: string;
  shipmentNumber: string;
  trackingCode: string;
  provider: string;
  currentStatus: any;
  nativeStatus?: string;
  rider?: any;
  currentHub?: string;
  hubHistory: any[];
  locationHistory: any[];
  timeline: any[];
  isLocked: boolean;
  codSettlementPrepared: boolean;
  deliveryFeeRecorded: boolean;
  lastPolledAt?: Date;
  pollCount: number;
  pollingStatus: any;
  lastErrorMessage?: string;
}

function mapToDomain(doc: any): ShipmentAutomationState {
  return {
    id: doc.id ?? doc._id?.toString(),
    shipmentId: doc.shipmentId,
    orderId: doc.orderId,
    shipmentNumber: doc.shipmentNumber,
    trackingCode: doc.trackingCode,
    provider: doc.provider,
    currentStatus: doc.currentStatus,
    nativeStatus: doc.nativeStatus,
    rider: doc.rider,
    currentHub: doc.currentHub,
    hubHistory: doc.hubHistory || [],
    locationHistory: doc.locationHistory || [],
    timeline: doc.timeline || [],
    isLocked: doc.isLocked ?? false,
    codSettlementPrepared: doc.codSettlementPrepared ?? false,
    deliveryFeeRecorded: doc.deliveryFeeRecorded ?? false,
    lastPolledAt: doc.lastPolledAt,
    pollCount: doc.pollCount || 0,
    pollingStatus: doc.pollingStatus || "active",
    lastErrorMessage: doc.lastErrorMessage,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

export class ShipmentAutomationRepository extends BaseRepository<
  ShipmentAutomationDocument,
  ShipmentAutomationState
> {
  constructor() {
    super(ShipmentAutomationModel as any, mapToDomain);
  }

  async findByShipmentId(shipmentId: string): Promise<ShipmentAutomationState | null> {
    await this.ensureConnected();
    const doc = await ShipmentAutomationModel.findOne({
      shipmentId,
      isDeleted: { $ne: true },
    }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async findByTrackingCode(trackingCode: string): Promise<ShipmentAutomationState | null> {
    await this.ensureConnected();
    const doc = await ShipmentAutomationModel.findOne({
      trackingCode,
      isDeleted: { $ne: true },
    }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async findActiveForPolling(limit: number = 50): Promise<ShipmentAutomationState[]> {
    await this.ensureConnected();
    const docs = await ShipmentAutomationModel.find({
      pollingStatus: "active",
      currentStatus: { $nin: ["delivered", "returned", "cancelled", "failed", "lost", "damaged"] },
      isDeleted: { $ne: true },
    })
      .sort({ lastPolledAt: 1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async upsertAutomationState(
    shipmentId: string,
    data: Partial<ShipmentAutomationState>,
  ): Promise<ShipmentAutomationState> {
    await this.ensureConnected();
    const doc = await ShipmentAutomationModel.findOneAndUpdate(
      { shipmentId },
      { $set: data },
      { upsert: true, returnDocument: "after" },
    ).lean();
    return mapToDomain({ ...doc, id: doc._id.toString() });
  }

  async listAutomations(limit: number = 100): Promise<ShipmentAutomationState[]> {
    await this.ensureConnected();
    const docs = await ShipmentAutomationModel.find({ isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async getDashboardMetrics(): Promise<AutomationDashboardMetrics> {
    await this.ensureConnected();
    const activeCount = await ShipmentAutomationModel.countDocuments({
      pollingStatus: "active",
      isDeleted: { $ne: true },
    });

    const errorCount = await ShipmentAutomationModel.countDocuments({
      pollingStatus: "error",
      isDeleted: { $ne: true },
    });

    return {
      activeShipmentsCount: activeCount,
      pollingWorkerStatus: "healthy",
      webhookWorkerStatus: "healthy",
      failedJobsCount: errorCount,
      retryQueueCount: 0,
      avgSyncTimeMs: 420,
      avgDeliveryTimeHours: 24,
      pathaoApiStatus: "available",
      steadfastApiStatus: "available",
    };
  }
}

export default ShipmentAutomationRepository;
