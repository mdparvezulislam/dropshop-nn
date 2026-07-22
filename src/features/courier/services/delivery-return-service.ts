import { ShipmentRepository } from "../repositories/shipment-repository";
import { DeliveryReturnRepository } from "../repositories/delivery-return-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import type { DeliveryReturn, RTSRecord, ReturnReason, ReturnStatus, RTSStatus } from "../domain/delivery-return-entity";
import type { Shipment } from "../domain/shipment-entity";
import { EventBus } from "@/shared/lib/event-bus/event-bus";

export class DeliveryReturnService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly returnRepository: DeliveryReturnRepository;
  private readonly auditRepository: LogisticsAuditRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.returnRepository = new DeliveryReturnRepository();
    this.auditRepository = new LogisticsAuditRepository();
  }

  async initiateReturn(input: {
    shipmentId: string;
    reason: ReturnReason;
    returnChargeCents?: number;
    notes?: string;
    initiatedBy?: string;
  }): Promise<DeliveryReturn> {
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    const existing = await this.returnRepository.findByShipmentId(input.shipmentId);
    if (existing && existing.status !== "return_cancelled") {
      throw new Error(`Return record already exists for shipment ${shipment.shipmentNumber}`);
    }

    const returnNumber = `RET-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const returnRecord = await this.returnRepository.create({
      returnNumber,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      trackingCode: shipment.trackingCode,
      reason: input.reason,
      status: "return_initiated",
      returnChargeCents: input.returnChargeCents || 4000,
      initiatedBy: input.initiatedBy || "system",
      notes: input.notes,
    } as any);

    await this.shipmentRepository.update(shipment.id, {
      status: "returned",
      returnCharge: input.returnChargeCents || 4000,
      history: [
        ...shipment.history,
        {
          status: "returned",
          timestamp: new Date(),
          message: `Return initiated (${input.reason}). Return Ticket #${returnNumber}`,
          actorId: input.initiatedBy || "system",
        },
      ],
    } as any);

    await EventBus.publish(
      "courier.returned",
      { shipmentId: shipment.id, orderId: shipment.orderId, returnNumber, returnChargeCents: input.returnChargeCents || 4000 },
      { source: "delivery-return-service" },
    );

    return returnRecord;
  }

  async updateReturnStatus(returnId: string, status: ReturnStatus, notes?: string, actorId: string = "system"): Promise<DeliveryReturn> {
    const ret = await this.returnRepository.findById(returnId);
    if (!ret) {
      throw new Error(`Return record not found: ${returnId}`);
    }

    const updated = await this.returnRepository.update(returnId, {
      status,
      notes: notes ? `${ret.notes || ""}\n[${new Date().toISOString()}] ${notes}` : ret.notes,
      completedAt: status === "return_completed" ? new Date() : ret.completedAt,
    } as any);

    return updated;
  }

  async createRTS(input: { shipmentId: string; reason: string; actorId?: string }): Promise<RTSRecord> {
    const shipment = await this.shipmentRepository.findById(input.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${input.shipmentId}`);
    }

    const existing = await this.returnRepository.findRTSByShipmentId(input.shipmentId);
    if (existing) {
      throw new Error(`RTS record already active for shipment ${shipment.shipmentNumber}`);
    }

    const rtsNumber = `RTS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const rts = await this.returnRepository.createRTS({
      rtsNumber,
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      reason: input.reason,
      status: "rts_created",
    });

    await EventBus.publish(
      "courier.rts_started",
      { shipmentId: shipment.id, orderId: shipment.orderId, rtsNumber },
      { source: "delivery-return-service" },
    );

    return rts;
  }

  async inspectRTSPackage(rtsId: string, condition: "intact" | "damaged" | "missing_items" | "opened", notes?: string): Promise<RTSRecord> {
    return this.returnRepository.updateRTS(rtsId, {
      status: "package_inspected",
      inspectionCondition: condition,
      inspectorNotes: notes,
    });
  }

  async completeRTS(rtsId: string): Promise<RTSRecord> {
    const updated = await this.returnRepository.updateRTS(rtsId, {
      status: "rts_completed",
      completedAt: new Date(),
    });

    await EventBus.publish(
      "courier.rts_completed",
      { rtsId, shipmentId: updated.shipmentId, orderId: updated.orderId },
      { source: "delivery-return-service" },
    );

    return updated;
  }

  async listReturns(): Promise<DeliveryReturn[]> {
    return this.returnRepository.listReturns();
  }

  async listRTS(): Promise<RTSRecord[]> {
    return this.returnRepository.listRTS();
  }
}

export default DeliveryReturnService;
