import {
  SupplierRepository,
  SupplierProductMappingRepository,
} from "../repositories/supplier-repository";
import {
  Supplier,
  SupplierProductMapping,
  SupplierNote,
  SupplierPerformance,
  SupplierSettings,
} from "../domain/supplier-entity";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { PaginationParams, SortParams, PaginatedResult } from "@/types";

export class SupplierService {
  private readonly supplierRepository: SupplierRepository;
  private readonly productMappingRepository: SupplierProductMappingRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
    this.productMappingRepository = new SupplierProductMappingRepository();
  }

  async createSupplier(
    data: Partial<Supplier> & { email: string; phone: string; businessName: string },
  ): Promise<Supplier> {
    logger.info("SupplierService: onboarding new supplier", { name: data.businessName });

    const [existingEmail, existingPhone] = await Promise.all([
      this.supplierRepository.findByEmail(data.email),
      this.supplierRepository.findByPhone(data.phone),
    ]);

    const errors: Record<string, string[]> = {};
    if (existingEmail) errors["email"] = ["Supplier email is already in use"];
    if (existingPhone) errors["phone"] = ["Supplier phone number is already in use"];

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Onboarding validation failed", errors);
    }

    const count = await this.supplierRepository.countAll({});
    const code = `SPL-${String(count + 1).padStart(4, "0")}`;

    const newSupplier = await this.supplierRepository.create({
      ...data,
      code,
      status: "pending",
      supplierCategory: data.supplierCategory ?? "local_vendor",
      nidVerified: false,
      businessVerificationStatus: "unverified",
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    } as Parameters<SupplierRepository["create"]>[0]);

    logger.info("SupplierService: supplier onboarded successfully", { code, id: newSupplier.id });
    return newSupplier;
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    logger.info("SupplierService: updating supplier details", { id });
    const existing = await this.supplierRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Supplier not found");
    }
    return this.supplierRepository.update(id, {
      ...data,
      updatedBy: data.updatedBy,
    } as Parameters<SupplierRepository["update"]>[1]);
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }
    return supplier;
  }

  async listSuppliers(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Supplier>> {
    return this.supplierRepository.findPaginated(filter, pagination, sort);
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    logger.info("SupplierService: searching suppliers", { query });
    return this.supplierRepository.searchSuppliers(query);
  }

  async updateStatus(
    id: string,
    status: "pending" | "active" | "inactive" | "suspended" | "blocked" | "archived",
  ): Promise<Supplier> {
    logger.info("SupplierService: transitioning status", { id, status });
    return this.supplierRepository.update(id, { status } as Parameters<
      SupplierRepository["update"]
    >[1]);
  }

  async updateSettings(id: string, settings: Partial<SupplierSettings>): Promise<Supplier> {
    logger.info("SupplierService: updating settings", { id });
    return this.supplierRepository.update(id, { settings } as unknown as Parameters<
      SupplierRepository["update"]
    >[1]);
  }

  async updateBanking(id: string, banking: Record<string, unknown>): Promise<Supplier> {
    logger.info("SupplierService: updating banking accounts", { id });
    return this.supplierRepository.update(id, { banking } as unknown as Parameters<
      SupplierRepository["update"]
    >[1]);
  }

  async addNote(id: string, content: string, actorId?: string): Promise<Supplier> {
    logger.info("SupplierService: adding note", { id });
    const note: SupplierNote = {
      content,
      createdBy: actorId,
      createdAt: new Date(),
    };
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError("Supplier not found");
    const notes = [...(supplier.notes || []), note];
    return this.supplierRepository.update(id, { notes } as unknown as Parameters<
      SupplierRepository["update"]
    >[1]);
  }

  async addTags(id: string, tags: string[]): Promise<Supplier> {
    logger.info("SupplierService: adding tags", { id, tags });
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError("Supplier not found");
    const existingTags = new Set(supplier.tags || []);
    tags.forEach((t) => existingTags.add(t));
    return this.supplierRepository.update(id, {
      tags: Array.from(existingTags),
    } as unknown as Parameters<SupplierRepository["update"]>[1]);
  }

  async updatePerformance(
    id: string,
    performance: Partial<SupplierPerformance>,
  ): Promise<Supplier> {
    logger.info("SupplierService: updating performance", { id });
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError("Supplier not found");
    const current = supplier.performance || {
      completedOrders: 0,
      cancelledOrders: 0,
      averageDeliveryDays: 0,
      returnRate: 0,
      responseTimeHours: 0,
      performanceScore: 0,
    };
    return this.supplierRepository.update(id, {
      performance: { ...current, ...performance },
    } as unknown as Parameters<SupplierRepository["update"]>[1]);
  }

  async getSupplierStats(id: string): Promise<{ supplier: Supplier; productCount: number }> {
    const supplier = await this.getSupplierById(id);
    const mappings = await this.productMappingRepository.findBySupplier(id);
    return { supplier, productCount: mappings.length };
  }

  // ─── Product Mapping ────────────────────────────────────

  async mapProduct(
    data: {
      supplierId: string;
      productId: string;
      variantSku?: string;
      supplierSku: string;
      isPrimary?: boolean;
      priority?: number;
      notes?: string;
    },
    actorId?: string,
  ): Promise<SupplierProductMapping> {
    logger.info("SupplierService: mapping product to supplier", {
      supplierId: data.supplierId,
      productId: data.productId,
    });

    if (data.isPrimary) {
      const existing = await this.productMappingRepository.findPrimaryByProduct(data.productId);
      if (existing && existing.supplierId !== data.supplierId) {
        await this.productMappingRepository.update(existing.id, {
          isPrimary: false,
        } as Parameters<SupplierProductMappingRepository["update"]>[1]);
      }
    }

    return this.productMappingRepository.create({
      ...data,
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<SupplierProductMappingRepository["create"]>[0]);
  }

  async updateProductMapping(
    id: string,
    data: Partial<SupplierProductMapping>,
    actorId?: string,
  ): Promise<SupplierProductMapping> {
    logger.info("SupplierService: updating product mapping", { id });
    return this.productMappingRepository.update(id, {
      ...data,
      updatedBy: actorId,
    } as Parameters<SupplierProductMappingRepository["update"]>[1]);
  }

  async removeProductMapping(id: string): Promise<boolean> {
    logger.info("SupplierService: removing product mapping", { id });
    return this.productMappingRepository.delete(id);
  }

  async getSupplierProductMappings(supplierId: string): Promise<SupplierProductMapping[]> {
    return this.productMappingRepository.findBySupplier(supplierId);
  }

  async getProductSuppliers(productId: string): Promise<SupplierProductMapping[]> {
    return this.productMappingRepository.findByProduct(productId);
  }
}

export default SupplierService;
