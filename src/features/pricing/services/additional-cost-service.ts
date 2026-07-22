import { AdditionalCostRepository } from "../repositories/additional-cost-repository";
import { resolveCostBasis } from "@/shared/utils/number-utils";

export class AdditionalCostService {
  private readonly repo: AdditionalCostRepository;

  constructor() {
    this.repo = new AdditionalCostRepository();
  }

  async getTotalAdditionalCosts(productId: string, variantSku?: string, costBasis?: number): Promise<number> {
    const costs = await this.repo.findByProduct(productId, variantSku);
    if (costs.length === 0) return 0;

    let total = 0;
    for (const cost of costs) {
      if (cost.isPercentage && cost.percentageOfField) {
        const baseFieldValue = costBasis ?? 0;
        total += Math.round(baseFieldValue * (cost.amount / 100));
      } else {
        total += cost.amount;
      }
    }

    return total;
  }
}
