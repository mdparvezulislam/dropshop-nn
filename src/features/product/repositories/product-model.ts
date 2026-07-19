import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String, required: false },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);
brandSchema.plugin(softDeletePlugin);
export const BrandModel = mongoose.models.Brand || mongoose.model("Brand", brandSchema);

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);
categorySchema.plugin(softDeletePlugin);
export const CategoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);

const productTagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);
productTagSchema.plugin(softDeletePlugin);
export const ProductTagModel =
  mongoose.models.ProductTag || mongoose.model("ProductTag", productTagSchema);

const productVariantSchema = new Schema({
  color: { type: String, required: false },
  size: { type: String, required: false },
  storage: { type: String, required: false },
  ram: { type: String, required: false },
  capacity: { type: String, required: false },
  material: { type: String, required: false },
  sku: { type: String, required: true, unique: true, index: true },
  customAttributes: { type: Map, of: String, default: () => new Map() },
});

const productMediaSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" },
  isFeatured: { type: Boolean, default: false },
  altText: { type: String, required: false },
  sortOrder: { type: Number, default: 0 },
});

const productAttributeSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  group: { type: String, enum: ["specification", "technical", "general"], default: "general" },
});

const productSEOSchema = new Schema({
  metaTitle: { type: String, required: false },
  metaDescription: { type: String, required: false },
  metaKeywords: { type: [String], default: [] },
  ogImage: { type: String, required: false },
  canonicalUrl: { type: String, required: false },
});

export interface ProductDBFields {
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  productModel?: string;
  sku: string;
  barcode?: string;
  gtin?: string;
  brandId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  status: "draft" | "pending_review" | "active" | "inactive" | "archived";
  visibility: "public" | "private" | "hidden" | "supplier_only";
  variants: any[];
  media: any[];
  attributes: any[];
  seo?: any;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

export type ProductDocumentType = BaseDocument & ProductDBFields;

const { status: _, ...productBaseFields } = baseFieldsDefinition;

const productSchema = new Schema<ProductDocumentType>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, required: false },
    fullDescription: { type: String, required: false },
    productModel: { type: String, required: false },
    sku: { type: String, required: true, unique: true, index: true },
    barcode: { type: String, required: false, index: true },
    gtin: { type: String, required: false, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: false },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: false },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    status: {
      type: String,
      enum: ["draft", "pending_review", "active", "inactive", "archived"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "hidden", "supplier_only"],
      default: "public",
    },
    variants: [productVariantSchema],
    media: [productMediaSchema],
    attributes: [productAttributeSchema],
    seo: { type: productSEOSchema, required: false },
    tags: [{ type: String, index: true }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    ...productBaseFields,
  },
  baseSchemaOptions,
);

productSchema.plugin(softDeletePlugin);

export const ProductModel =
  mongoose.models.Product || mongoose.model<ProductDocumentType>("Product", productSchema);
export default ProductModel;
