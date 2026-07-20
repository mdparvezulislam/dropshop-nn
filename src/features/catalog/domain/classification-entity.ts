import { BaseDBEntity } from "@/shared/lib/database/types";

export interface Brand extends BaseDBEntity {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
}

export interface Category extends BaseDBEntity {
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  description?: string;
  image?: string;
  sortOrder: number;
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
