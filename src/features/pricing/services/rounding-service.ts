import { CalculatedPrice } from "./pricing-engine-service";

export class RoundingService {
  roundPrice(price: number, roundTo: number = 1): number {
    if (roundTo <= 1) return price;
    return Math.round(price / roundTo) * roundTo;
  }

  roundPrices(result: CalculatedPrice, roundTo?: number): CalculatedPrice {
    const target = roundTo ?? 1;
    if (target <= 1) return result;

    return {
      ...result,
      unitPrice: this.roundPrice(result.unitPrice, target),
      totalPrice: this.roundPrice(result.totalPrice, target),
      roundedPrice: this.roundPrice(result.unitPrice, target),
      profitAmount: this.roundPrice(result.profitAmount, 1),
      profitMargin: Math.round(result.profitMargin * 100) / 100,
    };
  }
}
