import { BaseRepository } from "@/lib/database/generic-repository";
import {
  SupplierModel,
  SupplierDocumentType,
  SupplierProductMappingModel,
  SupplierProductMappingDocumentType,
} from "./supplier-model";
import { Supplier, SupplierProductMapping } from "../domain/supplier-entity";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class SupplierRepository extends BaseRepository<SupplierDocumentType, Supplier> {
  constructor() {
    super(SupplierModel, SupplierRepository.mapToDomain);
  }

  private static mapToDomain(doc: SupplierDocumentType): Supplier {
    return {
      id: doc._id.toString(),
      code: doc.code,
      businessName: doc.businessName,
      ownerName: doc.ownerName,
      contactPerson: doc.contactPerson,
      email: doc.email,
      phone: doc.phone,
      alternativePhone: doc.alternativePhone,
      facebook: doc.facebook,
      whatsApp: doc.whatsApp,
      website: doc.website,
      logo: doc.logo,
      coverImage: doc.coverImage,
      description: doc.description,
      supplierCategory: doc.supplierCategory as Supplier["supplierCategory"],
      businessType: doc.businessType,
      tradeLicenseNumber: doc.tradeLicenseNumber,
      binNumber: doc.binNumber,
      tinNumber: doc.tinNumber,
      nidVerified: doc.nidVerified,
      businessVerificationStatus: doc.businessVerificationStatus,
      address: {
        country: doc.address.country,
        division: doc.address.division,
        district: doc.address.district,
        upazila: doc.address.upazila,
        area: doc.address.area,
        postalCode: doc.address.postalCode,
        fullAddress: doc.address.fullAddress,
        pickupAddress: doc.address.pickupAddress,
        returnAddress: doc.address.returnAddress,
      },
      status: doc.status,
      contacts: doc.contacts
        ? doc.contacts.map((item: any) => ({
            id: item._id?.toString(),
            name: item.name,
            role: item.role,
            email: item.email,
            phone: item.phone,
            isPrimary: item.isPrimary,
            isEmergency: item.isEmergency,
          }))
        : [],
      banking: doc.banking
        ? {
            bankName: doc.banking.bankName,
            branch: doc.banking.branch,
            accountName: doc.banking.accountName,
            accountNumber: doc.banking.accountNumber,
            routingNumber: doc.banking.routingNumber,
            mobileBankingType: doc.banking.mobileBankingType,
            binanceWalletAddress: doc.banking.binanceWalletAddress,
          }
        : undefined,
      documents: doc.documents
        ? doc.documents.map((item: any) => ({
            id: item._id?.toString(),
            type: item.type,
            url: item.url,
            uploadedAt: item.uploadedAt,
            status: item.status,
          }))
        : [],
      settings: doc.settings
        ? {
            autoAcceptOrders: doc.settings.autoAcceptOrders,
            autoRejectOutOfStock: doc.settings.autoRejectOutOfStock,
            allowBackorders: doc.settings.allowBackorders,
            processingTimeDays: doc.settings.processingTimeDays,
            returnPolicy: doc.settings.returnPolicy,
            warrantyPeriodDays: doc.settings.warrantyPeriodDays,
            shippingTimeDays: doc.settings.shippingTimeDays,
          }
        : undefined,
      performance: doc.performance
        ? {
            completedOrders: doc.performance.completedOrders ?? 0,
            cancelledOrders: doc.performance.cancelledOrders ?? 0,
            averageDeliveryDays: doc.performance.averageDeliveryDays ?? 0,
            returnRate: doc.performance.returnRate ?? 0,
            responseTimeHours: doc.performance.responseTimeHours ?? 0,
            performanceScore: doc.performance.performanceScore ?? 0,
          }
        : undefined,
      tags: doc.tags || undefined,
      notes: doc.notes
        ? doc.notes.map((item: any) => ({
            id: item._id?.toString(),
            content: item.content,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
          }))
        : undefined,
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

  async findByCode(code: string, options?: DatabaseQueryOptions): Promise<Supplier | null> {
    try {
      return this.findOne({ code: code.toUpperCase().trim() }, options);
    } catch (error) {
      logger.error("SupplierRepository findByCode failed", error, { code });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByEmail(email: string, options?: DatabaseQueryOptions): Promise<Supplier | null> {
    try {
      return this.findOne({ email: email.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("SupplierRepository findByEmail failed", error, { email });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByPhone(phone: string, options?: DatabaseQueryOptions): Promise<Supplier | null> {
    try {
      return this.findOne({ phone }, options);
    } catch (error) {
      logger.error("SupplierRepository findByPhone failed", error, { phone });
      throw new DatabaseError("Database search error", error);
    }
  }

  async searchSuppliers(query: string, options?: DatabaseQueryOptions): Promise<Supplier[]> {
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return this.find(
        {
          $or: [
            { businessName: { $regex: escaped, $options: "i" } },
            { code: { $regex: escaped, $options: "i" } },
            { email: { $regex: escaped, $options: "i" } },
            { phone: { $regex: escaped, $options: "i" } },
            { ownerName: { $regex: escaped, $options: "i" } },
            { contactPerson: { $regex: escaped, $options: "i" } },
            { tags: { $regex: escaped, $options: "i" } },
          ],
        },
        options,
      );
    } catch (error) {
      logger.error("SupplierRepository searchSuppliers failed", error, { query });
      throw new DatabaseError("Database search error", error);
    }
  }

  async countAll(filter: object = {}, options?: DatabaseQueryOptions): Promise<number> {
    try {
      return this.count(filter, options);
    } catch (error) {
      logger.error("SupplierRepository countAll failed", error);
      throw new DatabaseError("Database count error", error);
    }
  }
}

export class SupplierProductMappingRepository extends BaseRepository<
  SupplierProductMappingDocumentType,
  SupplierProductMapping
> {
  constructor() {
    super(SupplierProductMappingModel, SupplierProductMappingRepository.mapToDomain);
  }

  private static mapToDomain(doc: SupplierProductMappingDocumentType): SupplierProductMapping {
    return {
      id: doc._id.toString(),
      supplierId: doc.supplierId.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      supplierSku: doc.supplierSku,
      isPrimary: doc.isPrimary,
      priority: doc.priority,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status || "active",
      metadata: doc.metadata
        ? (Object.fromEntries(doc.metadata as unknown as Map<string, unknown>) as Record<
            string,
            string | number | boolean | null | undefined
          >)
        : undefined,
    };
  }

  async findBySupplier(
    supplierId: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierProductMapping[]> {
    try {
      return this.find({ supplierId }, options);
    } catch (error) {
      logger.error("SupplierProductMappingRepository findBySupplier failed", error, { supplierId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByProduct(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierProductMapping[]> {
    try {
      return this.find({ productId }, options);
    } catch (error) {
      logger.error("SupplierProductMappingRepository findByProduct failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findPrimaryByProduct(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierProductMapping | null> {
    try {
      return this.findOne({ productId, isPrimary: true }, options);
    } catch (error) {
      logger.error("SupplierProductMappingRepository findPrimaryByProduct failed", error, {
        productId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export { SupplierProductMappingRepository as SupplierMappingRepository };
export default SupplierRepository;
