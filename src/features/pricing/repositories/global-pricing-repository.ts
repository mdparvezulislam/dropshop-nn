import { BaseRepository } from "@/lib/database/generic-repository";
import {
  GlobalPricingRuleModel,
  GlobalPricingRuleDocument,
  CategoryPricingOverrideModel,
  CategoryPricingOverrideDocument,
  BrandPricingOverrideModel,
  BrandPricingOverrideDocument,
  SupplierPricingRuleModel,
  SupplierPricingRuleDocument,
} from "./global-pricing-model";
import {
  GlobalPricingRule,
  CategoryPricingOverride,
  BrandPricingOverride,
  SupplierPricingRule,
  RoundPriceTo,
} from "../domain/global-pricing-entity";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class GlobalPricingRuleRepository extends BaseRepository<
  GlobalPricingRuleDocument,
  GlobalPricingRule
> {
  constructor() {
    super(GlobalPricingRuleModel, GlobalPricingRuleRepository.mapToDomain);
  }

  private static mapToDomain(doc: GlobalPricingRuleDocument): GlobalPricingRule {
    return {
      id: doc._id.toString(),
      name: doc.name,
      channel: doc.channel,
      markupType: doc.markupType,
      markupValue: doc.markupValue,
      roundPriceTo: doc.roundPriceTo as RoundPriceTo | undefined,
      minProfit: doc.minProfit,
      maxDiscount: doc.maxDiscount,
      minMarginPercent: doc.minMarginPercent,
      isActive: doc.isActive,
      priority: doc.priority,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findActiveByChannel(channel: string): Promise<GlobalPricingRule[]> {
    try {
      const docs = await this.find({ channel, isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("GlobalPricingRuleRepository findActiveByChannel failed", error, { channel });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findAllActive(): Promise<GlobalPricingRule[]> {
    try {
      const docs = await this.find({ isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("GlobalPricingRuleRepository findAllActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class CategoryPricingOverrideRepository extends BaseRepository<
  CategoryPricingOverrideDocument,
  CategoryPricingOverride
> {
  constructor() {
    super(CategoryPricingOverrideModel, CategoryPricingOverrideRepository.mapToDomain);
  }

  private static mapToDomain(doc: CategoryPricingOverrideDocument): CategoryPricingOverride {
    return {
      id: doc._id.toString(),
      categoryId: doc.categoryId.toString(),
      categoryName: doc.categoryName,
      markupType: doc.markupType,
      markupValue: doc.markupValue,
      minMarginPercent: doc.minMarginPercent,
      maxDiscountPercent: doc.maxDiscountPercent,
      isActive: doc.isActive,
      priority: doc.priority,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findByCategoryId(categoryId: string): Promise<CategoryPricingOverride | null> {
    try {
      return this.findOne({ categoryId, isActive: true });
    } catch (error) {
      logger.error("CategoryPricingOverrideRepository findByCategoryId failed", error, {
        categoryId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findAllActive(): Promise<CategoryPricingOverride[]> {
    try {
      const docs = await this.find({ isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("CategoryPricingOverrideRepository findAllActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class BrandPricingOverrideRepository extends BaseRepository<
  BrandPricingOverrideDocument,
  BrandPricingOverride
> {
  constructor() {
    super(BrandPricingOverrideModel, BrandPricingOverrideRepository.mapToDomain);
  }

  private static mapToDomain(doc: BrandPricingOverrideDocument): BrandPricingOverride {
    return {
      id: doc._id.toString(),
      brandId: doc.brandId.toString(),
      brandName: doc.brandName,
      channel: doc.channel,
      markupType: doc.markupType,
      markupValue: doc.markupValue,
      minProfitPercent: doc.minProfitPercent,
      maxDiscountPercent: doc.maxDiscountPercent,
      isActive: doc.isActive,
      priority: doc.priority,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findByBrandId(brandId: string): Promise<BrandPricingOverride | null> {
    try {
      return this.findOne({ brandId, isActive: true });
    } catch (error) {
      logger.error("BrandPricingOverrideRepository findByBrandId failed", error, { brandId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findAllActive(): Promise<BrandPricingOverride[]> {
    try {
      const docs = await this.find({ isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("BrandPricingOverrideRepository findAllActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class SupplierPricingRuleRepository extends BaseRepository<
  SupplierPricingRuleDocument,
  SupplierPricingRule
> {
  constructor() {
    super(SupplierPricingRuleModel, SupplierPricingRuleRepository.mapToDomain);
  }

  private static mapToDomain(doc: SupplierPricingRuleDocument): SupplierPricingRule {
    return {
      id: doc._id.toString(),
      supplierId: doc.supplierId.toString(),
      supplierName: doc.supplierName,
      markupType: doc.markupType,
      markupValue: doc.markupValue,
      minMarginPercent: doc.minMarginPercent,
      priority: doc.priority,
      leadCost: doc.leadCost,
      handlingFee: doc.handlingFee,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findBySupplierId(supplierId: string): Promise<SupplierPricingRule | null> {
    try {
      return this.findOne({ supplierId, isActive: true });
    } catch (error) {
      logger.error("SupplierPricingRuleRepository findBySupplierId failed", error, { supplierId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findAllActive(): Promise<SupplierPricingRule[]> {
    try {
      const docs = await this.find({ isActive: true });
      return docs.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("SupplierPricingRuleRepository findAllActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}
