import { ShipmentRepository } from "@/features/courier/repositories/shipment-repository";
import { SeedLogger } from "../helpers/logger";

export async function seedCourierShipments(): Promise<void> {
  const repo = new ShipmentRepository();

  let count = 0;
  for (let i = 1; i <= 50; i++) {
    const shipmentNumber = `SHP-2026-${String(i).padStart(5, "0")}`;
    const existing = await repo.findByShipmentNumber(shipmentNumber);
    if (!existing) {
      await repo.create({
        shipmentNumber,
        orderId: `order_${i}`,
        orderNumber: `ORD-2026-${String(i).padStart(5, "0")}`,
        courierReference: `PTH-${i}9281`,
        trackingCode: `PT-2026-${String(i).padStart(6, "0")}`,
        provider: "pathao",
        status: i % 2 === 0 ? "delivered" : "in_transit",
        deliveryZone: "inside_city",
        parcelType: "parcel",
        parcelWeight: 1200,
        dimensions: { width: 15, height: 10, depth: 5 },
        codAmount: 350000,
        declaredValue: 350000,
        deliveryCharge: 12000,
        codCharge: 3500,
        history: [
          {
            status: "in_transit",
            timestamp: new Date(Date.now() - 86400000),
            message: "Parcel picked up by Pathao rider",
          },
        ],
      });
      count++;
    }
  }

  SeedLogger.success("Courier shipments & tracking records seeded", count > 0 ? count : 50);
}
