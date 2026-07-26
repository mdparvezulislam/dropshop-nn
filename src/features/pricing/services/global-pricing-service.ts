import {
  GlobalPricingRuleRepository,
  CategoryPricingOverrideRepository,
  BrandPricingOverrideRepository,
  SupplierPricingRuleRepository,
} from "../repositories/global-pricing-repository";
import {
  GlobalPricingRule,
  CategoryPricingOverride,
  BrandPricingOverride,
  SupplierPricingRule,
  MarkupType,
} from "../domain/global-pricing-entity";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

export class GlobalPricingService {
  private readonly globalRepo = new GlobalPricingRuleRepository();
  private readonly categoryRepo = new CategoryPricingOverrideRepository();
  private readonly brandRepo = new BrandPricingOverrideRepository();
  private readonly supplierRepo = new SupplierPricingRuleRepository();

  async listGlobalRules(): Promise<GlobalPricingRule[]> {
    return this.globalRepo.findAllActive();
  }

  async createGlobalRule(
    data: Partial<GlobalPricingRule>,
    actorId?: string,
  ): Promise<GlobalPricingRule> {
    logger.info("GlobalPricingService: creating rule", { name: data.name, channel: data.channel });
    return this.globalRepo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateGlobalRule(
    id: string,
    data: Partial<GlobalPricingRule>,
    actorId?: string,
  ): Promise<GlobalPricingRule> {
    const existing = await this.globalRepo.findById(id);
    if (!existing) throw new NotFoundError("Global pricing rule not found");
    logger.info("GlobalPricingService: updating rule", { id });
    return this.globalRepo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteGlobalRule(id: string): Promise<boolean> {
    return this.globalRepo.delete(id);
  }

  async listCategoryOverrides(): Promise<CategoryPricingOverride[]> {
    return this.categoryRepo.findAllActive();
  }

  async createCategoryOverride(
    data: Partial<CategoryPricingOverride>,
    actorId?: string,
  ): Promise<CategoryPricingOverride> {
    return this.categoryRepo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateCategoryOverride(
    id: string,
    data: Partial<CategoryPricingOverride>,
    actorId?: string,
  ): Promise<CategoryPricingOverride> {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) throw new NotFoundError("Category pricing override not found");
    return this.categoryRepo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteCategoryOverride(id: string): Promise<boolean> {
    return this.categoryRepo.delete(id);
  }

  async listBrandOverrides(): Promise<BrandPricingOverride[]> {
    return this.brandRepo.findAllActive();
  }

  async createBrandOverride(
    data: Partial<BrandPricingOverride>,
    actorId?: string,
  ): Promise<BrandPricingOverride> {
    return this.brandRepo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateBrandOverride(
    id: string,
    data: Partial<BrandPricingOverride>,
    actorId?: string,
  ): Promise<BrandPricingOverride> {
    const existing = await this.brandRepo.findById(id);
    if (!existing) throw new NotFoundError("Brand pricing override not found");
    return this.brandRepo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteBrandOverride(id: string): Promise<boolean> {
    return this.brandRepo.delete(id);
  }

  async listSupplierRules(): Promise<SupplierPricingRule[]> {
    return this.supplierRepo.findAllActive();
  }

  async createSupplierRule(
    data: Partial<SupplierPricingRule>,
    actorId?: string,
  ): Promise<SupplierPricingRule> {
    return this.supplierRepo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateSupplierRule(
    id: string,
    data: Partial<SupplierPricingRule>,
    actorId?: string,
  ): Promise<SupplierPricingRule> {
    const existing = await this.supplierRepo.findById(id);
    if (!existing) throw new NotFoundError("Supplier pricing rule not found");
    return this.supplierRepo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteSupplierRule(id: string): Promise<boolean> {
    return this.supplierRepo.delete(id);
  }
}
