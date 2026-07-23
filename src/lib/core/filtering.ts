import type { SortOrder } from "./types";

export interface FilterOperator {
  eq?: unknown;
  neq?: unknown;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  in?: unknown[];
  nin?: unknown[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  exists?: boolean;
  between?: [number, number];
}

export type FilterValue = string | number | boolean | Date | null | FilterOperator;

export interface FilterGroup {
  and?: FilterRule[];
  or?: FilterRule[];
}

export interface FilterRule {
  field: string;
  operator: string;
  value: FilterValue;
}

export interface SortRule {
  field: string;
  order: SortOrder;
}

export interface QueryOptions {
  filters?: FilterRule[];
  sort?: SortRule[];
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
}

export interface QueryResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function buildMongoFilter(filters: FilterRule[]): Record<string, unknown> {
  const mongoFilter: Record<string, unknown> = {};

  for (const rule of filters) {
    const { field, operator, value } = rule;

    switch (operator) {
      case "eq":
        mongoFilter[field] = value;
        break;
      case "neq":
        mongoFilter[field] = { $ne: value };
        break;
      case "gt":
        mongoFilter[field] = { $gt: value };
        break;
      case "gte":
        mongoFilter[field] = { $gte: value };
        break;
      case "lt":
        mongoFilter[field] = { $lt: value };
        break;
      case "lte":
        mongoFilter[field] = { $lte: value };
        break;
      case "in":
        mongoFilter[field] = { $in: value as unknown[] };
        break;
      case "nin":
        mongoFilter[field] = { $nin: value as unknown[] };
        break;
      case "contains":
        mongoFilter[field] = { $regex: value as string, $options: "i" };
        break;
      case "startsWith":
        mongoFilter[field] = { $regex: `^${value as string}`, $options: "i" };
        break;
      case "endsWith":
        mongoFilter[field] = { $regex: `${value as string}$`, $options: "i" };
        break;
      case "exists":
        mongoFilter[field] = { $exists: value as boolean };
        break;
      case "between":
        {
          const [min, max] = value as [number, number];
          mongoFilter[field] = { $gte: min, $lte: max };
        }
        break;
      default:
        mongoFilter[field] = value;
    }
  }

  return mongoFilter;
}

export function buildSort(sort: SortRule[]): Record<string, 1 | -1> {
  const result: Record<string, 1 | -1> = {};
  for (const rule of sort) {
    result[rule.field] = rule.order === "asc" ? 1 : -1;
  }
  return result;
}
