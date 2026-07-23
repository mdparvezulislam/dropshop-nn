import { BaseRepository } from "@/lib/database/generic-repository";
import {
  ProductInventoryModel,
  ProductInventoryDocumentType,
  InventoryHistoryModel,
  InventoryHistoryDocumentType,
  SupplierInventoryModel,
  SupplierInventoryDocumentType,
} from "./inventory-model";
import { ProductInventory, InventoryHistory, SupplierInventory } from "../domain/inventory-entity";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";
import { PaginationParams, SortParams, PaginatedResult } from "@/types";

export class InventoryRepository extends BaseRepository<
  ProductInventoryDocumentType,
  ProductInventory
> {
  constructor() {
    super(ProductInventoryModel, InventoryRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductInventoryDocumentType): ProductInventory {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      warehouseId: doc.warehouseId?.toString() || null,
      availableStock: doc.availableStock,
      reservedStock: doc.reservedStock,
      incomingStock: doc.incomingStock,
      damagedStock: doc.damagedStock,
      returnedStock: doc.returnedStock,
      soldStock: doc.soldStock ?? 0,
      virtualStock: doc.virtualStock ?? 0,
      safetyStock: doc.safetyStock,
      reorderLevel: doc.reorderLevel,
      lowStockThreshold: doc.lowStockThreshold,
      availability: doc.availability,
      allowPreOrder: doc.allowPreOrder,
      allowBackorder: doc.allowBackorder,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata
        ? (Object.fromEntries(doc.metadata as unknown as Map<string, unknown>) as Record<
            string,
            string | number | boolean | null | undefined
          >)
        : undefined,
    };
  }

  async findByProductId(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<ProductInventory[]> {
    try {
      return this.find({ productId }, options);
    } catch (error) {
      logger.error("InventoryRepository findByProductId failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByProductAndVariant(
    productId: string,
    variantSku?: string,
    warehouseId?: string | null,
    options?: DatabaseQueryOptions,
  ): Promise<ProductInventory | null> {
    try {
      const andConditions: object[] = [{ productId }];

      if (variantSku) {
        andConditions.push({ variantSku: variantSku.toUpperCase().trim() });
      } else {
        andConditions.push({
          $or: [{ variantSku: { $exists: false } }, { variantSku: null }, { variantSku: "" }],
        });
      }

      if (warehouseId) {
        andConditions.push({ warehouseId });
      } else {
        andConditions.push({
          $or: [{ warehouseId: { $exists: false } }, { warehouseId: null }],
        });
      }

      return this.findOne({ $and: andConditions }, options);
    } catch (error) {
      logger.error("InventoryRepository findByProductAndVariant failed", error, {
        productId,
        variantSku,
        warehouseId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findLowStock(options?: DatabaseQueryOptions): Promise<ProductInventory[]> {
    try {
      const docs = await ProductInventoryModel.find({
        $expr: { $lte: ["$availableStock", "$lowStockThreshold"] },
        status: "active",
      })
        .session(options?.session || null)
        .exec();
      return docs.map((doc) =>
        InventoryRepository.mapToDomain(doc as ProductInventoryDocumentType),
      );
    } catch (error) {
      logger.error("InventoryRepository findLowStock failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async findOutOfStock(options?: DatabaseQueryOptions): Promise<ProductInventory[]> {
    try {
      return this.find({ availableStock: 0, status: "active" }, options);
    } catch (error) {
      logger.error("InventoryRepository findOutOfStock failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async listInventory(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
    options?: DatabaseQueryOptions,
  ): Promise<PaginatedResult<ProductInventory>> {
    return this.findPaginated(filter, pagination, sort, options);
  }
}

export class InventoryHistoryRepository extends BaseRepository<
  InventoryHistoryDocumentType,
  InventoryHistory
> {
  constructor() {
    super(InventoryHistoryModel, InventoryHistoryRepository.mapToDomain);
  }

  private static mapToDomain(doc: InventoryHistoryDocumentType): InventoryHistory {
    return {
      id: doc._id.toString(),
      inventoryId: doc.inventoryId.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      warehouseId: doc.warehouseId?.toString() || null,
      operation: doc.operation,
      quantity: doc.quantity,
      previousAvailable: doc.previousAvailable,
      newAvailable: doc.newAvailable,
      previousReserved: doc.previousReserved,
      newReserved: doc.newReserved,
      reason: doc.reason,
      referenceId: doc.referenceId,
      notes: doc.notes,
      performedBy: doc.performedBy,
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata
        ? (Object.fromEntries(doc.metadata as unknown as Map<string, unknown>) as Record<
            string,
            string | number | boolean | null | undefined
          >)
        : undefined,
    };
  }

  async findByInventoryId(
    inventoryId: string,
    options?: DatabaseQueryOptions,
  ): Promise<InventoryHistory[]> {
    try {
      return this.find({ inventoryId }, options);
    } catch (error) {
      logger.error("InventoryHistoryRepository findByInventoryId failed", error, { inventoryId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByProductId(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<InventoryHistory[]> {
    try {
      return this.find({ productId }, options);
    } catch (error) {
      logger.error("InventoryHistoryRepository findByProductId failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async listHistory(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
    options?: DatabaseQueryOptions,
  ): Promise<PaginatedResult<InventoryHistory>> {
    return this.findPaginated(filter, pagination, sort, options);
  }
}

export class SupplierInventoryRepository extends BaseRepository<
  SupplierInventoryDocumentType,
  SupplierInventory
> {
  constructor() {
    super(SupplierInventoryModel, SupplierInventoryRepository.mapToDomain);
  }

  private static mapToDomain(doc: SupplierInventoryDocumentType): SupplierInventory {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      supplierId: doc.supplierId.toString(),
      variantSku: doc.variantSku,
      supplierSku: doc.supplierSku,
      supplierCost: doc.supplierCost,
      supplierStock: doc.supplierStock,
      leadTimeDays: doc.leadTimeDays,
      minimumOrderQuantity: doc.minimumOrderQuantity,
      isPreferred: doc.isPreferred,
      currency: doc.currency,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata
        ? (Object.fromEntries(doc.metadata as unknown as Map<string, unknown>) as Record<
            string,
            string | number | boolean | null | undefined
          >)
        : undefined,
    };
  }

  async findByProductId(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierInventory[]> {
    try {
      return this.find({ productId }, options);
    } catch (error) {
      logger.error("SupplierInventoryRepository findByProductId failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findBySupplierId(
    supplierId: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierInventory[]> {
    try {
      return this.find({ supplierId }, options);
    } catch (error) {
      logger.error("SupplierInventoryRepository findBySupplierId failed", error, { supplierId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByProductAndSupplier(
    productId: string,
    supplierId: string,
    variantSku?: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierInventory | null> {
    try {
      const filter: Record<string, unknown> = { productId, supplierId };
      if (variantSku) {
        filter.variantSku = variantSku.toUpperCase().trim();
      } else {
        filter.$or = [{ variantSku: { $exists: false } }, { variantSku: null }, { variantSku: "" }];
      }
      return this.findOne(filter, options);
    } catch (error) {
      logger.error("SupplierInventoryRepository findByProductAndSupplier failed", error, {
        productId,
        supplierId,
        variantSku,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findPreferredByProduct(
    productId: string,
    options?: DatabaseQueryOptions,
  ): Promise<SupplierInventory | null> {
    try {
      return this.findOne({ productId, isPreferred: true, status: "active" }, options);
    } catch (error) {
      logger.error("SupplierInventoryRepository findPreferredByProduct failed", error, {
        productId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export default InventoryRepository;
