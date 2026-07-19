import { ClientSession } from "mongoose";
import { PaginationParams, SortParams } from "@/shared/types";
import { DatabaseConnectionManager } from "./connection-manager";
import { logger } from "@/shared/utils/logger";

export interface MongooseParsedOptions {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
}

export function parsePaginationAndSort(
  pagination: PaginationParams,
  sort?: SortParams,
): MongooseParsedOptions {
  const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
  const limit = pagination.limit && pagination.limit > 0 ? pagination.limit : 10;
  const skip = (page - 1) * limit;

  const parsedSort: Record<string, 1 | -1> = {};
  if (sort?.sortBy) {
    parsedSort[sort.sortBy] = sort.sortOrder === "desc" ? -1 : 1;
  } else {
    parsedSort["createdAt"] = -1;
  }

  return {
    skip,
    limit,
    sort: parsedSort,
  };
}

export function buildSearchQuery(
  searchString?: string,
  fields: string[] = [],
): Record<string, any> {
  if (!searchString || fields.length === 0) {
    return {};
  }

  const searchRegex = new RegExp(searchString.trim(), "i");
  const orConditions = fields.map((field) => ({
    [field]: searchRegex,
  }));

  return { $or: orConditions };
}

export async function runInTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const mongooseInstance = await DatabaseConnectionManager.connect();
  const session = await mongooseInstance.startSession();
  session.startTransaction();

  logger.info("Database transaction started");
  try {
    const result = await callback(session);
    await session.commitTransaction();
    logger.info("Database transaction committed successfully");
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error("Database transaction aborted due to error", error);
    throw error;
  } finally {
    session.endSession();
  }
}
