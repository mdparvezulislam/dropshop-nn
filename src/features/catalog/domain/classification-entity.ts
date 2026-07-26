import { BaseDBEntity } from "@/lib/database/types";

export interface Brand extends BaseDBEntity {
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  website?: string;
  country?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  /** Denormalised product count, refreshed on read. Not persisted. */
  productCount?: number;
}

export interface Category extends BaseDBEntity {
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  visibility: "public" | "hidden";
  metaTitle?: string;
  metaDescription?: string;
  /** Denormalised product count, refreshed on read. Not persisted. */
  productCount?: number;
}

/** A category plus its resolved ancestry, for hierarchical pickers and breadcrumbs. */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  depth: number;
  /** e.g. "Electronics > Mobile > Accessories" */
  path: string;
}

export interface Collection extends BaseDBEntity {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  productIds: string[];
}

export interface ProductTag extends BaseDBEntity {
  name: string;
  slug: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
  group: "specification" | "technical" | "general";
}
