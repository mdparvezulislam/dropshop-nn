import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

const productVariantSchema = new Schema(
  {
    id: { type: String, required: false },
    name: { type: String, required: false },
    attributes: { type: Map, of: String, default: () => new Map() },
    sku: { type: String, required: true },
    priceAdjustment: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    image: { type: String, required: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isActive: { type: Boolean, default: true },

    // Legacy fields preserved for backward compatibility
    color: { type: String, required: false },
    size: { type: String, required: false },
    storage: { type: String, required: false },
    ram: { type: String, required: false },
    capacity: { type: String, required: false },
    material: { type: String, required: false },
    bundle: { type: String, required: false },
    barcode: { type: String, required: false },
    weight: { type: Number, required: false },
    weightUnit: { type: String, required: false },
    dimensions: {
      length: { type: Number, required: false },
      width: { type: Number, required: false },
      height: { type: Number, required: false },
      unit: { type: String, required: false },
    },
    images: [{ type: String }],
    sortOrder: { type: Number, default: 0 },
    customAttributes: { type: Map, of: String, default: () => new Map() },
  },
  { _id: false },
);

const productMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "document"], default: "image" },
    isFeatured: { type: Boolean, default: false },
    altText: { type: String, required: false },
    caption: { type: String, required: false },
    sortOrder: { type: Number, default: 0 },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
    fileSize: { type: Number, required: false },
    mimeType: { type: String, required: false },
  },
  { _id: false },
);

const productSEOSchema = new Schema(
  {
    metaTitle: { type: String, required: false },
    metaDescription: { type: String, required: false },
    metaKeywords: [{ type: String }],
    canonicalUrl: { type: String, required: false },
    ogTitle: { type: String, required: false },
    ogDescription: { type: String, required: false },
    ogImage: { type: String, required: false },
    ogType: { type: String, required: false },
    twitterTitle: { type: String, required: false },
    twitterDescription: { type: String, required: false },
    twitterImage: { type: String, required: false },
    twitterCardType: { type: String, required: false },
  },
  { _id: false },
);

const productSpecificationSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    group: { type: String, default: "general" },
  },
  { _id: false },
);

const productContentSchema = new Schema(
  {
    richDescription: { type: Schema.Types.Mixed, required: false },
    description: { type: String, required: false },
    highlights: [{ type: String }],
    includedItems: [{ type: String }],
    features: [{ type: String }],
    specifications: [productSpecificationSchema],
    technicalDetails: { type: Schema.Types.Mixed, required: false },
    warrantyInformation: { type: String, required: false },
    returnPolicy: { type: String, required: false },
  },
  { _id: false },
);

const supplierReferenceSchema = new Schema(
  {
    supplierId: { type: String, required: true },
    supplierSku: { type: String, required: false },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const searchMetadataSchema = new Schema(
  {
    searchKeywords: [{ type: String }],
    searchSynonyms: [{ type: String }],
    searchWeight: { type: Number, default: 1.0 },
    popularityScore: { type: Number, default: 0 },
    searchable: { type: Boolean, default: true },
  },
  { _id: false },
);

export interface ProductDBFields {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  gtin?: string;
  productType?: string;
  shortDescription?: string;
  description?: string;
  notice?: string;
  productModel?: string;
  brandId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  supplierId?: mongoose.Types.ObjectId;
  status: string;
  visibility: string;
  badges: string[];
  featured?: boolean;
  trending?: boolean;
  flashSale?: boolean;
  newArrival?: boolean;
  hasVariants?: boolean;
  variants: any[];
  media: any[];
  specifications?: any[];
  metaTitle?: string;
  metaDescription?: string;
  seo?: any;
  content?: any;
  suppliers?: any[];
  searchMetadata?: any;
  tags: string[];
}

export type ProductDocument = BaseDocument & ProductDBFields;

const { status: _, ...productBaseFields } = baseFieldsDefinition;

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    barcode: { type: String, required: false, sparse: true, unique: true, index: true },
    gtin: { type: String, required: false, sparse: true, unique: true, index: true },
    productType: { type: String, default: "simple", index: true },
    shortDescription: { type: String, required: false },
    description: { type: String, required: false },
    notice: { type: String, required: false },
    productModel: { type: String, required: false },
    brandId: { type: Schema.Types.ObjectId, ref: "CatalogBrand", required: false, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CatalogCategory",
      required: false,
      index: true,
    },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: false, index: true },
    status: {
      type: String,
      enum: ["draft", "pending_review", "active", "inactive", "archived"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      default: "public",
      index: true,
    },
    badges: [{ type: String, index: true }],
    featured: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    hasVariants: { type: Boolean, default: false },
    variants: [productVariantSchema],
    media: [productMediaSchema],
    specifications: [productSpecificationSchema],
    metaTitle: { type: String, required: false },
    metaDescription: { type: String, required: false },
    seo: { type: productSEOSchema, required: false },
    content: { type: productContentSchema, required: false },
    suppliers: [supplierReferenceSchema],
    searchMetadata: { type: searchMetadataSchema, default: () => ({}) },
    tags: [{ type: String, index: true }],
    ...productBaseFields,
  },
  baseSchemaOptions,
);

productSchema.plugin(softDeletePlugin);

// Compound & Performance Indexes
productSchema.index({ status: 1, visibility: 1 });
productSchema.index({ badges: 1, status: 1 });
productSchema.index({ featured: -1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export const ProductModel =
  mongoose.models.CatalogProduct ||
  mongoose.model<ProductDocument>("CatalogProduct", productSchema);

export default ProductModel;
