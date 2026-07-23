import { BaseRepository } from "@/lib/database/generic-repository";
import { MediaAssetModel, type MediaMongoDocument } from "./media-model";
import type { MediaAsset, MediaType } from "../domain/media-entity";
import type { PaginationParams, SortParams, PaginatedResult } from "@/types";

function toDomain(doc: any): MediaAsset {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    width: doc.width,
    height: doc.height,
    altText: doc.altText,
    caption: doc.caption,
    folder: doc.folder,
    tags: doc.tags || [],
    uploadedBy: doc.uploadedBy,
    imagekitFileId: doc.imagekitFileId,
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

export interface MediaFilter {
  type?: MediaType;
  folder?: string;
  search?: string;
  tags?: string[];
}

export class MediaAssetRepository extends BaseRepository<MediaMongoDocument, MediaAsset> {
  constructor() {
    super(MediaAssetModel as any, toDomain);
  }

  async list(
    filter: MediaFilter = {},
    pagination: PaginationParams = { page: 1, limit: 24 },
    sort?: SortParams,
  ): Promise<PaginatedResult<MediaAsset>> {
    const dbFilter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (filter.type) dbFilter.type = filter.type;
    if (filter.folder) dbFilter.folder = filter.folder;
    if (filter.tags?.length) dbFilter.tags = { $in: filter.tags };
    if (filter.search) {
      dbFilter.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { altText: { $regex: filter.search, $options: "i" } },
        { tags: { $regex: filter.search, $options: "i" } },
      ];
    }
    return this.findPaginated(dbFilter, pagination, sort);
  }

  async listFolders(): Promise<string[]> {
    const folders = await MediaAssetModel.distinct("folder", { isDeleted: { $ne: true } });
    return (folders as string[]).filter(Boolean).sort();
  }
}

export default MediaAssetRepository;
