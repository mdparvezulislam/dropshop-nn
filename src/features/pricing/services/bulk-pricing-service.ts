import { PricingService } from "./pricing-service";
import { PricingProfileService } from "./profile-service";
import { PricingEngineService } from "./pricing-engine-service";
import { logger } from "@/lib/utils/logger";

export interface BulkOperation {
  type: "increase_percent" | "decrease_percent" | "fixed_amount" | "round_price" | "assign_profile";
  value: number;
  field: "sellingPrice" | "wholesalePrice" | "resellerPrice";
}

export interface BulkFilter {
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  collectionId?: string;
  profileId?: string;
  productIds?: string[];
}

export class BulkPricingService {
  private readonly pricingService = new PricingService();
  private readonly engine = new PricingEngineService();

  async bulkUpdateByFilter(
    filter: BulkFilter,
    operation: BulkOperation,
    actorId?: string,
  ): Promise<{ updated: number; errors: string[] }> {
    logger.info("BulkPricingService: bulk update", { filter, operation });
    const dbFilter: Record<string, unknown> = {};
    if (filter.categoryId) dbFilter["ruleConfig.categoryId"] = filter.categoryId;
    if (filter.brandId) dbFilter["ruleConfig.brandId"] = filter.brandId;
    if (filter.supplierId) dbFilter["ruleConfig.supplierId"] = filter.supplierId;
    if (filter.productIds) dbFilter.productId = { $in: filter.productIds };

    const allPricing = await this.pricingService.exportPricing(dbFilter);
    let updated = 0;
    const errors: string[] = [];

    for (const pricing of allPricing) {
      try {
        const currentValue = this.getFieldValue(pricing, operation.field);
        if (currentValue === undefined) continue;

        let newValue = currentValue;
        switch (operation.type) {
          case "increase_percent":
            newValue = Math.round(currentValue * (1 + operation.value / 100));
            break;
          case "decrease_percent":
            newValue = Math.round(currentValue * (1 - operation.value / 100));
            break;
          case "fixed_amount":
            newValue = currentValue + operation.value;
            break;
          case "round_price":
            newValue = Math.round(currentValue / operation.value) * operation.value;
            break;
          case "assign_profile":
            break;
        }

        if (newValue !== currentValue) {
          const check = await this.engine.checkPriceProtection(
            pricing.productId,
            newValue,
            "customer",
          );
          if (!check.allowed && check.blocks.length > 0) {
            errors.push(`Blocked: ${pricing.productId} - ${check.blocks[0]}`);
            continue;
          }

          if (operation.type === "assign_profile") {
            await this.pricingService.updatePricing(
              pricing.id,
              {
                ruleConfig: { ...pricing.ruleConfig },
                pricingRule: "dynamic",
              } as any,
              actorId,
            );
          } else {
            await this.pricingService.updatePricing(
              pricing.id,
              {
                [operation.field]: newValue,
                pricingRule: "fixed",
              } as any,
              actorId,
            );
          }
          updated++;
        }
      } catch (err: any) {
        errors.push(`${pricing.productId}: ${err.message}`);
      }
    }

    return { updated, errors };
  }

  private getFieldValue(pricing: any, field: string): number | undefined {
    switch (field) {
      case "sellingPrice":
        return pricing.sellingPrice;
      case "wholesalePrice":
        return pricing.wholesalePrice;
      case "resellerPrice":
        return pricing.resellerPrice;
      default:
        return undefined;
    }
  }
}
