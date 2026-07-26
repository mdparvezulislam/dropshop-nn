import { ShipmentRepository } from "../repositories/shipment-repository";

export interface CODReconciliationSummary {
  expectedCODCents: number;
  collectedCODCents: number;
  pendingCODCents: number;
  codDiscrepancyCents: number;
  settlementReadyCount: number;
}

export class CODReconciliationService {
  private readonly shipmentRepository: ShipmentRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
  }

  async getCODMetrics(): Promise<CODReconciliationSummary> {
    const { items: all } = await this.shipmentRepository.findWithFilters({ limit: 1000 });

    let expectedCODCents = 0;
    let collectedCODCents = 0;
    let pendingCODCents = 0;
    let codDiscrepancyCents = 0;
    let settlementReadyCount = 0;

    for (const s of all) {
      if (s.status !== "cancelled" && s.status !== "returned") {
        expectedCODCents += s.codAmount;
      }

      if (s.status === "delivered") {
        collectedCODCents += s.codAmount;
        settlementReadyCount++;
      } else if (s.status === "partial_delivered") {
        collectedCODCents += Math.floor(s.codAmount * 0.5); // Example partial COD collected split
        codDiscrepancyCents += Math.floor(s.codAmount * 0.5);
      } else if (
        s.status === "in_transit" ||
        s.status === "out_for_delivery" ||
        s.status === "booked"
      ) {
        pendingCODCents += s.codAmount;
      }
    }

    return {
      expectedCODCents,
      collectedCODCents,
      pendingCODCents,
      codDiscrepancyCents,
      settlementReadyCount,
    };
  }
}

export default CODReconciliationService;
