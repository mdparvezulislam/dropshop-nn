import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface BrandDBFields {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
}

export type BrandDocument = BaseDocument & BrandDBFields;

const brandSchema = new Schema<BrandDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String, required: false },
    description: { type: String, required: false },
    website: { type: String, required: false },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

brandSchema.plugin(softDeletePlugin);

export const BrandModel =
  mongoose.models.CatalogBrand || mongoose.model<BrandDocument>("CatalogBrand", brandSchema);

export interface CategoryDBFields {
  name: string;
  slug: string;
  parentCategoryId?: mongoose.Types.ObjectId | null;
  description?: string;
  image?: string;
  sortOrder: number;
}

export type CategoryDocument = BaseDocument & CategoryDBFields;

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "CatalogCategory",
      default: null,
      index: true,
    },
    description: { type: String, required: false },
    image: { type: String, required: false },
    sortOrder: { type: Number, default: 0 },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

categorySchema.plugin(softDeletePlugin);

export const CategoryModel =
  mongoose.models.CatalogCategory ||
  mongoose.model<CategoryDocument>("CatalogCategory", categorySchema);

export interface CollectionDBFields {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  productIds: mongoose.Types.ObjectId[];
}

export type CollectionDocument = BaseDocument & CollectionDBFields;

const collectionSchema = new Schema<CollectionDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: false },
    image: { type: String, required: false },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    productIds: [{ type: Schema.Types.ObjectId, ref: "CatalogProduct" }],
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

collectionSchema.plugin(softDeletePlugin);

export const CollectionModel =
  mongoose.models.CatalogCollection ||
  mongoose.model<CollectionDocument>("CatalogCollection", collectionSchema);

export interface ProductTagDBFields {
  name: string;
  slug: string;
}

export type ProductTagDocument = BaseDocument & ProductTagDBFields;

const productTagSchema = new Schema<ProductTagDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

productTagSchema.plugin(softDeletePlugin);

export const ProductTagModel =
  mongoose.models.CatalogTag || mongoose.model<ProductTagDocument>("CatalogTag", productTagSchema);
