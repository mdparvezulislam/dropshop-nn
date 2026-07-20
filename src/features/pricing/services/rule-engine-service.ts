import { RuleRepository } from "../repositories/rule-repository";
import { PricingRule, RuleCondition, RuleContext, RuleResult } from "../domain/rule-entity";
import { logger } from "@/shared/utils/logger";
import { NotFoundError } from "@/shared/errors/app-error";

export class RuleEngineService {
  private readonly ruleRepository: RuleRepository;

  constructor() {
    this.ruleRepository = new RuleRepository();
  }

  async evaluate(context: RuleContext, ruleType?: string): Promise<RuleResult[]> {
    logger.info("RuleEngineService: evaluating rules", {
      productId: context.productId,
      role: context.role,
      ruleType,
    });

    const rules = ruleType
      ? await this.ruleRepository.findActiveByType(ruleType)
      : await this.ruleRepository.findAllActive();

    const results: RuleResult[] = [];
    for (const rule of rules) {
      const allConditionsMet = rule.conditions.every((condition) =>
        this.evaluateCondition(condition, context),
      );

      if (allConditionsMet) {
        results.push({
          passed: true,
          ruleId: rule.id,
          ruleName: rule.name,
          actions: rule.actions,
        });
      }
    }

    return results;
  }

  async evaluateSingleRule(ruleId: string, context: RuleContext): Promise<RuleResult> {
    const rule = await this.ruleRepository.findById(ruleId);
    if (!rule) {
      throw new NotFoundError(`Rule not found: ${ruleId}`);
    }

    const allConditionsMet = rule.conditions.every((condition) =>
      this.evaluateCondition(condition, context),
    );

    return {
      passed: allConditionsMet,
      ruleId: rule.id,
      ruleName: rule.name,
      actions: allConditionsMet ? rule.actions : [],
    };
  }

  private evaluateCondition(condition: RuleCondition, context: RuleContext): boolean {
    const fieldValue = this.resolveContextValue(condition.field, context);

    switch (condition.operator) {
      case "eq":
        return fieldValue === condition.value;
      case "neq":
        return fieldValue !== condition.value;
      case "gt":
        return (fieldValue as number) > (condition.value as number);
      case "gte":
        return (fieldValue as number) >= (condition.value as number);
      case "lt":
        return (fieldValue as number) < (condition.value as number);
      case "lte":
        return (fieldValue as number) <= (condition.value as number);
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case "between": {
        if (!Array.isArray(condition.value) || condition.value.length !== 2) return false;
        const [min, max] = condition.value as [number, number];
        const val = fieldValue as number;
        return val >= min && val <= max;
      }
      default:
        return false;
    }
  }

  private resolveContextValue(field: string, context: RuleContext): unknown {
    switch (field) {
      case "role":
        return context.role;
      case "quantity":
        return context.quantity ?? 1;
      case "customPrice":
        return context.customPrice;
      case "currentPrice":
        return context.currentPrice;
      case "campaignCode":
        return context.campaignCode;
      case "currentDate":
        return context.currentDate ?? new Date();
      default:
        return undefined;
    }
  }

  async createRule(
    data: Partial<PricingRule> & { name: string; ruleType: PricingRule["ruleType"] },
    actorId?: string,
  ): Promise<PricingRule> {
    logger.info("RuleEngineService: creating rule", { name: data.name, ruleType: data.ruleType });

    const created = await this.ruleRepository.create({
      ...data,
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<RuleRepository["create"]>[0]);

    return created;
  }

  async updateRule(id: string, data: Partial<PricingRule>, actorId?: string): Promise<PricingRule> {
    logger.info("RuleEngineService: updating rule", { id });

    return this.ruleRepository.update(id, {
      ...data,
      updatedBy: actorId,
    } as Parameters<RuleRepository["update"]>[1]);
  }

  async removeRule(id: string): Promise<boolean> {
    logger.info("RuleEngineService: removing rule", { id });
    return this.ruleRepository.delete(id);
  }

  async getRuleById(id: string): Promise<PricingRule> {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) {
      throw new NotFoundError(`Rule not found: ${id}`);
    }
    return rule;
  }

  async listRules(ruleType?: string): Promise<PricingRule[]> {
    const filter: Record<string, unknown> = {};
    if (ruleType) filter.ruleType = ruleType;
    const rules = await this.ruleRepository.find(filter);
    return rules.sort((a, b) => b.priority - a.priority);
  }
}

export default RuleEngineService;
