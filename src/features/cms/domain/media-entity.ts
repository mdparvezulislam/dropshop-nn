import type { BaseDBEntity } from "@/shared/lib/database/types";

export type MediaType = "image" | "video" | "pdf" | "document" | "other";

export interface MediaAsset extends BaseDBEntity {
  name: string;
  url: string;
  type: MediaType;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  folder?: string;
  tags: string[];
  uploadedBy?: string;
  imagekitFileId?: string;
}
