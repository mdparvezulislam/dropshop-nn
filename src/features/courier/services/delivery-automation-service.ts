import { ShipmentAutomationRepository } from "../repositories/shipment-automation-repository";
import { ShipmentRepository } from "../repositories/shipment-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import type {
  ShipmentAutomationState,
  RiderInfo,
  HubTransfer,
  TrackingTimelineEntry,
  ImmutableLocationEntry,
  AutomationDashboardMetrics,
} from "../domain/delivery-automation-entity";
import type { ShipmentStatus } from "../domain/shipment-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";

export class DeliveryAutomationService {
  private readonly automationRepository: ShipmentAutomationRepository;
  private readonly shipmentRepository: ShipmentRepository;
  private readonly auditRepository: LogisticsAuditRepository;

  constructor() {
    this.automationRepository = new ShipmentAutomationRepository();
    this.shipmentRepository = new ShipmentRepository();
    this.auditRepository = new LogisticsAuditRepository();
  }

  async orchestrateCourierEvent(input: {
    shipmentId: string;
    newStatus: ShipmentStatus;
    nativeStatus?: string;
    description: string;
    rider?: RiderInfo;
    hub?: string;
    district?: string;
    area?: string;
    location?: string;
    actorId?: string;
  }): Promise<ShipmentAutomationState> {
    const actorId = input.actorId || "delivery-automation-engine";
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    let automation = await this.automationRepository.findByShipmentId(input.shipmentId);
    if (!automation) {
      automation = await this.automationRepository.upsertAutomationState(input.shipmentId, {
        orderId: shipment.orderId,
        shipmentNumber: shipment.shipmentNumber,
        trackingCode: shipment.trackingCode,
        provider: shipment.provider,
        currentStatus: shipment.status,
        hubHistory: [],
        locationHistory: [],
        timeline: [],
        isLocked: false,
        codSettlementPrepared: false,
        deliveryFeeRecorded: false,
        pollCount: 0,
        pollingStatus: "active",
      });
    }

    const isTerminal = ["delivered", "returned", "cancelled", "failed", "lost", "damaged"].includes(
      input.newStatus,
    );
    const oldStatus = shipment.status;

    // 1. Update Shipment record
    const updatedHistory = [...shipment.history];
    if (oldStatus !== input.newStatus || input.description) {
      updatedHistory.push({
        status: input.newStatus,
        nativeStatus: input.nativeStatus,
        timestamp: new Date(),
        message: input.description,
        location: input.location || input.hub,
        actorId,
      });
    }

    await this.shipmentRepository.update(input.shipmentId, {
      status: input.newStatus,
      nativeStatus: input.nativeStatus,
      lastSyncedAt: new Date(),
      history: updatedHistory,
    } as any);

    // 2. Extract Hub Transfer
    const hubHistory: HubTransfer[] = [...automation.hubHistory];
    if (input.hub && input.hub !== automation.currentHub) {
      hubHistory.push({
        currentHub: input.hub,
        previousHub: automation.currentHub,
        arrivalTime: new Date(),
        district: input.district,
        area: input.area,
      });
    }

    // 3. Extract Immutable Location Entry
    const locationHistory: ImmutableLocationEntry[] = [...automation.locationHistory];
    if (input.district || input.area || input.hub || input.location) {
      locationHistory.push({
        district: input.district,
        area: input.area,
        hub: input.hub || input.location,
        timestamp: new Date(),
      });
    }

    // 4. Build Timeline Entry
    const timeline: TrackingTimelineEntry[] = [...automation.timeline];
    timeline.push({
      timestamp: new Date(),
      status: input.newStatus,
      nativeStatus: input.nativeStatus,
      description: input.description,
      courierEvent: input.nativeStatus || input.newStatus,
      operator: actorId,
      location: input.location,
      district: input.district,
      area: input.area,
      hub: input.hub,
      rider: input.rider || automation.rider,
    });

    // 5. Automatic Delivery & Return Triggers
    let codPrepared = automation.codSettlementPrepared;
    let feeRecorded = automation.deliveryFeeRecorded;

    if (input.newStatus === "delivered" && !codPrepared) {
      codPrepared = true;
      feeRecorded = true;
      await EventBus.publish(
        "courier.delivered",
        {
          shipmentId: shipment.id,
          orderId: shipment.orderId,
          shipmentNumber: shipment.shipmentNumber,
          codAmount: shipment.codAmount,
          deliveredAt: new Date(),
        },
        { source: "delivery-automation-service" },
      );
    } else if (input.newStatus === "returned") {
      await EventBus.publish(
        "courier.returned",
        {
          shipmentId: shipment.id,
          orderId: shipment.orderId,
          shipmentNumber: shipment.shipmentNumber,
          returnedAt: new Date(),
        },
        { source: "delivery-automation-service" },
      );
    } else if (input.newStatus === "out_for_delivery") {
      await EventBus.publish(
        "courier.out_for_delivery",
        {
          shipmentId: shipment.id,
          orderId: shipment.orderId,
          rider: input.rider || automation.rider,
        },
        { source: "delivery-automation-service" },
      );
    }

    // 6. Update Automation Document
    const updatedAutomation = await this.automationRepository.upsertAutomationState(
      input.shipmentId,
      {
        currentStatus: input.newStatus,
        nativeStatus: input.nativeStatus,
        rider: input.rider || automation.rider,
        currentHub: input.hub || automation.currentHub,
        hubHistory,
        locationHistory,
        timeline,
        isLocked: isTerminal,
        codSettlementPrepared: codPrepared,
        deliveryFeeRecorded: feeRecorded,
        pollingStatus: isTerminal ? "completed" : "active",
        lastPolledAt: new Date(),
      },
    );

    // 7. Create Audit Log
    if (oldStatus !== input.newStatus) {
      await this.auditRepository.create({
        referenceNumber: shipment.shipmentNumber,
        shipmentId: shipment.id,
        orderId: shipment.orderId,
        provider: shipment.provider,
        action: "status_changed",
        actorId,
        oldStatus,
        newStatus: input.newStatus,
        reason: input.description,
      });
    }

    logger.info("DeliveryAutomationService: orchestrated courier event", {
      shipmentId: input.shipmentId,
      oldStatus,
      newStatus: input.newStatus,
    });

    return updatedAutomation;
  }

