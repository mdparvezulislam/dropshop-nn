import type { SearchQuery, SearchResult } from "./types";

export interface SearchEngineContract {
  index(entityType: string, entityId: string, data: Record<string, unknown>): Promise<void>;
  update(entityType: string, entityId: string, data: Record<string, unknown>): Promise<void>;
  remove(entityType: string, entityId: string): Promise<void>;
  search<T>(query: SearchQuery): Promise<SearchResult<T>>;
  reindex(entityType: string): Promise<number>;
}

export interface SearchDocument {
  id: string;
  type: string;
  title: string;
  description?: string;
  tags?: string[];
  status?: string;
  visibility?: string;
  price?: number;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}
