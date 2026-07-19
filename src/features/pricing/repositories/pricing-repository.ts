import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ProductPricingModel, ProductPricingDocumentType } from "./pricing-model";
import { ProductPricing } from "../domain/pricing-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";
import { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";

export class PricingRepository extends BaseRepository<ProductPricingDocumentType, ProductPricing> {
  constructor() {
    super(ProductPricingModel, PricingRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductPricingDocumentType): ProductPricing {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      baseCostPrice: doc.baseCostPrice,
      purchasePrice: doc.purchasePrice,
      supplierPrice: doc.supplierPrice,
      sellingPrice: doc.sellingPrice,
      wholesalePrice: doc.wholesalePrice,
      resellerPrice: doc.resellerPrice,
      comparePrice: doc.comparePrice,
      promotionalPrice: doc.promotionalPrice,
      discountAmount: doc.discountAmount,
      discountPercentage: doc.discountPercentage,
      profitMargin: doc.profitMargin,
      profitAmount: doc.profitAmount,
      currency: doc.currency,
      taxRate: doc.taxRate,
      taxInclusive: doc.taxInclusive,
      commissionRate: doc.commissionRate,
      pricingRule: doc.pricingRule,
      ruleConfig: doc.ruleConfig
        ? {
            baseField: doc.ruleConfig.baseField as
              "baseCostPrice" | "purchasePrice" | "supplierPrice" | "sellingPrice" | undefined,
            percentage: doc.ruleConfig.percentage,
            fixedAmount: doc.ruleConfig.fixedAmount,
            categoryId: doc.ruleConfig.categoryId?.toString(),
            brandId: doc.ruleConfig.brandId?.toString(),
            supplierId: doc.ruleConfig.supplierId?.toString(),
            minMargin: doc.ruleConfig.minMargin,
            maxDiscount: doc.ruleConfig.maxDiscount,
          }
        : undefined,
      status: doc.status,
      effectiveFrom: doc.effectiveFrom,
      effectiveTo: doc.effectiveTo,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata
        ? (Object.fromEntries(doc.metadata as unknown as Map<string, unknown>) as Record<
            string,
            string | number | boolean | null | undefined
          >)
        : undefined,
    };
  }

  async findByProductId(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<ProductPricing[]> {
    try {
      return this.find({ productId }, options);
    } catch (error) {
      logger.error("PricingRepository findByProductId failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByProductAndVariant(
    productId: string,
    variantSku?: string,
    options?: DatabaseQueryOptions,
  ): Promise<ProductPricing | null> {
    try {
      const filter: Record<string, unknown> = { productId };
      if (variantSku) {
        filter.variantSku = variantSku.toUpperCase().trim();
      } else {
        filter.$or = [{ variantSku: { $exists: false } }, { variantSku: null }, { variantSku: "" }];
      }
      return this.findOne(filter, options);
    } catch (error) {
      logger.error("PricingRepository findByProductAndVariant failed", error, {
        productId,
        variantSku,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findActiveByProduct(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<ProductPricing | null> {
    try {
      return this.findOne({ productId, status: "active" }, options);
    } catch (error) {
      logger.error("PricingRepository findActiveByProduct failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async listPricing(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
    options?: DatabaseQueryOptions,
  ): Promise<PaginatedResult<ProductPricing>> {
    return this.findPaginated(filter, pagination, sort, options);
  }
}

export default PricingRepository;
