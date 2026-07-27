import { Model } from "mongoose";
import { PaginationParams, SortParams, PaginatedResult } from "@/types";
import { parsePaginationAndSort } from "./query-builder";
import { DatabaseQueryOptions, BaseDocument } from "./types";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { DatabaseConnectionManager } from "./connection-manager";

export abstract class BaseRepository<
  TDocument extends BaseDocument,
  TDomain extends { id: string },
> {
  protected constructor(
    protected readonly model: Model<TDocument>,
    protected readonly toDomainEntity: (doc: TDocument) => TDomain,
  ) {}

  protected async ensureConnected(): Promise<void> {
    await DatabaseConnectionManager.connect();
  }

  async create(
    data: Partial<Omit<TDomain, "id" | "createdAt" | "updatedAt">>,
    options?: DatabaseQueryOptions,
  ): Promise<TDomain> {
    try {
      await this.ensureConnected();
      const [doc] = await (this.model.create as any)([data], { session: options?.session });
      if (!doc) {
        throw new DatabaseError("Failed to create database document");
      }
      return this.toDomainEntity(doc as TDocument);
    } catch (error) {
      logger.error("Repository create operation failed", error, { data });
      if (error instanceof DatabaseError) throw error;
      const originalMessage = error instanceof Error ? error.message : "Unknown error";
      throw new DatabaseError(`Database write error: ${originalMessage}`, error);
    }
  }

  async findById(id: string, options?: DatabaseQueryOptions): Promise<TDomain | null> {
    try {
      await this.ensureConnected();
      const query = this.model.findById(id).session(options?.session || null);
      if (options?.lean !== false) {
        query.lean();
      }
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as TDocument) : null;
    } catch (error) {
      logger.error("Repository findById operation failed", error, { id });
      throw new DatabaseError("Database fetch error", error);
    }
  }

  async findOne(filter: object, options?: DatabaseQueryOptions): Promise<TDomain | null> {
    try {
      await this.ensureConnected();
      const query = this.model.findOne(filter).session(options?.session || null);
      if (options?.lean !== false) {
        query.lean();
      }
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as TDocument) : null;
    } catch (error) {
      logger.error("Repository findOne operation failed", error, { filter });
      throw new DatabaseError("Database query error", error);
    }
  }

  async find(filter: object, options?: DatabaseQueryOptions): Promise<TDomain[]> {
    try {
      await this.ensureConnected();
      const query = this.model.find(filter).session(options?.session || null);
      if (options?.lean !== false) {
        query.lean();
      }
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const docs = await query.exec();
      return docs.map((doc) => this.toDomainEntity(doc as TDocument));
    } catch (error) {
      logger.error("Repository find operation failed", error, { filter });
      throw new DatabaseError("Database fetch error", error);
    }
  }

  async findPaginated(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
    options?: DatabaseQueryOptions,
  ): Promise<PaginatedResult<TDomain>> {
    try {
      await this.ensureConnected();
      const { skip, limit, sort: parsedSort } = parsePaginationAndSort(pagination, sort);

      const query = this.model.find(filter).session(options?.session || null);
      if (options?.lean !== false) {
        query.lean();
      }
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const countQuery = this.model.countDocuments(filter).session(options?.session || null);
      if (options?.showDeleted) {
        countQuery.setOptions({ showDeleted: true });
      }

      const [docs, totalCount] = await Promise.all([
        query.sort(parsedSort).skip(skip).limit(limit).exec(),
        countQuery.exec(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        items: docs.map((doc) => this.toDomainEntity(doc as TDocument)),
        totalCount,
        page: pagination.page || 1,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error("Repository findPaginated operation failed", error, {
        filter,
        pagination,
        sort,
      });
      throw new DatabaseError("Database pagination error", error);
    }
  }

  async update(
    id: string,
    data: Partial<Omit<TDomain, "id" | "createdAt" | "updatedAt">>,
    options?: DatabaseQueryOptions,
  ): Promise<TDomain> {
    try {
      await this.ensureConnected();
      const query = this.model.findByIdAndUpdate(
        id,
        { $set: data as any },
        {
          returnDocument: "after",
          runValidators: true,
          session: options?.session,
        },
      );
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const doc = await query.exec();
      if (!doc) {
        throw new NotFoundError("Document not found for update");
      }
      return this.toDomainEntity(doc as TDocument);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error("Repository update operation failed", error, { id, data });
      const originalMessage = error instanceof Error ? error.message : "Unknown error";
      throw new DatabaseError(`Database update error: ${originalMessage}`, error);
    }
  }

  async delete(id: string, options?: DatabaseQueryOptions): Promise<boolean> {
    try {
      await this.ensureConnected();
      const query = this.model.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true, deletedAt: new Date() },
        },
        { session: options?.session },
      );
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const doc = await query.exec();
      return !!doc;
    } catch (error) {
      logger.error("Repository delete (soft) operation failed", error, { id });
      throw new DatabaseError("Database delete error", error);
    }
  }

  async hardDelete(id: string, options?: DatabaseQueryOptions): Promise<boolean> {
    try {
      await this.ensureConnected();
      const query = this.model.findByIdAndDelete(id, { session: options?.session });
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }

      const doc = await query.exec();
      return !!doc;
    } catch (error) {
      logger.error("Repository hardDelete operation failed", error, { id });
      throw new DatabaseError("Database delete error", error);
    }
  }

  async count(filter: object, options?: DatabaseQueryOptions): Promise<number> {
    try {
      await this.ensureConnected();
      const query = this.model.countDocuments(filter).session(options?.session || null);
      if (options?.showDeleted) {
        query.setOptions({ showDeleted: true });
      }
      return await query.exec();
    } catch (error) {
      logger.error("Repository count operation failed", error, { filter });
      throw new DatabaseError("Database count error", error);
    }
  }
}
export default BaseRepository;
