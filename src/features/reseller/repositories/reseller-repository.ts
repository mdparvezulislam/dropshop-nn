import { BaseRepository } from "@/shared/lib/database/generic-repository";
import {
  ResellerModel,
  ResellerDocumentType,
  ResellerProductModel,
  ResellerProductDocumentType,
  ResellerCollectionModel,
  ResellerCollectionDocumentType,
  ResellerProductGroupModel,
  ResellerProductGroupDocumentType,
} from "./reseller-model";
import {
  Reseller,
  ResellerProduct,
  ResellerCollection,
  ResellerProductGroup,
} from "../domain/reseller-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";
import { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";

function mapMetadata(
  metadata: ResellerDocumentType["metadata"],
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!metadata) return undefined;
  return Object.fromEntries(metadata as unknown as Map<string, unknown>) as Record<
    string,
    string | number | boolean | null | undefined
  >;
}

export class ResellerRepository extends BaseRepository<ResellerDocumentType, Reseller> {
  constructor() {
    super(ResellerModel, ResellerRepository.mapToDomain);
  }

  private static mapToDomain(doc: ResellerDocumentType): Reseller {
    return {
      id: doc._id.toString(),
      code: doc.code,
      businessName: doc.businessName,
      ownerName: doc.ownerName,
      contactPerson: doc.contactPerson,
      email: doc.email,
      phone: doc.phone,
      alternativePhone: doc.alternativePhone,
      logo: doc.logo,
      coverImage: doc.coverImage,
      businessType: doc.businessType,
      address: {
        country: doc.address.country,
        division: doc.address.division,
        district: doc.address.district,
        upazila: doc.address.upazila,
        area: doc.address.area,
        postalCode: doc.address.postalCode,
        fullAddress: doc.address.fullAddress,
      },
      nidNumber: doc.nidNumber,
      nidVerified: doc.nidVerified,
      tradeLicenseNumber: doc.tradeLicenseNumber,
      tradeLicenseVerified: doc.tradeLicenseVerified,
      status: doc.status,
      userId: doc.userId?.toString(),
      collections: doc.collections || [],
      tags: doc.tags || [],
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: mapMetadata(doc.metadata),
    };
  }

