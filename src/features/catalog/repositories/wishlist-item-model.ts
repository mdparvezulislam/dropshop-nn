import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/shared/lib/database/base-schema";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface WishlistItemDBFields {
  userId: string;
  productId: string;
}

export type WishlistItemDocument = BaseDocument & WishlistItemDBFields;

const { status: _, ...wishlistBaseFields } = baseFieldsDefinition;

const wishlistItemSchema = new Schema<WishlistItemDocument>(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    ...wishlistBaseFields,
  },
  { ...baseSchemaOptions, collection: "wishlist_items" },
);

wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });
wishlistItemSchema.plugin(softDeletePlugin);

export const WishlistItemModel =
  mongoose.models.WishlistItem || mongoose.model<WishlistItemDocument>("WishlistItem", wishlistItemSchema);
export default WishlistItemModel;
