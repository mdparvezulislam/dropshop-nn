import { ShipmentRepository } from "../repositories/shipment-repository";
import { DeliveryDisputeRepository } from "../repositories/delivery-dispute-repository";
import type {
  DeliveryDispute,
  DisputeType,
  DisputeStatus,
  LogisticsEscalation,
  EscalationLevel,
} from "../domain/delivery-dispute-entity";
import { EventBus } from "@/lib/event-bus/event-bus";

export class DeliveryDisputeService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly disputeRepository: DeliveryDisputeRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.disputeRepository = new DeliveryDisputeRepository();
  }

  async createDispute(input: {
    shipmentId: string;
    disputeType: DisputeType;
    evidenceUrls?: string[];
    initialNote?: string;
    codDiscrepancyCents?: number;
    actorId?: string;
  }): Promise<DeliveryDispute> {
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    const existing = await this.disputeRepository.findByShipmentId(input.shipmentId);
    if (existing && existing.status !== "closed" && existing.status !== "resolved") {
      throw new Error(`An active dispute already exists for shipment ${shipment.shipmentNumber}`);
    }

    const disputeNumber = `DSP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const dispute = await this.disputeRepository.create({
      disputeNumber,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      disputeType: input.disputeType,
      status: "created",
      evidenceUrls: input.evidenceUrls || [],
      internalNotes: input.initialNote
        ? [`[Opened] ${input.initialNote}`]
        : [`Dispute initialized for ${input.disputeType}`],
      codDiscrepancyCents: input.codDiscrepancyCents || 0,
    } as any);

    await EventBus.publish(
      "courier.dispute_created",
      {
        disputeId: dispute.id,
        shipmentId: shipment.id,
        orderId: shipment.orderId,
        disputeType: input.disputeType,
      },
      { source: "delivery-dispute-service" },
    );

    return dispute;
  }

  async assignStaff(
    disputeId: string,
    staffId: string,
    staffName: string,
  ): Promise<DeliveryDispute> {
    return this.disputeRepository.update(disputeId, {
      assignedStaffId: staffId,
      assignedStaffName: staffName,
      status: "under_investigation",
    } as any);
  }

  async resolveDispute(
    disputeId: string,
    summary: string,
    actorId: string = "system",
  ): Promise<DeliveryDispute> {
    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new Error(`Dispute not found: ${disputeId}`);
    }

    const updated = await this.disputeRepository.update(disputeId, {
      status: "resolved",
      resolutionSummary: summary,
      resolvedAt: new Date(),
    } as any);

    return updated;
  }

  async escalateDispute(input: {
    disputeId: string;
    level: EscalationLevel;
    assignedRole: string;
    reason: string;
    escalatedBy: string;
  }): Promise<LogisticsEscalation> {
    const dispute = await this.disputeRepository.findById(input.disputeId);
    if (!dispute) {
      throw new Error(`Dispute not found: ${input.disputeId}`);
    }

    const escalationNumber = `ESC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return this.disputeRepository.createEscalation({
      escalationNumber,
      disputeId: dispute.id,
      shipmentId: dispute.shipmentId,
      level: input.level,
      assignedRole: input.assignedRole,
      reason: input.reason,
      status: "open",
      escalatedBy: input.escalatedBy,
    });
  }

  async listDisputes(): Promise<DeliveryDispute[]> {
    return this.disputeRepository.listDisputes();
  }

  async listEscalations(): Promise<LogisticsEscalation[]> {
    return this.disputeRepository.listEscalations();
  }
}

export default DeliveryDisputeService;
