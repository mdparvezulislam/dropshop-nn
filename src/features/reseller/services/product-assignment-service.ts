import {
  ResellerProductRepository,
  ResellerCollectionRepository,
  ResellerProductGroupRepository,
  ResellerRepository,
} from "../repositories/reseller-repository";
import {
  ResellerProduct,
  ResellerCollection,
  ResellerProductGroup,
  ResellerDashboardStats,
} from "../domain/reseller-entity";
import { ResellerPricingService } from "./reseller-pricing-service";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { generateSlug } from "@/shared/utils/slug-utils";
import { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";
import { normalizeVariantSku } from "@/shared/utils/sku-utils";
import {
  AssignProductInput,
  UpdateResellerProductInput,
  UpdateResellerProductPricingInput,
  CreateCollectionInput,
  CreateProductGroupInput,
} from "../types/validation";

/**
 * Assigns master catalog products into a reseller's private catalog.
 * NEVER writes to the Product collection.
 */
export class ProductAssignmentService {
  private readonly resellerRepository: ResellerRepository;
  private readonly resellerProductRepository: ResellerProductRepository;
  private readonly collectionRepository: ResellerCollectionRepository;
  private readonly groupRepository: ResellerProductGroupRepository;
  private readonly pricingService: ResellerPricingService;

  constructor() {
    this.resellerRepository = new ResellerRepository();
    this.resellerProductRepository = new ResellerProductRepository();
    this.collectionRepository = new ResellerCollectionRepository();
    this.groupRepository = new ResellerProductGroupRepository();
    this.pricingService = new ResellerPricingService();
  }

  /**
   * Optional cost/recommended resolution from platform pricing module (read-only).
   * Falls back to zeros if pricing module unavailable.
   */
  private async resolvePlatformPricing(
    productId: string,
    variantSku?: string,
  ): Promise<{ costBasis: number; recommendedPrice: number; currency: string }> {
    try {
      const { PricingService } = await import("@/features/pricing/services/pricing-service");
      const pricingService = new PricingService();
      const platform = await pricingService.getPricingByProduct(productId, variantSku);
      if (platform) {
        return {
          costBasis:
            platform.resellerPrice || platform.wholesalePrice || platform.baseCostPrice || 0,
          recommendedPrice: platform.resellerPrice || platform.sellingPrice || 0,
          currency: platform.currency || "USD",
        };
      }
    } catch {
      logger.warn("ProductAssignmentService: platform pricing unavailable, using defaults", {
        productId,
      });
    }
    return { costBasis: 0, recommendedPrice: 0, currency: "USD" };
  }

  async assignProduct(data: AssignProductInput, actorId?: string): Promise<ResellerProduct> {
    logger.info("ProductAssignmentService: assigning product to reseller", {
      resellerId: data.resellerId,
      productId: data.productId,
      event: "Product Added",
    });

    const reseller = await this.resellerRepository.findById(data.resellerId);
    if (!reseller) {
      throw new NotFoundError("Reseller not found");
    }
    if (reseller.status === "blocked" || reseller.status === "archived") {
      throw new ValidationError("Cannot assign products to blocked or archived reseller", {
        resellerId: ["Reseller must be pending or active"],
      });
    }

    const variantSku = normalizeVariantSku(data.variantSku);
    const existing = await this.resellerProductRepository.findByResellerAndProduct(
      data.resellerId,
      data.productId,
      variantSku,
    );
    if (existing) {
      throw new ValidationError("Product already in reseller catalog", {
        productId: ["This product is already assigned to the reseller"],
      });
    }

    const platform = await this.resolvePlatformPricing(data.productId, variantSku);
    const sellingPrice =
      data.sellingPrice !== undefined ? data.sellingPrice : platform.recommendedPrice;

    const pricing = this.pricingService.buildPricing({
      sellingPrice,
      costBasis: platform.costBasis,
      recommendedPrice: platform.recommendedPrice,
      currency: platform.currency,
      isCustomPrice: data.sellingPrice !== undefined,
    });

    const result = await this.resellerProductRepository.create({
      resellerId: data.resellerId,
      productId: data.productId,
      variantSku,
      customTitle: data.customTitle || undefined,
      customDescription: data.customDescription || undefined,
      personalNotes: data.personalNotes || undefined,
      sellingStatus: "draft",
      isFavorite: data.isFavorite ?? false,
      isHidden: false,
      collectionIds: data.collectionIds || [],
      groupIds: [],
      tags: data.tags || [],
      pricing,
      assignedAt: new Date(),
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<ResellerProductRepository["create"]>[0]);

    logger.info("ProductAssignmentService: product assigned", {
      id: result.id,
      resellerId: data.resellerId,
      productId: data.productId,
      event: "Product Added",
    });

    return result;
  }

  async removeProduct(resellerProductId: string, actorId?: string): Promise<boolean> {
    logger.info("ProductAssignmentService: removing product from reseller catalog", {
      resellerProductId,
      event: "Product Removed",
      actorId,
    });

    const existing = await this.resellerProductRepository.findById(resellerProductId);
    if (!existing) {
      throw new NotFoundError("Reseller product not found");
    }

    return this.resellerProductRepository.delete(resellerProductId);
  }

  async updateResellerProduct(
    id: string,
    data: UpdateResellerProductInput,
    actorId?: string,
  ): Promise<ResellerProduct> {
    logger.info("ProductAssignmentService: updating reseller product", { id });

    const existing = await this.resellerProductRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reseller product not found");
    }

    const isHidden =
      data.isHidden !== undefined
        ? data.isHidden
        : data.sellingStatus === "hidden"
          ? true
          : existing.isHidden;

    let sellingStatus = data.sellingStatus ?? existing.sellingStatus;
    if (data.isHidden === true) sellingStatus = "hidden";
    if (data.isHidden === false && existing.sellingStatus === "hidden") {
      sellingStatus = "active";
    }

    return this.resellerProductRepository.update(id, {
      ...data,
      isHidden,
      sellingStatus,
      updatedBy: actorId,
    } as Parameters<ResellerProductRepository["update"]>[1]);
  }

  async hideProduct(id: string, actorId?: string): Promise<ResellerProduct> {
    return this.updateResellerProduct(id, { isHidden: true, sellingStatus: "hidden" }, actorId);
  }

  async favoriteProduct(
    id: string,
    isFavorite: boolean,
    actorId?: string,
  ): Promise<ResellerProduct> {
    return this.updateResellerProduct(id, { isFavorite }, actorId);
  }

  async updatePricing(
    id: string,
    data: UpdateResellerProductPricingInput,
    actorId?: string,
  ): Promise<ResellerProduct> {
    logger.info("ProductAssignmentService: updating reseller product price", {
      id,
      event: "Price Updated",
    });

    const existing = await this.resellerProductRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reseller product not found");
    }

    const pricing = this.pricingService.buildPricing({
      sellingPrice: data.sellingPrice,
      costBasis: existing.pricing.costBasis,
      recommendedPrice: existing.pricing.recommendedPrice,
      discountAmount: data.discountAmount,
      discountPercentage: data.discountPercentage,
      currency: data.currency || existing.pricing.currency,
      isCustomPrice: true,
    });

    return this.resellerProductRepository.update(id, {
      pricing,
      updatedBy: actorId,
    } as Parameters<ResellerProductRepository["update"]>[1]);
  }

  async resetPrice(id: string, actorId?: string): Promise<ResellerProduct> {
    logger.info("ProductAssignmentService: resetting reseller price to recommended", {
      id,
      event: "Price Updated",
    });

    const existing = await this.resellerProductRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reseller product not found");
    }

    const platform = await this.resolvePlatformPricing(existing.productId, existing.variantSku);

    const pricing = this.pricingService.resetToRecommended(
      platform.recommendedPrice || existing.pricing.recommendedPrice,
      platform.costBasis || existing.pricing.costBasis,
      platform.currency || existing.pricing.currency,
    );

    return this.resellerProductRepository.update(id, {
      pricing,
      updatedBy: actorId,
    } as Parameters<ResellerProductRepository["update"]>[1]);
  }

  async previewPricing(
    id: string,
    data: UpdateResellerProductPricingInput,
  ): Promise<ReturnType<ResellerPricingService["preview"]>> {
    const existing = await this.resellerProductRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reseller product not found");
    }

    return this.pricingService.preview({
      sellingPrice: data.sellingPrice,
      costBasis: existing.pricing.costBasis,
      recommendedPrice: existing.pricing.recommendedPrice,
      discountAmount: data.discountAmount,
      discountPercentage: data.discountPercentage,
      currency: data.currency || existing.pricing.currency,
    });
  }

  async getResellerProduct(id: string): Promise<ResellerProduct> {
    const item = await this.resellerProductRepository.findById(id);
    if (!item) {
      throw new NotFoundError("Reseller product not found");
    }
    return item;
  }

  async listResellerProducts(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<ResellerProduct>> {
    return this.resellerProductRepository.listByReseller(filter, pagination, sort);
  }

  async searchResellerProducts(params: {
    resellerId: string;
    search?: string;
    sellingStatus?: string;
    isFavorite?: boolean;
    isHidden?: boolean;
    collectionId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResult<ResellerProduct>> {
    const filter: Record<string, unknown> = { resellerId: params.resellerId };

    if (params.sellingStatus && params.sellingStatus !== "all") {
      filter.sellingStatus = params.sellingStatus;
    }
    if (params.isFavorite !== undefined) filter.isFavorite = params.isFavorite;
    if (params.isHidden !== undefined) filter.isHidden = params.isHidden;
    if (params.collectionId) filter.collectionIds = params.collectionId;

    if (params.search) {
      const regex = new RegExp(params.search.trim(), "i");
      filter.$or = [
        { customTitle: regex },
        { customDescription: regex },
        { personalNotes: regex },
        { variantSku: regex },
        { tags: regex },
      ];
    }

    return this.resellerProductRepository.listByReseller(
      filter,
      { page: params.page || 1, limit: params.limit || 10 },
      params.sortBy
        ? { sortBy: params.sortBy, sortOrder: params.sortOrder || "desc" }
        : { sortBy: "assignedAt", sortOrder: "desc" },
    );
  }

  async getDashboardStats(resellerId: string): Promise<ResellerDashboardStats> {
    const [totalProducts, activeProducts, hiddenProducts, favoriteProducts, draftProducts] =
      await Promise.all([
        this.resellerProductRepository.countByReseller(resellerId),
        this.resellerProductRepository.countByReseller(resellerId, {
          sellingStatus: "active",
        }),
        this.resellerProductRepository.countByReseller(resellerId, { isHidden: true }),
        this.resellerProductRepository.countByReseller(resellerId, { isFavorite: true }),
        this.resellerProductRepository.countByReseller(resellerId, {
          sellingStatus: "draft",
        }),
      ]);

    return {
      totalProducts,
      activeProducts,
      hiddenProducts,
      favoriteProducts,
      draftProducts,
      revenueReady: true,
      ordersReady: true,
      walletReady: true,
    };
  }

  async createCollection(
    data: CreateCollectionInput,
    actorId?: string,
  ): Promise<ResellerCollection> {
    const reseller = await this.resellerRepository.findById(data.resellerId);
    if (!reseller) {
      throw new NotFoundError("Reseller not found");
    }

    const slug = generateSlug(data.name);
    return this.collectionRepository.create({
      resellerId: data.resellerId,
      name: data.name.trim(),
      slug,
      description: data.description || undefined,
      productIds: [],
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<ResellerCollectionRepository["create"]>[0]);
  }

  async createProductGroup(
    data: CreateProductGroupInput,
    actorId?: string,
  ): Promise<ResellerProductGroup> {
    const reseller = await this.resellerRepository.findById(data.resellerId);
    if (!reseller) {
      throw new NotFoundError("Reseller not found");
    }

    const slug = generateSlug(data.name);
    return this.groupRepository.create({
      resellerId: data.resellerId,
      name: data.name.trim(),
      slug,
      description: data.description || undefined,
      productIds: [],
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<ResellerProductGroupRepository["create"]>[0]);
  }

  async listCollections(resellerId: string): Promise<ResellerCollection[]> {
    return this.collectionRepository.findByResellerId(resellerId);
  }

  async listProductGroups(resellerId: string): Promise<ResellerProductGroup[]> {
    return this.groupRepository.findByResellerId(resellerId);
  }
}

export default ProductAssignmentService;
