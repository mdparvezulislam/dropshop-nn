import { ShipmentRepository } from "../repositories/shipment-repository";

export interface DeliveryAnalyticsSummary {
  totalShipments: number;
  todaysShipments: number;
  pendingBooking: number;
  booked: number;
  inTransit: number;
  delivered: number;
  partialDelivered: number;
  cancelled: number;
  returned: number;
  failedBooking: number;
  successRatePercent: number;
  returnRatePercent: number;
  codCollectedCents: number;
  totalDeliveryChargesCents: number;
}

export class DeliveryAnalyticsService {
  private readonly shipmentRepository: ShipmentRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
  }

  async getSummary(): Promise<DeliveryAnalyticsSummary> {
    const { items: all } = await this.shipmentRepository.findWithFilters({ limit: 500 });
    const todayStr = new Date().toISOString().slice(0, 10);

    const todaysShipments = all.filter(
      (s) => s.createdAt && new Date(s.createdAt).toISOString().slice(0, 10) === todayStr,
    ).length;

    const pendingBooking = all.filter(
      (s) => s.status === "pending_booking" || s.status === "draft",
    ).length;
    const booked = all.filter(
      (s) => s.status === "booked" || s.status === "pickup_requested" || s.status === "picked_up",
    ).length;
    const inTransit = all.filter(
      (s) =>
        s.status === "in_transit" || s.status === "hub_received" || s.status === "out_for_delivery",
    ).length;
    const delivered = all.filter((s) => s.status === "delivered").length;
    const partialDelivered = all.filter((s) => s.status === "partial_delivered").length;
    const cancelled = all.filter((s) => s.status === "cancelled").length;
    const returned = all.filter((s) => s.status === "returned").length;
    const failedBooking = all.filter((s) => s.status === "failed").length;

    const total = all.length;
    const successRatePercent =
      total > 0 ? Math.round(((delivered + partialDelivered) / total) * 100) : 100;
    const returnRatePercent = total > 0 ? Math.round((returned / total) * 100) : 0;

    let codCollectedCents = 0;
    let totalDeliveryChargesCents = 0;

    for (const s of all) {
      if (s.status === "delivered" || s.status === "partial_delivered") {
        codCollectedCents += s.codAmount;
      }
      totalDeliveryChargesCents += s.deliveryCharge;
    }

    return {
      totalShipments: total,
      todaysShipments,
      pendingBooking,
      booked,
      inTransit,
      delivered,
      partialDelivered,
      cancelled,
      returned,
      failedBooking,
      successRatePercent,
      returnRatePercent,
      codCollectedCents,
      totalDeliveryChargesCents,
    };
  }
}

export default DeliveryAnalyticsService;
