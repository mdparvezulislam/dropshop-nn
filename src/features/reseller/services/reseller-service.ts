import { ResellerRepository } from "../repositories/reseller-repository";
import { Reseller, ResellerStatus } from "../domain/reseller-entity";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";
import { CreateResellerInput, UpdateResellerInput } from "../types/validation";
import { buildSearchQuery } from "@/shared/lib/database/query-builder";

export class ResellerService {
  private readonly resellerRepository: ResellerRepository;

  constructor() {
    this.resellerRepository = new ResellerRepository();
  }

  async createReseller(data: CreateResellerInput, actorId?: string): Promise<Reseller> {
    logger.info("ResellerService: creating reseller", {
      businessName: data.businessName,
      event: "Reseller Created",
    });

    const [existingEmail, existingPhone] = await Promise.all([
      this.resellerRepository.findByEmail(data.email),
      this.resellerRepository.findByPhone(data.phone),
    ]);

    const errors: Record<string, string[]> = {};
    if (existingEmail) errors["email"] = ["Reseller email is already in use"];
    if (existingPhone) errors["phone"] = ["Reseller phone number is already in use"];
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Reseller validation failed", errors);
    }

    const count = await this.resellerRepository.countAll({});
    const code = `RSL-${String(count + 1).padStart(4, "0")}`;

    const result = await this.resellerRepository.create({
      ...data,
      code,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      alternativePhone: data.alternativePhone || undefined,
      logo: data.logo || undefined,
      coverImage: data.coverImage || undefined,
      nidNumber: data.nidNumber || undefined,
      tradeLicenseNumber: data.tradeLicenseNumber || undefined,
      userId: data.userId || undefined,
      status: "pending",
      nidVerified: false,
      tradeLicenseVerified: false,
      collections: data.collections || [],
      tags: data.tags || [],
      notes: data.notes || undefined,
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<ResellerRepository["create"]>[0]);

    logger.info("ResellerService: reseller created", {
      id: result.id,
      code: result.code,
      event: "Reseller Created",
    });

    return result;
  }

  async updateReseller(id: string, data: UpdateResellerInput, actorId?: string): Promise<Reseller> {
    logger.info("ResellerService: updating reseller", {
      id,
      event: "Reseller Updated",
    });

    const existing = await this.resellerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reseller not found");
    }

    if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
      const conflict = await this.resellerRepository.findByEmail(data.email);
      if (conflict) {
        throw new ValidationError("Email already in use", {
          email: ["Reseller email is already registered"],
        });
      }
    }

    if (data.phone && data.phone !== existing.phone) {
      const conflict = await this.resellerRepository.findByPhone(data.phone);
      if (conflict) {
        throw new ValidationError("Phone already in use", {
          phone: ["Reseller phone is already registered"],
        });
      }
    }

    const result = await this.resellerRepository.update(id, {
      ...data,
      email: data.email ? data.email.toLowerCase().trim() : undefined,
      updatedBy: actorId,
    } as Parameters<ResellerRepository["update"]>[1]);

    logger.info("ResellerService: reseller updated", {
      id: result.id,
      event: "Reseller Updated",
    });

    return result;
  }

  async getResellerById(id: string): Promise<Reseller> {
    const reseller = await this.resellerRepository.findById(id);
    if (!reseller) {
      throw new NotFoundError("Reseller not found");
    }
    return reseller;
  }

  async getResellerByUserId(userId: string): Promise<Reseller | null> {
    return this.resellerRepository.findByUserId(userId);
  }

  async resolveForUser(userId: string, email?: string | null): Promise<Reseller | null> {
    const byUser = await this.resellerRepository.findByUserId(userId);
    if (byUser) return byUser;
    if (email) {
      return this.resellerRepository.findByEmail(email);
    }
    return null;
  }

  async listResellers(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Reseller>> {
    return this.resellerRepository.listResellers(filter, pagination, sort);
  }

  async searchResellers(params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResult<Reseller>> {
    const filter: Record<string, unknown> = {
      ...buildSearchQuery(params.search, [
        "businessName",
        "ownerName",
        "email",
        "phone",
        "code",
        "contactPerson",
      ]),
    };

    if (params.status && params.status !== "all") {
      filter.status = params.status;
    }

    return this.resellerRepository.listResellers(
      filter,
      { page: params.page || 1, limit: params.limit || 10 },
      params.sortBy
        ? { sortBy: params.sortBy, sortOrder: params.sortOrder || "desc" }
        : { sortBy: "createdAt", sortOrder: "desc" },
    );
  }

  async updateStatus(id: string, status: ResellerStatus, actorId?: string): Promise<Reseller> {
    logger.info("ResellerService: updating reseller status", { id, status });

    const existing = await this.resellerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reseller not found");
    }

    return this.resellerRepository.update(id, {
      status,
      updatedBy: actorId,
    } as Parameters<ResellerRepository["update"]>[1]);
  }

  async activate(id: string, actorId?: string): Promise<Reseller> {
    return this.updateStatus(id, "active", actorId);
  }

  async suspend(id: string, actorId?: string): Promise<Reseller> {
    return this.updateStatus(id, "suspended", actorId);
  }

  async archive(id: string, actorId?: string): Promise<Reseller> {
    return this.updateStatus(id, "archived", actorId);
  }

  async softDelete(id: string): Promise<boolean> {
    logger.info("ResellerService: soft deleting reseller", { id });
    return this.resellerRepository.delete(id);
  }
}

export default ResellerService;
