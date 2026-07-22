import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ProductTemplateModel, ProductTemplateDocument } from "./product-template-model";
import { ProductTemplate } from "../domain/product-template-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class ProductTemplateRepository extends BaseRepository<ProductTemplateDocument, ProductTemplate> {
  constructor() {
    super(ProductTemplateModel, ProductTemplateRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductTemplateDocument): ProductTemplate {
    return {
      id: doc._id.toString(),
      status: doc.status ?? "active",
      name: doc.name,
      slug: doc.slug,
      nameBangla: doc.nameBangla,
      description: doc.description,
      iconName: doc.iconName,
      categoryId: doc.categoryId?.toString(),
      categoryName: doc.categoryName,
      isActive: doc.isActive,
      sortOrder: doc.sortOrder,
      specs: doc.specs ? doc.specs.map((s: any) => ({
        key: s.key,
        label: s.label,
        type: s.type,
        defaultValue: s.defaultValue,
        options: s.options,
        required: s.required,
        group: s.group,
      })) : [],
      attributes: doc.attributes ? doc.attributes.map((a: any) => ({
        key: a.key,
        label: a.label,
        type: a.type,
        options: a.options,
        required: a.required,
      })) : [],
      suggestedTags: doc.suggestedTags || [],
      suggestedCollections: doc.suggestedCollections || [],
      pricingProfile: doc.pricingProfile ? {
        retailMultiplier: doc.pricingProfile.retailMultiplier ?? 1.40,
        wholesaleMultiplier: doc.pricingProfile.wholesaleMultiplier ?? 1.30,
        resellerMultiplier: doc.pricingProfile.resellerMultiplier ?? 1.22,
        campaignMultiplier: doc.pricingProfile.campaignMultiplier ?? 1.15,
        minMarginPercent: doc.pricingProfile.minMarginPercent ?? 15,
      } : { retailMultiplier: 1.40, wholesaleMultiplier: 1.30, resellerMultiplier: 1.22, campaignMultiplier: 1.15, minMarginPercent: 15 },
      shippingProfile: doc.shippingProfile ? {
        weight: doc.shippingProfile.weight ?? 0.5,
        weightUnit: doc.shippingProfile.weightUnit ?? "kg",
        length: doc.shippingProfile.length ?? 0,
        width: doc.shippingProfile.width ?? 0,
        height: doc.shippingProfile.height ?? 0,
        dimensionUnit: doc.shippingProfile.dimensionUnit ?? "cm",
        shippingClass: doc.shippingProfile.shippingClass ?? "standard",
      } : { weight: 0.5, weightUnit: "kg", length: 0, width: 0, height: 0, dimensionUnit: "cm", shippingClass: "standard" },
      warrantyProfile: doc.warrantyProfile ? {
        period: doc.warrantyProfile.period ?? "1 Year",
        periodDays: doc.warrantyProfile.periodDays ?? 365,
        type: doc.warrantyProfile.type ?? "seller",
        description: doc.warrantyProfile.description ?? "",
      } : { period: "1 Year", periodDays: 365, type: "seller", description: "" },
      returnPolicy: doc.returnPolicy || "",
      packageIncludes: doc.packageIncludes || [],
      seoProfile: doc.seoProfile ? {
        metaTitleTemplate: doc.seoProfile.metaTitleTemplate ?? "",
        metaDescriptionTemplate: doc.seoProfile.metaDescriptionTemplate ?? "",
        focusKeywordSuggestions: doc.seoProfile.focusKeywordSuggestions || [],
      } : { metaTitleTemplate: "", metaDescriptionTemplate: "", focusKeywordSuggestions: [] },
      googleMerchant: doc.googleMerchant ? {
        googleProductCategory: doc.googleMerchant.googleProductCategory ?? "",
        ageGroup: doc.googleMerchant.ageGroup ?? "adult",
        gender: doc.googleMerchant.gender ?? "unisex",
        condition: doc.googleMerchant.condition ?? "new",
      } : { googleProductCategory: "", ageGroup: "adult", gender: "unisex", condition: "new" },
      suggestedBulletFeatures: doc.suggestedBulletFeatures || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findByName(name: string, options?: DatabaseQueryOptions): Promise<ProductTemplate | null> {
    try {
      return this.findOne({ name: name.trim() }, options);
    } catch (error) {
      logger.error("ProductTemplateRepository findByName failed", error, { name });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findBySlug(slug: string, options?: DatabaseQueryOptions): Promise<ProductTemplate | null> {
    try {
      return this.findOne({ slug: slug.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("ProductTemplateRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findActive(options?: DatabaseQueryOptions): Promise<ProductTemplate[]> {
    try {
      return this.find({ isActive: true }, options);
    } catch (error) {
      logger.error("ProductTemplateRepository findActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByCategory(categoryName: string, options?: DatabaseQueryOptions): Promise<ProductTemplate[]> {
    try {
      return this.find({ categoryName: categoryName, isActive: true }, options);
    } catch (error) {
      logger.error("ProductTemplateRepository findByCategory failed", error, { categoryName });
      throw new DatabaseError("Database search error", error);
    }
  }

  async search(query: string, options?: DatabaseQueryOptions): Promise<ProductTemplate[]> {
    try {
      await this.ensureConnected();
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const docs = await this.model
        .find({
          isActive: true,
          $or: [
            { name: { $regex: escaped, $options: "i" } },
            { nameBangla: { $regex: escaped, $options: "i" } },
            { categoryName: { $regex: escaped, $options: "i" } },
          ],
        })
        .sort({ sortOrder: 1, name: 1 })
        .lean()
        .exec();
      return docs.map((doc) => ProductTemplateRepository.mapToDomain(doc as ProductTemplateDocument));
    } catch (error) {
      logger.error("ProductTemplateRepository search failed", error, { query });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export default ProductTemplateRepository;
