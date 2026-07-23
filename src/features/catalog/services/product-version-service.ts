import { ProductVersionRepository } from "../repositories/product-version-repository";
import { ProductRepository } from "../repositories/product-repository";
import { logger } from "@/lib/utils/logger";

export class ProductVersionService {
  private readonly versionRepository: ProductVersionRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.versionRepository = new ProductVersionRepository();
    this.productRepository = new ProductRepository();
  }

  async createVersion(productId: string, changedFields: string[], editorId?: string, editorName?: string, reason?: string): Promise<void> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) return;
      const latestVersion = await this.versionRepository.getLatestVersion(productId);
      const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;
      await this.versionRepository.create({
        productId,
        versionNumber,
        snapshot: product as any,
        changedFields,
        editorId,
        editorName,
        reason,
      });
    } catch (err) {
      logger.error("ProductVersionService: failed to create version", err);
    }
  }

  async getVersions(productId: string): Promise<any[]> {
    return this.versionRepository.findByProduct(productId);
  }

  async getVersion(productId: string, versionNumber: number): Promise<any | null> {
    return this.versionRepository.getVersion(productId, versionNumber);
  }

  async compareVersions(productId: string, v1: number, v2: number): Promise<{ added: string[]; removed: string[]; changed: string[] } | null> {
    return this.versionRepository.compareVersions(productId, v1, v2);
  }

  async restoreVersion(productId: string, versionNumber: number, actor?: { id: string; name?: string }): Promise<void> {
    const version = await this.versionRepository.getVersion(productId, versionNumber);
    if (!version) throw new Error("Version not found");
    const snapshot = version.snapshot as Record<string, unknown>;
    await this.productRepository.update(productId, {
      ...snapshot,
      updatedBy: actor?.id,
    } as any);
  }
}
