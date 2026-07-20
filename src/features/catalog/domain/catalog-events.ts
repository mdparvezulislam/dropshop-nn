export const CATALOG_EVENTS = {
  PRODUCT_CREATED: "catalog.product.created",
  PRODUCT_UPDATED: "catalog.product.updated",
  PRODUCT_DELETED: "catalog.product.deleted",
  PRODUCT_PUBLISHED: "catalog.product.published",
  PRODUCT_ARCHIVED: "catalog.product.archived",
  VARIANT_CREATED: "catalog.variant.created",
  VARIANT_UPDATED: "catalog.variant.updated",
  MEDIA_UPDATED: "catalog.media.updated",
  SEO_UPDATED: "catalog.seo.updated",
  VISIBILITY_CHANGED: "catalog.visibility.changed",
  CLASSIFICATION_CHANGED: "catalog.classification.changed",
} as const;

export type CatalogEventType = (typeof CATALOG_EVENTS)[keyof typeof CATALOG_EVENTS];

export interface ProductCreatedPayload {
  productId: string;
  name: string;
  sku: string;
  slug: string;
  brandId?: string;
  categoryId?: string;
  status: string;
  visibility: string;
  createdAt: string;
}

export interface ProductUpdatedPayload {
  productId: string;
  sku: string;
  changedFields: string[];
  updatedAt: string;
}

export interface ProductDeletedPayload {
  productId: string;
  sku: string;
  deletedAt: string;
}

export interface ProductPublishedPayload {
  productId: string;
  name: string;
  sku: string;
  visibility: string;
  publishedAt: string;
}

export interface ProductArchivedPayload {
  productId: string;
  name: string;
  sku: string;
  reason?: string;
  archivedAt: string;
}

export interface VariantCreatedPayload {
  productId: string;
  variantSku: string;
  dimensions: Record<string, string>;
}

export interface VariantUpdatedPayload {
  productId: string;
  variantSku: string;
  changedFields: string[];
}

export interface MediaUpdatedPayload {
  productId: string;
  mediaCount: number;
}

export interface SEOUpdatedPayload {
  productId: string;
  changedFields: string[];
}

export interface VisibilityChangedPayload {
  productId: string;
  oldVisibility: string;
  newVisibility: string;
}

export interface ClassificationChangedPayload {
  productId: string;
  brandId?: string;
  categoryId?: string;
}

export type CatalogEventPayloads = {
  [CATALOG_EVENTS.PRODUCT_CREATED]: ProductCreatedPayload;
  [CATALOG_EVENTS.PRODUCT_UPDATED]: ProductUpdatedPayload;
  [CATALOG_EVENTS.PRODUCT_DELETED]: ProductDeletedPayload;
  [CATALOG_EVENTS.PRODUCT_PUBLISHED]: ProductPublishedPayload;
  [CATALOG_EVENTS.PRODUCT_ARCHIVED]: ProductArchivedPayload;
  [CATALOG_EVENTS.VARIANT_CREATED]: VariantCreatedPayload;
  [CATALOG_EVENTS.VARIANT_UPDATED]: VariantUpdatedPayload;
  [CATALOG_EVENTS.MEDIA_UPDATED]: MediaUpdatedPayload;
  [CATALOG_EVENTS.SEO_UPDATED]: SEOUpdatedPayload;
  [CATALOG_EVENTS.VISIBILITY_CHANGED]: VisibilityChangedPayload;
  [CATALOG_EVENTS.CLASSIFICATION_CHANGED]: ClassificationChangedPayload;
};
