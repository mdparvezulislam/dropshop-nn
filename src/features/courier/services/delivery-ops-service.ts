import { ShipmentRepository } from "../repositories/shipment-repository";
import { DeliveryAttemptRepository } from "../repositories/delivery-attempt-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import type { DeliveryAttempt, DeliveryFailureReason } from "../domain/delivery-attempt-entity";
import type { Shipment } from "../domain/shipment-entity";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { logger } from "@/shared/utils/logger";

export interface RecordAttemptInput {
  shipmentId: string;
  courier?: string;
  deliveryAgent?: { name?: string; phone?: string; agentId?: string };
  status: "attempted" | "failed" | "delivered" | "rescheduled";
  failureReason?: DeliveryFailureReason;
  customerResponse?: string;
  notes?: string;
  actorId?: string;
}

export interface ReassignCourierInput {
  shipmentId: string;
  newCourier: string;
  reason: string;
  actorId?: string;
}

export interface ManualInterventionInput {
  shipmentId: string;
  actionType: "force_status" | "manual_tracking" | "manual_delivery_confirm" | "manual_return_confirm";
  targetStatus?: string;
  manualTrackingCode?: string;
  notes: string;
  actorId?: string;
}

export class DeliveryOpsService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly attemptRepository: DeliveryAttemptRepository;
  private readonly auditRepository: LogisticsAuditRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.attemptRepository = new DeliveryAttemptRepository();
    this.auditRepository = new LogisticsAuditRepository();
  }

  async recordAttempt(input: RecordAttemptInput): Promise<DeliveryAttempt> {
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    const previousAttempts = await this.attemptRepository.findByShipmentId(input.shipmentId);
    const attemptNumber = previousAttempts.length + 1;

    const attempt = await this.attemptRepository.create({
      shipmentId: input.shipmentId,
      orderId: shipment.orderId,
      attemptNumber,
      courier: input.courier || shipment.provider,
      deliveryAgent: input.deliveryAgent,
      attemptTime: new Date(),
      status: input.status,
      failureReason: input.failureReason,
      customerResponse: input.customerResponse,
      notes: input.notes,
    } as any);

    if (input.status === "failed") {
      await this.shipmentRepository.update(shipment.id, {
        status: "failed",
        lastFailureReason: input.failureReason || input.notes || "Delivery attempt failed",
        retryCount: (shipment.retryCount || 0) + 1,
        history: [
          ...shipment.history,
          {
            status: "failed",
            timestamp: new Date(),
            message: `Delivery attempt #${attemptNumber} failed: ${input.failureReason || input.notes}`,
            actorId: input.actorId || "agent",
          },
        ],
      } as any);

      await EventBus.publish(
        "courier.attempt_failed",
        { shipmentId: shipment.id, orderId: shipment.orderId, attemptNumber, reason: input.failureReason },
        { source: "delivery-ops-service" },
      );
    } else if (input.status === "delivered") {
      await this.shipmentRepository.update(shipment.id, {
        status: "delivered",
        history: [
          ...shipment.history,
          {
            status: "delivered",
            timestamp: new Date(),
            message: `Delivered on attempt #${attemptNumber}`,
            actorId: input.actorId || "agent",
          },
        ],
      } as any);

      await EventBus.publish(
        "courier.delivered",
        { shipmentId: shipment.id, orderId: shipment.orderId, codAmount: shipment.codAmount },
        { source: "delivery-ops-service" },
      );
    }

    return attempt;
  }

  async reassignCourier(input: ReassignCourierInput): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    const oldCourier = shipment.provider;
    const newCourier = input.newCourier.toLowerCase();

    const updated = await this.shipmentRepository.update(shipment.id, {
      provider: newCourier,
      history: [
        ...shipment.history,
        {
          status: shipment.status,
          timestamp: new Date(),
          message: `Courier reassigned from ${oldCourier.toUpperCase()} to ${newCourier.toUpperCase()}. Reason: ${input.reason}`,
          actorId: input.actorId || "system",
        },
      ],
    } as any);

    await this.auditRepository.create({
      referenceNumber: shipment.shipmentNumber,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      provider: newCourier,
      action: "courier_reassigned",
      actorId: input.actorId || "system",
      oldStatus: shipment.status,
      newStatus: shipment.status,
      reason: `Reassigned from ${oldCourier} to ${newCourier}: ${input.reason}`,
    });

    return updated;
  }

  async recordPartialDelivery(shipmentId: string, partialCodCents: number, notes?: string, actorId: string = "system"): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${shipmentId}`);
    }

    const remainingCod = Math.max(0, shipment.codAmount - partialCodCents);

    const updated = await this.shipmentRepository.update(shipmentId, {
      status: "partial_delivered",
      history: [
        ...shipment.history,
        {
          status: "partial_delivered",
          timestamp: new Date(),
          message: `Partial delivery recorded. Collected: ৳${(partialCodCents / 100).toFixed(2)}, Remaining: ৳${(remainingCod / 100).toFixed(2)}. ${notes || ""}`,
          actorId,
        },
      ],
    } as any);

    await EventBus.publish(
      "courier.partial_delivered",
      { shipmentId, orderId: shipment.orderId, partialCodCents, remainingCod },
      { source: "delivery-ops-service" },
    );

    return updated;
  }

  async executeManualIntervention(input: ManualInterventionInput): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    const oldStatus = shipment.status;
    let targetStatus = (input.targetStatus as any) || oldStatus;
    let trackingCode = shipment.trackingCode;

    if (input.actionType === "manual_delivery_confirm") {
      targetStatus = "delivered";
    } else if (input.actionType === "manual_return_confirm") {
      targetStatus = "returned";
    } else if (input.actionType === "manual_tracking" && input.manualTrackingCode) {
      trackingCode = input.manualTrackingCode;
    }

    const updated = await this.shipmentRepository.update(shipment.id, {
      status: targetStatus,
      trackingCode,
      history: [
        ...shipment.history,
        {
          status: targetStatus,
          timestamp: new Date(),
          message: `Manual intervention (${input.actionType}): ${input.notes}`,
          actorId: input.actorId || "admin",
        },
      ],
    } as any);

    await this.auditRepository.create({
      referenceNumber: shipment.shipmentNumber,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      provider: shipment.provider,
      action: "manual_intervention",
      actorId: input.actorId || "admin",
      oldStatus,
      newStatus: targetStatus,
      reason: `Manual Action [${input.actionType}]: ${input.notes}`,
    });

    return updated;
  }

  async getExceptionQueue(): Promise<{
    failedDeliveries: Shipment[];
    lostParcels: Shipment[];
    delayedShipments: Shipment[];
    damagedShipments: Shipment[];
  }> {
    const { items: all } = await this.shipmentRepository.findWithFilters({ limit: 500 });
    const now = Date.now();

    const failedDeliveries = all.filter((s) => s.status === "failed");
    const lostParcels = all.filter((s) => s.status === "lost");
    const damagedShipments = all.filter((s) => s.status === "damage_reported");
    const delayedShipments = all.filter(
      (s) => (s.status === "in_transit" || s.status === "out_for_delivery") && s.lastSyncedAt && now - new Date(s.lastSyncedAt).getTime() > 48 * 3600 * 1000,
    );

    return { failedDeliveries, lostParcels, delayedShipments, damagedShipments };
  }

  async getSLAWarnings(): Promise<Array<{ shipmentId: string; shipmentNumber: string; warningType: string; delayHours: number }>> {
    const { items: all } = await this.shipmentRepository.findWithFilters({ limit: 500 });
    const now = Date.now();
    const warnings: Array<{ shipmentId: string; shipmentNumber: string; warningType: string; delayHours: number }> = [];

    for (const s of all) {
      if (s.status === "booked" && s.createdAt) {
        const hours = (now - new Date(s.createdAt).getTime()) / (1000 * 3600);
        if (hours > 24) {
          warnings.push({ shipmentId: s.id, shipmentNumber: s.shipmentNumber, warningType: "Pickup Delay (>24h)", delayHours: Math.round(hours) });
        }
      } else if (s.status === "in_transit" && s.createdAt) {
        const hours = (now - new Date(s.createdAt).getTime()) / (1000 * 3600);
        if (hours > 72) {
          warnings.push({ shipmentId: s.id, shipmentNumber: s.shipmentNumber, warningType: "Transit SLA Exceeded (>72h)", delayHours: Math.round(hours) });
        }
      }
    }

    return warnings;
  }
}

export default DeliveryOpsService;
