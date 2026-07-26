import { DeliveryRuleRepository } from "../repositories/delivery-rule-repository";
import type { DeliveryZone, ShippingRule, DeliveryCostRule } from "../domain/delivery-rule-entity";

export class ShippingRuleService {
  private readonly ruleRepository: DeliveryRuleRepository;

  constructor() {
    this.ruleRepository = new DeliveryRuleRepository();
  }

  async listZones(): Promise<DeliveryZone[]> {
    return this.ruleRepository.listZones();
  }

  async listShippingRules(): Promise<ShippingRule[]> {
    return this.ruleRepository.listShippingRules();
  }

  async listCostRules(): Promise<DeliveryCostRule[]> {
    return this.ruleRepository.listCostRules();
  }

  async createZone(
    data: Omit<DeliveryZone, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">,
  ): Promise<DeliveryZone> {
    return this.ruleRepository.create({ ...data, status: "active" } as any);
  }

  async createShippingRule(
    data: Omit<ShippingRule, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">,
  ): Promise<ShippingRule> {
    return this.ruleRepository.createShippingRule({ ...data, status: "active" });
  }

  async createCostRule(
    data: Omit<DeliveryCostRule, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">,
  ): Promise<DeliveryCostRule> {
    return this.ruleRepository.createCostRule({ ...data, status: "active" });
  }

  async calculateDeliveryCost(
    weightGrams: number,
    deliveryZone: string,
    provider: string,
  ): Promise<number> {
    const rules = await this.listCostRules();
    const matchingRule = rules.find(
      (r) => r.active && (r.courierProvider === provider || !r.courierProvider),
    );

    if (!matchingRule) {
      // Default flat rate if no cost rule matches
      return deliveryZone === "outside_city" ? 12000 : 6000;
    }

    let cost = matchingRule.baseCostCents;
    if (
      matchingRule.extraWeightUnitGrams &&
      matchingRule.extraWeightCostCents &&
      weightGrams > 1000
    ) {
      const extraGrams = weightGrams - 1000;
      const extraUnits = Math.ceil(extraGrams / matchingRule.extraWeightUnitGrams);
      cost += extraUnits * matchingRule.extraWeightCostCents;
    }

    return cost;
  }
}

export default ShippingRuleService;
