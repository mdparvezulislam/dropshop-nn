import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { RuleModel, RuleDocumentType } from "./rule-model";
import { PricingRule, RuleCondition, RuleAction } from "../domain/rule-entity";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class RuleRepository extends BaseRepository<RuleDocumentType, PricingRule> {
  constructor() {
    super(RuleModel, RuleRepository.mapToDomain);
  }

  private static mapToDomain(doc: RuleDocumentType): PricingRule {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      ruleType: doc.ruleType,
      conditions: doc.conditions as RuleCondition[],
      actions: doc.actions as RuleAction[],
      priority: doc.priority,
      isActive: doc.isActive,
      status: doc.status,
      metadata: doc.metadata as Record<string, string | number | boolean | null | undefined> | undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }

  async findActiveByType(ruleType: string): Promise<PricingRule[]> {
    try {
      const docs = await this.find({ ruleType, isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("RuleRepository findActiveByType failed", error, { ruleType });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findAllActive(): Promise<PricingRule[]> {
    try {
      const docs = await this.find({ isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("RuleRepository findAllActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export default RuleRepository;
