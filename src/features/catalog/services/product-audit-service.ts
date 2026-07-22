import { ProductAuditRepository } from "../repositories/product-audit-repository";
import { logger } from "@/shared/utils/logger";

export interface AuditInput {
  productId: string;
  action: string;
  editorId?: string;
  editorName?: string;
  changedFields?: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  summary?: string;
}

export class ProductAuditService {
  private readonly auditRepository: ProductAuditRepository;

  constructor() {
    this.auditRepository = new ProductAuditRepository();
  }

  async record(input: AuditInput): Promise<void> {
    try {
      await this.auditRepository.create({
        ...input,
        changedFields: input.changedFields ?? [],
      } as any);
    } catch (err) {
      logger.error("ProductAuditService: failed to record audit", err);
    }
  }

  async getByProduct(productId: string): Promise<any[]> {
    return this.auditRepository.findByProduct(productId);
  }

  async getRecent(limit: number = 20): Promise<any[]> {
    return this.auditRepository.getRecent(limit);
  }

  async getStats(): Promise<Record<string, number>> {
    const all = await this.auditRepository.getRecent(1000);
    const stats: Record<string, number> = {};
    for (const entry of all) {
      stats[entry.action] = (stats[entry.action] ?? 0) + 1;
    }
    return stats;
  }
}
