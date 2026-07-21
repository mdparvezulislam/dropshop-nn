import { NavigationRepository } from "../repositories/navigation-repository";
import type { NavigationLocation, NavigationMenu } from "../domain/navigation-entity";
import type { UpsertNavigationInput } from "../types/validation";
import { NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";

export class NavigationService {
  private readonly repo = new NavigationRepository();

  async list(): Promise<NavigationMenu[]> {
    return this.repo.listAll();
  }

  async getByLocation(location: NavigationLocation): Promise<NavigationMenu | null> {
    return this.repo.findByLocation(location);
  }

  async upsert(input: UpsertNavigationInput, actorId?: string): Promise<NavigationMenu> {
    logger.info("NavigationService: upsert", { location: input.location, name: input.name });

    if (input.id) {
      const existing = await this.repo.findById(input.id);
      if (!existing) throw new NotFoundError("Navigation menu not found");
      return this.repo.update(input.id, {
        name: input.name,
        location: input.location,
        items: input.items as any,
        isActive: input.isActive,
        updatedBy: actorId,
      } as any);
    }

    const byLocation = await this.repo.findByLocation(input.location);
    if (byLocation) {
      return this.repo.update(byLocation.id, {
        name: input.name,
        items: input.items as any,
        isActive: input.isActive,
        updatedBy: actorId,
      } as any);
    }

    return this.repo.create({
      name: input.name,
      location: input.location,
      items: input.items as any,
      isActive: input.isActive ?? true,
      createdBy: actorId,
    } as any);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export default NavigationService;
