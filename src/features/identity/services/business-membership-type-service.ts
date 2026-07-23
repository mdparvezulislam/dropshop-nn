import { BusinessMembershipTypeRepository } from "../repositories/business-membership-type-repository";
import { BusinessMembershipTypeEntity, MembershipBenefits } from "../domain/business-membership-entity";
import { logger } from "@/lib/utils/logger";

const DEFAULT_MEMBERSHIP_TYPES: Array<Partial<BusinessMembershipTypeEntity>> = [
  {
    slug: "customer",
    name: "Customer",
    banglaName: "সাধারণ কাস্টমার",
    description: "Standard retail customer with access to standard catalog and retail pricing.",
    icon: "User",
    color: "slate",
    priority: 1,
    approvalRequired: false,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Retail Catalog Access", "Standard Checkout", "In-App Notifications"],
      pricingRules: { ruleType: "retail", discountPercent: 0, marginPercent: 0 },
      minimumOrderAmount: 0,
      discountRules: { minQty: 1, discountPercent: 0 },
      accessRules: ["public_storefront"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "reseller",
    name: "Reseller Partner",
    banglaName: "রিসেলার পার্টনার",
    description: "Dropshipping and online reseller membership with wholesale margins and reseller tools.",
    icon: "Store",
    color: "amber",
    priority: 10,
    approvalRequired: true,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Reseller Wholesale Prices", "Profit Margin Calculator", "Customer Order Dispatch", "Direct Delivery to End Customer"],
      pricingRules: { ruleType: "reseller", discountPercent: 15, marginPercent: 25 },
      minimumOrderAmount: 500,
      discountRules: { minQty: 1, discountPercent: 15 },
      accessRules: ["reseller_portal", "dropship_checkout"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "wholesaler",
    name: "Wholesale Partner",
    banglaName: "হোলসেল পার্টনার",
    description: "Bulk purchaser membership with tiered volume discounts and invoice management.",
    icon: "Building2",
    color: "blue",
    priority: 20,
    approvalRequired: true,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Bulk Tier Pricing", "Credit Invoicing", "Dedicated Account Manager", "Custom Freight Options"],
      pricingRules: { ruleType: "wholesale", discountPercent: 30, marginPercent: 35 },
      minimumOrderAmount: 5000,
      discountRules: { minQty: 10, discountPercent: 30 },
      accessRules: ["wholesale_portal", "bulk_orders"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "dealer",
    name: "Authorized Dealer",
    banglaName: "অথরাইজড ডিলার",
    description: "Regional dealership network membership with priority stock allocation.",
    icon: "Boxes",
    color: "emerald",
    priority: 30,
    approvalRequired: true,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Regional Territory Access", "Priority Stock Reserve", "Custom Branding Collateral"],
      pricingRules: { ruleType: "dealer", discountPercent: 35, marginPercent: 40 },
      minimumOrderAmount: 15000,
      discountRules: { minQty: 25, discountPercent: 35 },
      accessRules: ["dealer_portal", "priority_fulfillment"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "distributor",
    name: "District Distributor",
    banglaName: "জেলা ডিস্ট্রিবিউটর",
    description: "Exclusive district distribution rights with direct factory pricing.",
    icon: "Truck",
    color: "indigo",
    priority: 40,
    approvalRequired: true,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Exclusive District Rights", "Factory Direct Pricing", "Custom Purchase Orders"],
      pricingRules: { ruleType: "distributor", discountPercent: 40, marginPercent: 50 },
      minimumOrderAmount: 50000,
      discountRules: { minQty: 50, discountPercent: 40 },
      accessRules: ["distributor_console", "po_management"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "corporate_buyer",
    name: "Corporate Buyer",
    banglaName: "করপোরেট বায়ার",
    description: "Enterprise and corporate procurement membership with tax invoice support.",
    icon: "Building",
    color: "purple",
    priority: 25,
    approvalRequired: true,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["TIN & BIN Tax Invoices", "Corporate PO Processing", "Net-30 Payment Terms"],
      pricingRules: { ruleType: "corporate", discountPercent: 25, marginPercent: 30 },
      minimumOrderAmount: 20000,
      discountRules: { minQty: 5, discountPercent: 25 },
      accessRules: ["corporate_portal"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "affiliate",
    name: "Affiliate Marketer",
    banglaName: "অ্যাফিলিয়েট মার্কেটর",
    description: "Commission-based referral marketer membership with link tracking.",
    icon: "Share2",
    color: "rose",
    priority: 5,
    approvalRequired: false,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Affiliate Link Tracking", "Commission Dashboard", "Custom Promo Codes"],
      pricingRules: { ruleType: "affiliate", discountPercent: 5, marginPercent: 10 },
      minimumOrderAmount: 0,
      discountRules: { minQty: 1, discountPercent: 5 },
      accessRules: ["affiliate_hub"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
  {
    slug: "supplier",
    name: "Supplier / Vendor",
    banglaName: "সাপ্লায়ার / ভেন্ডর",
    description: "Product vendor membership with inventory intake and payout management.",
    icon: "Factory",
    color: "cyan",
    priority: 50,
    approvalRequired: true,
    isActive: true,
    isArchived: false,
    benefits: {
      features: ["Product Listing Rights", "Inventory Intake Console", "Vendor Payout Ledger"],
      pricingRules: { ruleType: "supplier", discountPercent: 0, marginPercent: 0 },
      minimumOrderAmount: 0,
      discountRules: { minQty: 1, discountPercent: 0 },
      accessRules: ["supplier_console"],
      dashboardVisibility: true,
      marketingAccess: true,
    },
  },
];

export class BusinessMembershipTypeService {
  private repo: BusinessMembershipTypeRepository;

  constructor() {
    this.repo = new BusinessMembershipTypeRepository();
  }

  async ensureDefaultTypes(): Promise<void> {
    try {
      for (const item of DEFAULT_MEMBERSHIP_TYPES) {
        if (!item.slug) continue;
        const existing = await this.repo.findBySlug(item.slug);
        if (!existing) {
          await this.repo.create({
            slug: item.slug,
            name: item.name!,
            banglaName: item.banglaName!,
            description: item.description!,
            icon: item.icon || "UserCheck",
            color: item.color || "blue",
            priority: item.priority || 0,
            approvalRequired: item.approvalRequired ?? true,
            isActive: item.isActive ?? true,
            isArchived: false,
            benefits: item.benefits!,
          });
          logger.info(`BusinessMembershipType seeded: ${item.slug}`);
        }
      }
    } catch (error) {
      logger.error("Failed to seed default BusinessMembershipTypes", error);
    }
  }

  async getAllTypes(): Promise<BusinessMembershipTypeEntity[]> {
    await this.ensureDefaultTypes();
    return this.repo.findAllTypes();
  }

  async getActiveTypes(): Promise<BusinessMembershipTypeEntity[]> {
    await this.ensureDefaultTypes();
    return this.repo.findActiveTypes();
  }

  async getTypeBySlug(slug: string): Promise<BusinessMembershipTypeEntity | null> {
    await this.ensureDefaultTypes();
    return this.repo.findBySlug(slug);
  }

  async createType(data: {
    slug: string;
    name: string;
    banglaName: string;
    description: string;
    icon?: string;
    color?: string;
    priority?: number;
    approvalRequired?: boolean;
    isActive?: boolean;
    benefits?: Partial<MembershipBenefits>;
  }): Promise<BusinessMembershipTypeEntity> {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) {
      throw new Error(`Membership Type with slug '${data.slug}' already exists.`);
    }

    const defaultBenefits: MembershipBenefits = {
      features: data.benefits?.features || [],
      pricingRules: {
        ruleType: data.benefits?.pricingRules?.ruleType || data.slug,
        discountPercent: data.benefits?.pricingRules?.discountPercent || 0,
        marginPercent: data.benefits?.pricingRules?.marginPercent || 0,
      },
      minimumOrderAmount: data.benefits?.minimumOrderAmount || 0,
      discountRules: {
        minQty: data.benefits?.discountRules?.minQty || 1,
        discountPercent: data.benefits?.discountRules?.discountPercent || 0,
      },
      accessRules: data.benefits?.accessRules || [],
      dashboardVisibility: data.benefits?.dashboardVisibility ?? true,
      marketingAccess: data.benefits?.marketingAccess ?? false,
    };

    return this.repo.create({
      slug: data.slug.toLowerCase().trim().replace(/\s+/g, "_"),
      name: data.name,
      banglaName: data.banglaName,
      description: data.description,
      icon: data.icon || "UserCheck",
      color: data.color || "blue",
      priority: data.priority || 0,
      approvalRequired: data.approvalRequired ?? true,
      isActive: data.isActive ?? true,
      isArchived: false,
      benefits: defaultBenefits,
    });
  }

  async updateType(
    id: string,
    updates: Partial<BusinessMembershipTypeEntity>,
  ): Promise<BusinessMembershipTypeEntity | null> {
    return this.repo.update(id, updates as never);
  }

  async archiveType(id: string): Promise<BusinessMembershipTypeEntity | null> {
    return this.repo.update(id, { isArchived: true, isActive: false } as never);
  }

  async toggleActive(id: string, isActive: boolean): Promise<BusinessMembershipTypeEntity | null> {
    return this.repo.update(id, { isActive } as never);
  }
}

export default BusinessMembershipTypeService;
