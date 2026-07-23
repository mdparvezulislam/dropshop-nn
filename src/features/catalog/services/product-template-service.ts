import { ProductTemplateRepository } from "../repositories/product-template-repository";
import { ProductTemplate } from "../domain/product-template-entity";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { generateSlug } from "@/lib/utils/slug-utils";
import type { ActorInfo } from "@/lib/core/types";

export interface CreateTemplateInput {
  name: string;
  nameBangla: string;
  description?: string;
  iconName?: string;
  categoryId?: string;
  categoryName: string;
  sortOrder?: number;
  specs?: ProductTemplate["specs"];
  attributes?: ProductTemplate["attributes"];
  suggestedTags?: string[];
  suggestedCollections?: string[];
  pricingProfile?: ProductTemplate["pricingProfile"];
  shippingProfile?: ProductTemplate["shippingProfile"];
  warrantyProfile?: ProductTemplate["warrantyProfile"];
  returnPolicy?: string;
  packageIncludes?: string[];
  seoProfile?: ProductTemplate["seoProfile"];
  googleMerchant?: ProductTemplate["googleMerchant"];
  suggestedBulletFeatures?: string[];
}

export class ProductTemplateService {
  private readonly repository: ProductTemplateRepository;

  constructor() {
    this.repository = new ProductTemplateRepository();
  }

  async create(input: CreateTemplateInput, actor?: ActorInfo): Promise<ProductTemplate> {
    logger.info("ProductTemplateService: creating template", { name: input.name });

    const existing = await this.repository.findByName(input.name);
    if (existing) {
      throw new ValidationError("Template name already exists", {
        name: ["A template with this name already exists"],
      });
    }

    const slug = await this.generateUniqueSlug(input.name);

    const template = await this.repository.create({
      name: input.name,
      slug,
      nameBangla: input.nameBangla,
      description: input.description ?? "",
      iconName: input.iconName ?? "Package",
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      isActive: true,
      sortOrder: input.sortOrder ?? 0,
      specs: input.specs ?? [],
      attributes: input.attributes ?? [],
      suggestedTags: input.suggestedTags ?? [],
      suggestedCollections: input.suggestedCollections ?? [],
      pricingProfile: input.pricingProfile ?? {
        retailMultiplier: 1.40,
        wholesaleMultiplier: 1.30,
        resellerMultiplier: 1.22,
        campaignMultiplier: 1.15,
        minMarginPercent: 15,
      },
      shippingProfile: input.shippingProfile ?? {
        weight: 0.5,
        weightUnit: "kg",
        length: 0,
        width: 0,
        height: 0,
        dimensionUnit: "cm",
        shippingClass: "standard",
      },
      warrantyProfile: input.warrantyProfile ?? {
        period: "1 Year",
        periodDays: 365,
        type: "seller",
        description: "",
      },
      returnPolicy: input.returnPolicy ?? "",
      packageIncludes: input.packageIncludes ?? [],
      seoProfile: input.seoProfile ?? {
        metaTitleTemplate: "",
        metaDescriptionTemplate: "",
        focusKeywordSuggestions: [],
      },
      googleMerchant: input.googleMerchant ?? {
        googleProductCategory: "",
        ageGroup: "adult",
        gender: "unisex",
        condition: "new",
      },
      suggestedBulletFeatures: input.suggestedBulletFeatures ?? [],
      createdBy: actor?.id,
      updatedBy: actor?.id,
    } as Parameters<ProductTemplateRepository["create"]>[0]);

    logger.info("ProductTemplateService: template created", { id: template.id, name: template.name });
    return template;
  }

  async findById(id: string): Promise<ProductTemplate> {
    const template = await this.repository.findById(id);
    if (!template) throw new NotFoundError("Product template not found");
    return template;
  }

  async findBySlug(slug: string): Promise<ProductTemplate | null> {
    return this.repository.findBySlug(slug);
  }

  async findActive(): Promise<ProductTemplate[]> {
    return this.repository.findActive();
  }

  async findByCategory(categoryName: string): Promise<ProductTemplate[]> {
    return this.repository.findByCategory(categoryName);
  }

  async search(query: string): Promise<ProductTemplate[]> {
    return this.repository.search(query);
  }

  async listAll(): Promise<ProductTemplate[]> {
    return this.repository.find({ isActive: true } as any);
  }

  async update(id: string, data: Partial<CreateTemplateInput>, actor?: ActorInfo): Promise<ProductTemplate> {
    logger.info("ProductTemplateService: updating template", { id });

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Product template not found");

    const updateData: Record<string, any> = { updatedBy: actor?.id };

    if (data.name && data.name !== existing.name) {
      const dup = await this.repository.findByName(data.name);
      if (dup) throw new ValidationError("Template name already exists", { name: ["Name is taken"] });
      updateData.name = data.name;
      updateData.slug = await this.generateUniqueSlug(data.name);
    }

    const allowedFields = [
      "nameBangla", "description", "iconName", "categoryId", "categoryName",
      "isActive", "sortOrder", "specs", "attributes", "suggestedTags",
      "suggestedCollections", "pricingProfile", "shippingProfile", "warrantyProfile",
      "returnPolicy", "packageIncludes", "seoProfile", "googleMerchant",
      "suggestedBulletFeatures",
    ];

    for (const field of allowedFields) {
      if (data[field as keyof CreateTemplateInput] !== undefined) {
        updateData[field] = data[field as keyof CreateTemplateInput];
      }
    }

    return this.repository.update(id, updateData as Parameters<ProductTemplateRepository["update"]>[1]);
  }

  async delete(id: string): Promise<boolean> {
    logger.info("ProductTemplateService: deleting template", { id });
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Product template not found");
    return this.repository.delete(id);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.repository.findBySlug(uniqueSlug);
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  async countAll(): Promise<number> {
    return this.repository.count({});
  }
}

export default ProductTemplateService;
