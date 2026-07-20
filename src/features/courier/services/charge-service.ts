export interface DeliveryChargeInput {
  deliveryZone: "inside_city" | "outside_city" | "sub_city" | "remote_area";
  parcelWeight: number; // in grams
  codAmount: number; // in cents
}

export interface DeliveryChargeBreakdown {
  deliveryCharge: number; // in cents
  codCharge: number; // in cents
  totalCharge: number; // in cents
}

export class ChargeService {
  /**
   * Calculates shipment delivery and COD fees based on zone, weight, and codAmount.
   */
  async calculateCharges(input: DeliveryChargeInput): Promise<DeliveryChargeBreakdown> {
    const { deliveryZone, parcelWeight, codAmount } = input;

    // 1. Resolve base delivery charge by zone
    let baseDeliveryCharge = 6000; // default 60 BDT
    if (deliveryZone === "outside_city") {
      baseDeliveryCharge = 12000; // 120 BDT
    } else if (deliveryZone === "sub_city") {
      baseDeliveryCharge = 10000; // 100 BDT
    } else if (deliveryZone === "remote_area") {
      baseDeliveryCharge = 15000; // 150 BDT
    }

    // 2. Weight Incremental Rates: Base 1kg (1000g)
    // Extra weight charge: 20 BDT (2000 cents) per extra 500g
    let weightCharge = 0;
    const baseWeightLimit = 1000; // 1kg
    if (parcelWeight > baseWeightLimit) {
      const extraWeight = parcelWeight - baseWeightLimit;
      const extraTiers = Math.ceil(extraWeight / 500);
      weightCharge = extraTiers * 2000; // 20 BDT per 500g
    }

    const deliveryCharge = baseDeliveryCharge + weightCharge;

    // 3. COD Charge: 1% of COD amount for outside_city / sub_city, min 10 BDT (1000 cents)
    let codCharge = 0;
    if (deliveryZone !== "inside_city" && codAmount > 0) {
      const computedCodCharge = Math.floor(codAmount * 0.01);
      codCharge = Math.max(1000, computedCodCharge);
    }

    return {
      deliveryCharge,
      codCharge,
      totalCharge: deliveryCharge + codCharge,
    };
  }
}

export default ChargeService;