  async findByEmail(email: string, options?: DatabaseQueryOptions): Promise<Reseller | null> {
    try {
      return this.findOne({ email: email.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("ResellerRepository findByEmail failed", error, { email });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByPhone(phone: string, options?: DatabaseQueryOptions): Promise<Reseller | null> {
    try {
      return this.findOne({ phone: phone.trim() }, options);
    } catch (error) {
      logger.error("ResellerRepository findByPhone failed", error, { phone });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByCode(code: string, options?: DatabaseQueryOptions): Promise<Reseller | null> {
    try {
      return this.findOne({ code: code.toUpperCase().trim() }, options);
    } catch (error) {
      logger.error("ResellerRepository findByCode failed", error, { code });
      throw new DatabaseError("Database search error", error);
    }
  }

  async countAll(filter: object = {}, options?: DatabaseQueryOptions): Promise<number> {
    return this.count(filter, options);
  }

  async listResellers(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
    options?: DatabaseQueryOptions,
  ): Promise<PaginatedResult<Reseller>> {
    return this.findPaginated(filter, pagination, sort, options);
  }
}

export class ResellerProductRepository extends BaseRepository<
  ResellerProductDocumentType,
  ResellerProduct
> {
  constructor() {
    super(ResellerProductModel, ResellerProductRepository.mapToDomain);
  }

  private static mapToDomain(doc: ResellerProductDocumentType): ResellerProduct {
    return {
      id: doc._id.toString(),
      resellerId: doc.resellerId.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      customTitle: doc.customTitle,
      customDescription: doc.customDescription,
      personalNotes: doc.personalNotes,
      sellingStatus: doc.sellingStatus,
      isFavorite: doc.isFavorite,
      isHidden: doc.isHidden,
      collectionIds: doc.collectionIds || [],
      groupIds: doc.groupIds || [],
      tags: doc.tags || [],
      pricing: {
        sellingPrice: doc.pricing.sellingPrice,
        discountAmount: doc.pricing.discountAmount,
        discountPercentage: doc.pricing.discountPercentage,
        recommendedPrice: doc.pricing.recommendedPrice,
        costBasis: doc.pricing.costBasis,
        profitAmount: doc.pricing.profitAmount,
        profitMargin: doc.pricing.profitMargin,
        currency: doc.pricing.currency,
        isCustomPrice: doc.pricing.isCustomPrice,
      },
      assignedAt: doc.assignedAt,
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: mapMetadata(doc.metadata),
    };
  }

  async findByResellerAndProduct(
    resellerId: string,
    productId: string,
    variantSku?: string,
    options?: DatabaseQueryOptions,
  ): Promise<ResellerProduct | null> {
    try {
      const andConditions: object[] = [{ resellerId }, { productId }];
      if (variantSku) {
        andConditions.push({ variantSku: variantSku.toUpperCase().trim() });
      } else {
        andConditions.push({
          $or: [{ variantSku: { $exists: false } }, { variantSku: null }, { variantSku: "" }],
        });
      }
      return this.findOne({ $and: andConditions }, options);
    } catch (error) {
      logger.error("ResellerProductRepository findByResellerAndProduct failed", error, {
        resellerId,
        productId,
        variantSku,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByResellerId(
    resellerId: string,
    options?: DatabaseQueryOptions,
  ): Promise<ResellerProduct[]> {
    try {
      return this.find({ resellerId }, options);
    } catch (error) {
      logger.error("ResellerProductRepository findByResellerId failed", error, { resellerId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async listByReseller(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
    options?: DatabaseQueryOptions,
  ): Promise<PaginatedResult<ResellerProduct>> {
    return this.findPaginated(filter, pagination, sort, options);
  }

  async countByReseller(
    resellerId: string,
    extraFilter: object = {},
    options?: DatabaseQueryOptions,
  ): Promise<number> {
    return this.count({ resellerId, ...extraFilter }, options);
  }
}

export class ResellerCollectionRepository extends BaseRepository<
  ResellerCollectionDocumentType,
  ResellerCollection
> {
  constructor() {
    super(ResellerCollectionModel, ResellerCollectionRepository.mapToDomain);
  }

  private static mapToDomain(doc: ResellerCollectionDocumentType): ResellerCollection {
    return {
      id: doc._id.toString(),
      resellerId: doc.resellerId.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      productIds: (doc.productIds || []).map((id) => id.toString()),
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: mapMetadata(doc.metadata),
    };
  }

  async findByResellerId(
    resellerId: string,
    options?: DatabaseQueryOptions,
  ): Promise<ResellerCollection[]> {
    try {
      return this.find({ resellerId }, options);
    } catch (error) {
      logger.error("ResellerCollectionRepository findByResellerId failed", error, {
        resellerId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class ResellerProductGroupRepository extends BaseRepository<
  ResellerProductGroupDocumentType,
  ResellerProductGroup
> {
  constructor() {
    super(ResellerProductGroupModel, ResellerProductGroupRepository.mapToDomain);
  }

  private static mapToDomain(doc: ResellerProductGroupDocumentType): ResellerProductGroup {
    return {
      id: doc._id.toString(),
      resellerId: doc.resellerId.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      productIds: (doc.productIds || []).map((id) => id.toString()),
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: mapMetadata(doc.metadata),
    };
  }

  async findByResellerId(
    resellerId: string,
    options?: DatabaseQueryOptions,
  ): Promise<ResellerProductGroup[]> {
    try {
      return this.find({ resellerId }, options);
    } catch (error) {
      logger.error("ResellerProductGroupRepository findByResellerId failed", error, {
        resellerId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export default ResellerRepository;
