import { SupplierRepository } from "../repositories/supplier-repository";
import { Supplier } from "../domain/supplier-entity";
import { ValidationError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";

export class SupplierService {
  private readonly supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async createSupplier(data: any): Promise<Supplier> {
    logger.info("SupplierService: onboarding new supplier", { name: data.businessName });

    const [existingEmail, existingPhone] = await Promise.all([
      this.supplierRepository.findOne({ email: data.email }),
      this.supplierRepository.findOne({ phone: data.phone }),
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
      nidVerified: false,
      businessVerificationStatus: "unverified",
    });

    logger.info("SupplierService: supplier onboarded successfully", { code, id: newSupplier.id });
    return newSupplier;
  }

  async updateSupplier(id: string, data: any): Promise<Supplier> {
    logger.info("SupplierService: updating supplier details", { id });
    return this.supplierRepository.update(id, data);
  }

  async updateStatus(
    id: string,
    status: "pending" | "active" | "suspended" | "blocked" | "archived",
  ): Promise<Supplier> {
    logger.info("SupplierService: transitioning status", { id, status });
    return this.supplierRepository.update(id, { status });
  }

  async updateSettings(id: string, settings: any): Promise<Supplier> {
    logger.info("SupplierService: updating settings", { id });
    return this.supplierRepository.update(id, { settings });
  }

  async updateBanking(id: string, banking: any): Promise<Supplier> {
    logger.info("SupplierService: updating banking accounts", { id });
    return this.supplierRepository.update(id, { banking });
  }
}
export default SupplierService;
