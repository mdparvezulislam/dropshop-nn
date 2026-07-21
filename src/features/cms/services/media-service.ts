import { MediaAssetRepository, type MediaFilter } from "../repositories/media-repository";
import type { MediaAsset } from "../domain/media-entity";
import type { CreateMediaInput } from "../types/validation";
import { getImageKitClient } from "@/shared/lib/imagekit";
import { NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import type { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";

export class MediaService {
  private readonly repo = new MediaAssetRepository();

  getUploadAuthParams(): { token: string; expire: number; signature: string; publicKey: string } {
    const ik = getImageKitClient();
    const auth = ik.getAuthenticationParameters();
    return {
      token: auth.token,
      expire: auth.expire,
      signature: auth.signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    };
  }

  async registerAsset(
    input: CreateMediaInput,
    actorId?: string,
  ): Promise<MediaAsset> {
    logger.info("MediaService: registering asset", { name: input.name, type: input.type });
    return this.repo.create({
      name: input.name,
      url: input.url,
      type: input.type,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      width: input.width,
      height: input.height,
      altText: input.altText || undefined,
      caption: input.caption || undefined,
      folder: input.folder || "general",
      tags: input.tags ?? [],
      uploadedBy: actorId,
      imagekitFileId: input.imagekitFileId,
      createdBy: actorId,
    } as any);
  }

  async updateAsset(
    id: string,
    data: Partial<CreateMediaInput>,
  ): Promise<MediaAsset> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError("Media asset not found");
    return this.repo.update(id, data as any);
  }

  async deleteAsset(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async getById(id: string): Promise<MediaAsset | null> {
    return this.repo.findById(id);
  }

  async list(
    filter: MediaFilter = {},
    pagination: PaginationParams = { page: 1, limit: 24 },
    sort?: SortParams,
  ): Promise<PaginatedResult<MediaAsset>> {
    return this.repo.list(filter, pagination, sort ?? { sortBy: "createdAt", sortOrder: "desc" });
  }

  async listFolders(): Promise<string[]> {
    return this.repo.listFolders();
  }
}

export default MediaService;
