export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFields {
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "courier";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export type SortOrder = "asc" | "desc";

export interface SortParams {
  sortBy: string;
  sortOrder: SortOrder;
}

export interface QueryFilter {
  [key: string]: string | number | boolean | string[] | number[] | undefined | null;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SuccessPayload<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorPayload {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface BaseMetadata {
  [key: string]: string | number | boolean | undefined | null;
}
