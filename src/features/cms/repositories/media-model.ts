import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const { status: _, ...baseFields } = baseFieldsDefinition;

const mediaSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video", "pdf", "document", "other"],
      required: true,
      index: true,
    },
    mimeType: { type: String },
    fileSize: { type: Number },
    width: { type: Number },
    height: { type: Number },
    altText: { type: String },
    caption: { type: String },
    folder: { type: String, default: "general", index: true },
    tags: [{ type: String }],
    uploadedBy: { type: String },
    imagekitFileId: { type: String },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "cms_media" },
);

mediaSchema.index({ name: "text", altText: "text", tags: "text" });
mediaSchema.plugin(softDeletePlugin);

export type MediaMongoDocument = BaseDocument & {
  name: string;
  url: string;
  type: string;
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
};

export const MediaAssetModel =
  mongoose.models.CmsMediaAsset ||
  mongoose.model<MediaMongoDocument>("CmsMediaAsset", mediaSchema);

export default MediaAssetModel;
