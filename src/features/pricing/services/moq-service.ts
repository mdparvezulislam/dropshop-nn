import { MoqTierRepository } from "../repositories/moq-repository";
import { MoqTier, MoqTierEntry } from "../domain/moq-entity";
import { NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";

export class MoqService {
  private readonly repo = new MoqTierRepository();

  async getTiers(productId: string, variantSku?: string): Promise<MoqTier | null> {
    return this.repo.findByProduct(productId, variantSku);
  }

  async setTiers(data: Partial<MoqTier>, actorId?: string): Promise<MoqTier> {
    const existing = await this.repo.findByProduct(data.productId!, data.variantSku);
    if (existing) {
      logger.info("MoqService: updating tiers", { productId: data.productId });
      return this.repo.update(existing.id, { ...data, updatedBy: actorId } as any);
    }
    logger.info("MoqService: creating tiers", { productId: data.productId });
    return this.repo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async deleteTiers(productId: string, variantSku?: string): Promise<boolean> {
    const existing = await this.repo.findByProduct(productId, variantSku);
    if (!existing) throw new NotFoundError("MOQ tiers not found");
    return this.repo.delete(existing.id);
  }

  resolveTierPrice(tiers: MoqTierEntry[], quantity: number): { price: number; tier: MoqTierEntry | null } {
    const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
    for (const tier of sorted) {
      if (quantity >= tier.minQuantity) {
        if (!tier.maxQuantity || quantity <= tier.maxQuantity) {
          return { price: tier.price, tier };
        }
      }
    }
    return { price: 0, tier: null };
  }
}