  async runAdaptivePollingWorker(): Promise<number> {
    const activeAutomations = await this.automationRepository.findActiveForPolling(30);
    if (activeAutomations.length === 0) return 0;

    let processedCount = 0;
    for (const auto of activeAutomations) {
      try {
        const adapter = CourierProviderRegistry.get(auto.provider);
        const tracking = await adapter.trackShipment(auto.trackingCode);

        await this.orchestrateCourierEvent({
          shipmentId: auto.shipmentId,
          newStatus: tracking.status,
          nativeStatus: tracking.nativeStatus,
          description: tracking.message || `Automated polling sync update (${auto.provider})`,
          location: tracking.location,
          actorId: "adaptive-polling-worker",
        });

        processedCount++;
      } catch (err: any) {
        logger.error(
          `DeliveryAutomationService: polling sync failed for shipment ${auto.shipmentId}`,
          err,
        );
        await this.automationRepository.upsertAutomationState(auto.shipmentId, {
          pollCount: (auto.pollCount || 0) + 1,
          lastErrorMessage: err.message,
        });
      }
    }

    return processedCount;
  }

  async getDashboardMetrics(): Promise<AutomationDashboardMetrics> {
    return this.automationRepository.getDashboardMetrics();
  }

  async listAutomations(limit: number = 100): Promise<ShipmentAutomationState[]> {
    return this.automationRepository.listAutomations(limit);
  }
}

export default DeliveryAutomationService;
