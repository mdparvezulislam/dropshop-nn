export type MediaCollection =
  "public_gallery" | "reseller_marketing_kit" | "wholesale_resources" | "internal_assets";

export type MediaType = "image" | "video" | "document" | "zip";

export interface ProductMediaItem {
  url: string;
  type: MediaType;
  collection: MediaCollection;
  isFeatured: boolean;
  altText?: string;
  sortOrder: number;
}

const COLLECTION_ACCESS: Record<MediaCollection, string[]> = {
  public_gallery: ["guest", "customer", "reseller", "wholesaler", "admin", "super_admin"],
  reseller_marketing_kit: ["reseller", "wholesaler", "admin", "super_admin"],
  wholesale_resources: ["wholesaler", "admin", "super_admin"],
  internal_assets: ["admin", "super_admin"],
};

export class MediaVisibilityService {
  filterMediaByRole(media: ProductMediaItem[], role: string): ProductMediaItem[] {
    return media.filter((item) => {
      const allowedRoles = COLLECTION_ACCESS[item.collection];
      if (!allowedRoles) return true;
      return allowedRoles.includes(role);
    });
  }

  checkAccess(collection: MediaCollection, role: string): boolean {
    const allowedRoles = COLLECTION_ACCESS[collection];
    if (!allowedRoles) return true;
    return allowedRoles.includes(role);
  }
}

export default MediaVisibilityService;
