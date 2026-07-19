import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { SupplierModel, SupplierDocumentType } from "./supplier-model";
import { Supplier } from "../domain/supplier-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

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
      website: doc.website,
      logo: doc.logo,
      coverImage: doc.coverImage,
      description: doc.description,
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
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

  async countAll(filter: object = {}, options?: DatabaseQueryOptions): Promise<number> {
    try {
      return this.count(filter, options);
    } catch (error) {
      logger.error("SupplierRepository countAll failed", error);
      throw new DatabaseError("Database count error", error);
    }
  }
}
export default SupplierRepository;
