import { BaseRepository } from "@/lib/database/generic-repository";
import {
  BusinessMembershipTypeModel,
  BusinessMembershipTypeDocument,
} from "./business-membership-type-model";
import { BusinessMembershipTypeEntity } from "../domain/business-membership-entity";

export class BusinessMembershipTypeRepository extends BaseRepository<
  BusinessMembershipTypeDocument,
  BusinessMembershipTypeEntity
> {
  constructor() {
    super(BusinessMembershipTypeModel, BusinessMembershipTypeRepository.mapToDomain);
  }

  private static mapToDomain(doc: BusinessMembershipTypeDocument): BusinessMembershipTypeEntity {
    return {
      id: doc._id.toString(),
      slug: doc.slug,
      name: doc.name,
      banglaName: doc.banglaName,
      description: doc.description,
      icon: doc.icon || "UserCheck",
      color: doc.color || "blue",
      priority: doc.priority ?? 0,
      approvalRequired: doc.approvalRequired ?? true,
      isActive: doc.isActive ?? true,
      isArchived: doc.isArchived ?? false,
      benefits: {
        features: doc.benefits?.features || [],
        pricingRules: {
          ruleType: doc.benefits?.pricingRules?.ruleType || "standard",
          discountPercent: doc.benefits?.pricingRules?.discountPercent || 0,
          marginPercent: doc.benefits?.pricingRules?.marginPercent || 0,
        },
        minimumOrderAmount: doc.benefits?.minimumOrderAmount || 0,
        discountRules: {
          minQty: doc.benefits?.discountRules?.minQty || 1,
          discountPercent: doc.benefits?.discountRules?.discountPercent || 0,
        },
        accessRules: doc.benefits?.accessRules || [],
        dashboardVisibility: doc.benefits?.dashboardVisibility ?? true,
        marketingAccess: doc.benefits?.marketingAccess ?? false,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted ?? false,
      status: doc.isActive ? "active" : "suspended",
    };
  }

  async findBySlug(slug: string): Promise<BusinessMembershipTypeEntity | null> {
    return this.findOne({ slug: slug.toLowerCase().trim() });
  }

  async findActiveTypes(): Promise<BusinessMembershipTypeEntity[]> {
    return this.find({ isActive: true, isArchived: false });
  }

  async findAllTypes(): Promise<BusinessMembershipTypeEntity[]> {
    return this.find({ isArchived: false });
  }
}

export default BusinessMembershipTypeRepository;
