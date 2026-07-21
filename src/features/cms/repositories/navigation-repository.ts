import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { NavigationMenuModel, type NavigationMongoDocument } from "./navigation-model";
import type { NavigationItem, NavigationLocation, NavigationMenu } from "../domain/navigation-entity";

function mapItem(item: any): NavigationItem {
  return {
    id: item.id,
    label: item.label,
    href: item.href,
    icon: item.icon,
    openInNewTab: item.openInNewTab,
    roles: item.roles,
    children: item.children?.map(mapItem),
    sortOrder: item.sortOrder ?? 0,
    isVisible: item.isVisible !== false,
  };
}

function toDomain(doc: any): NavigationMenu {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    name: doc.name,
    location: doc.location,
    items: (doc.items || []).map(mapItem),
    isActive: doc.isActive !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
    metadata: doc.metadata ? Object.fromEntries(doc.metadata) : undefined,
  };
}

export class NavigationRepository extends BaseRepository<NavigationMongoDocument, NavigationMenu> {
  constructor() {
    super(NavigationMenuModel as any, toDomain);
  }

  async findByLocation(location: NavigationLocation): Promise<NavigationMenu | null> {
    return this.findOne({ location, isActive: true, isDeleted: { $ne: true } });
  }

  async listAll(): Promise<NavigationMenu[]> {
    return this.find({ isDeleted: { $ne: true } });
  }
}

export default NavigationRepository;
