import { BaseDBEntity } from "@/shared/lib/database/types";
import { ShipmentStatus } from "./shipment-entity";

export interface RiderInfo {
  name?: string;
  phone?: string;
  riderId?: string;
  vehicle?: string;
  assignmentType?: "pickup" | "delivery";
  assignedAt?: Date;
}

export interface HubTransfer {
  currentHub: string;
  previousHub?: string;
  destinationHub?: string;
  arrivalTime: Date;
  departureTime?: Date;
  district?: string;
  area?: string;
}

export interface ImmutableLocationEntry {
  district?: string;
  area?: string;
  hub?: string;
  gps?: { lat: number; lng: number };
  timestamp: Date;
}

export interface TrackingTimelineEntry {
  timestamp: Date;
  status: ShipmentStatus;
  nativeStatus?: string;
  description: string;
  courierEvent?: string;
  operator?: string;
  location?: string;
  district?: string;
  area?: string;
  hub?: string;
  rider?: RiderInfo;
}

export interface ShipmentAutomationState extends BaseDBEntity {
  shipmentId: string;
  orderId: string;
  shipmentNumber: string;
  trackingCode: string;
  provider: string;
  currentStatus: ShipmentStatus;
  nativeStatus?: string;
  rider?: RiderInfo;
  currentHub?: string;
  hubHistory: HubTransfer[];
  locationHistory: ImmutableLocationEntry[];
  timeline: TrackingTimelineEntry[];
  isLocked: boolean;
  codSettlementPrepared: boolean;
  deliveryFeeRecorded: boolean;
  lastPolledAt?: Date;
  pollCount: number;
  pollingStatus: "active" | "completed" | "paused" | "error";
  lastErrorMessage?: string;
}

export interface AutomationDashboardMetrics {
  activeShipmentsCount: number;
  pollingWorkerStatus: "healthy" | "degraded" | "paused";
  webhookWorkerStatus: "healthy" | "degraded" | "paused";
  failedJobsCount: number;
  retryQueueCount: number;
  avgSyncTimeMs: number;
  avgDeliveryTimeHours: number;
  pathaoApiStatus: "available" | "degraded" | "down";
  steadfastApiStatus: "available" | "degraded" | "down";
}
