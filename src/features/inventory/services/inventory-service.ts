import {
  InventoryRepository,
  InventoryHistoryRepository,
  SupplierInventoryRepository,
} from "../repositories/inventory-repository";
import { ProductInventory, InventoryHistory, SupplierInventory } from "../domain/inventory-entity";
import { StockCalculationService } from "./stock-calculation-service";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import { PaginationParams, SortParams, PaginatedResult } from "@/types";
import { normalizeVariantSku } from "@/lib/utils/sku-utils";
import {
  CreateInventoryInput,
  UpdateInventoryInput,
  StockAdjustmentInput,
  CreateSupplierInventoryInput,
  UpdateSupplierInventoryInput,
  BulkStockUpdateInput,
} from "../types/validation";

export class InventoryService {
  private readonly inventoryRepository: InventoryRepository;
  private readonly historyRepository: InventoryHistoryRepository;
  private readonly supplierInventoryRepository: SupplierInventoryRepository;
  private readonly stockCalculationService: StockCalculationService;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
    this.historyRepository = new InventoryHistoryRepository();
    this.supplierInventoryRepository = new SupplierInventoryRepository();
    this.stockCalculationService = new StockCalculationService();
  }

  private resolveInitialAvailability(data: CreateInventoryInput): ProductInventory["availability"] {
    return this.stockCalculationService.resolveAvailability({
      availableStock: data.availableStock ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 5,
      reorderLevel: data.reorderLevel ?? 0,
      allowPreOrder: data.allowPreOrder ?? false,
      allowBackorder: data.allowBackorder ?? false,
    });
  }

  async createInventory(data: CreateInventoryInput, actorId?: string): Promise<ProductInventory> {
    logger.info("InventoryService: creating inventory", {
      productId: data.productId,
      variantSku: data.variantSku,
    });

    const variantSku = normalizeVariantSku(data.variantSku);
    const warehouseId = data.warehouseId && data.warehouseId !== "" ? data.warehouseId : null;

    const existing = await this.inventoryRepository.findByProductAndVariant(
      data.productId,
      variantSku,
      warehouseId,
    );

    if (existing) {
      throw new ValidationError("Inventory already exists for this product/variant/warehouse", {
        productId: ["An inventory record already exists for this combination"],
      });
    }

    const availability = this.resolveInitialAvailability(data);

    const result = await this.inventoryRepository.create({
      ...data,
      variantSku,
      warehouseId,
      availability,
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<InventoryRepository["create"]>[0]);

    await this.historyRepository.create({
      inventoryId: result.id,
      productId: result.productId,
      variantSku: result.variantSku,
      warehouseId: result.warehouseId,
      operation: "stock_in",
      quantity: result.availableStock,
      previousAvailable: 0,
      newAvailable: result.availableStock,
      previousReserved: 0,
      newReserved: result.reservedStock,
      reason: "Initial stock setup",
      performedBy: actorId,
      createdBy: actorId,
    } as Parameters<InventoryHistoryRepository["create"]>[0]);

    logger.info("InventoryService: inventory created", {
      id: result.id,
      productId: result.productId,
      event: "Stock Updated",
    });

    return result;
  }

  async updateInventory(
    id: string,
    data: UpdateInventoryInput,
    actorId?: string,
  ): Promise<ProductInventory> {
    logger.info("InventoryService: updating inventory", { id });

    const existing = await this.inventoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product inventory not found");
    }

    const availableStock = data.availableStock ?? existing.availableStock;
    const lowStockThreshold = data.lowStockThreshold ?? existing.lowStockThreshold;
    const reorderLevel = data.reorderLevel ?? existing.reorderLevel;
    const allowPreOrder = data.allowPreOrder ?? existing.allowPreOrder;
    const allowBackorder = data.allowBackorder ?? existing.allowBackorder;

    const availability = this.stockCalculationService.resolveAvailability({
      availableStock,
      lowStockThreshold,
      reorderLevel,
      allowPreOrder,
      allowBackorder,
    });

    const result = await this.inventoryRepository.update(id, {
      ...data,
      variantSku:
        data.variantSku !== undefined
          ? normalizeVariantSku(data.variantSku)
          : existing.variantSku,
      warehouseId:
        data.warehouseId !== undefined
          ? data.warehouseId && data.warehouseId !== ""
            ? data.warehouseId
            : null
          : existing.warehouseId,
      availability,
      updatedBy: actorId,
    } as Parameters<InventoryRepository["update"]>[1]);

    logger.info("InventoryService: inventory updated", {
      id: result.id,
      event: "Stock Updated",
    });

    return result;
  }

  async getInventoryById(id: string): Promise<ProductInventory> {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new NotFoundError("Product inventory not found");
    }
    return inventory;
  }

  async getInventoryByProduct(
    productId: string,
    variantSku?: string,
    warehouseId?: string | null,
  ): Promise<ProductInventory | null> {
    return this.inventoryRepository.findByProductAndVariant(
      productId,
      normalizeVariantSku(variantSku),
      warehouseId,
    );
  }

  async listInventory(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<ProductInventory>> {
    return this.inventoryRepository.listInventory(filter, pagination, sort);
  }

  async getLowStockList(): Promise<ProductInventory[]> {
    return this.inventoryRepository.findLowStock();
  }

  async getOutOfStockList(): Promise<ProductInventory[]> {
    return this.inventoryRepository.findOutOfStock();
  }

  async getDashboardStats(): Promise<{
    totalSkus: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    reservedUnits: number;
    incomingUnits: number;
  }> {
    const [totalSkus, inStock, lowStock, outOfStock, allActive] = await Promise.all([
      this.inventoryRepository.count({ status: "active" }),
      this.inventoryRepository.count({ status: "active", availability: "in_stock" }),
      this.inventoryRepository.count({ status: "active", availability: "low_stock" }),
      this.inventoryRepository.count({
        status: "active",
        availability: { $in: ["out_of_stock", "pre_order", "backorder"] },
      }),
      this.inventoryRepository.find({ status: "active" }),
    ]);

    const reservedUnits = allActive.reduce((sum, item) => sum + item.reservedStock, 0);
    const incomingUnits = allActive.reduce((sum, item) => sum + item.incomingStock, 0);

    return {
      totalSkus,
      inStock,
      lowStock,
      outOfStock,
      reservedUnits,
      incomingUnits,
    };
  }

  async adjustStock(
    input: StockAdjustmentInput,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    logger.info("InventoryService: adjusting stock", {
      inventoryId: input.inventoryId,
      operation: input.operation,
      quantity: input.quantity,
      event: "Stock Adjusted",
    });

    return runInTransaction(async (session) => {
      const existing = await this.inventoryRepository.findById(input.inventoryId, { session });
      if (!existing) {
        throw new NotFoundError("Product inventory not found");
      }

      if (existing.status === "frozen") {
        throw new ValidationError("Inventory is frozen and cannot be adjusted", {
          status: ["Unfreeze inventory before adjusting stock"],
        });
      }

      const mutation = this.stockCalculationService.applyOperation(
        existing,
        input.operation,
        input.quantity,
        input.absoluteAvailable,
      );

      const inventory = await this.inventoryRepository.update(
        existing.id,
        {
          availableStock: mutation.availableStock,
          reservedStock: mutation.reservedStock,
          incomingStock: mutation.incomingStock,
          damagedStock: mutation.damagedStock,
          returnedStock: mutation.returnedStock,
          soldStock: mutation.soldStock,
          virtualStock: mutation.virtualStock,
          availability: mutation.availability,
          updatedBy: actorId,
        } as Parameters<InventoryRepository["update"]>[1],
        { session },
      );

      const history = await this.historyRepository.create(
        {
          inventoryId: inventory.id,
          productId: inventory.productId,
          variantSku: inventory.variantSku,
          warehouseId: input.warehouseId || inventory.warehouseId,
          operation: input.operation,
          quantity: input.quantity,
          previousAvailable: existing.availableStock,
          newAvailable: inventory.availableStock,
          previousReserved: existing.reservedStock,
          newReserved: inventory.reservedStock,
          reason: input.reason || undefined,
          referenceId: input.referenceId || undefined,
          notes: input.notes || undefined,
          performedBy: actorId,
          createdBy: actorId,
        } as Parameters<InventoryHistoryRepository["create"]>[0],
        { session },
      );

      logger.info("InventoryService: stock adjusted", {
        inventoryId: inventory.id,
        operation: input.operation,
        previousAvailable: existing.availableStock,
        newAvailable: inventory.availableStock,
        event: "Stock Adjusted",
      });

      return { inventory, history };
    });
  }

  async stockIn(
    inventoryId: string,
    quantity: number,
    reason?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock({ inventoryId, operation: "stock_in", quantity, reason }, actorId);
  }

  async stockOut(
    inventoryId: string,
    quantity: number,
    reason?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock({ inventoryId, operation: "stock_out", quantity, reason }, actorId);
  }

  async reserveStock(
    inventoryId: string,
    quantity: number,
    referenceId?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock(
      {
        inventoryId,
        operation: "reservation",
        quantity,
        referenceId,
        reason: "Stock reservation",
      },
      actorId,
    );
  }

  async releaseStock(
    inventoryId: string,
    quantity: number,
    referenceId?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock(
      {
        inventoryId,
        operation: "release",
        quantity,
        referenceId,
        reason: "Stock release",
      },
      actorId,
    );
  }

  async markDamaged(
    inventoryId: string,
    quantity: number,
    reason?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock({ inventoryId, operation: "damage", quantity, reason }, actorId);
  }

  async markReturned(
    inventoryId: string,
    quantity: number,
    reason?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock({ inventoryId, operation: "return", quantity, reason }, actorId);
  }

  async markSold(
    inventoryId: string,
    quantity: number,
    referenceId?: string,
    actorId?: string,
  ): Promise<{ inventory: ProductInventory; history: InventoryHistory }> {
    return this.adjustStock(
      {
        inventoryId,
        operation: "sold",
        quantity,
        referenceId,
        reason: "Order fulfillment",
      },
      actorId,
    );
  }

  async getHistory(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<InventoryHistory>> {
    return this.historyRepository.listHistory(filter, pagination, sort);
  }

  async getHistoryByInventory(inventoryId: string): Promise<InventoryHistory[]> {
    return this.historyRepository.findByInventoryId(inventoryId);
  }

  async bulkUpdateStock(
    input: BulkStockUpdateInput,
    actorId?: string,
  ): Promise<ProductInventory[]> {
    logger.info("InventoryService: bulk stock update", {
      count: input.items.length,
      event: "Stock Updated",
    });

    const results: ProductInventory[] = [];

    for (const item of input.items) {
      const variantSku = normalizeVariantSku(item.variantSku);
      const existing = await this.inventoryRepository.findByProductAndVariant(
        item.productId,
        variantSku,
      );

      if (!existing) {
        throw new NotFoundError(
          `Inventory not found for product ${item.productId}${variantSku ? ` / ${variantSku}` : ""}`,
        );
      }

      const previousAvailable = existing.availableStock;
      const updated = await this.updateInventory(
        existing.id,
        {
          availableStock: item.availableStock,
          reservedStock: item.reservedStock,
          incomingStock: item.incomingStock,
          safetyStock: item.safetyStock,
          reorderLevel: item.reorderLevel,
          lowStockThreshold: item.lowStockThreshold,
          allowPreOrder: item.allowPreOrder,
          allowBackorder: item.allowBackorder,
        },
        actorId,
      );

      if (item.availableStock !== undefined && item.availableStock !== previousAvailable) {
        await this.historyRepository.create({
          inventoryId: updated.id,
          productId: updated.productId,
          variantSku: updated.variantSku,
          warehouseId: updated.warehouseId,
          operation: "adjustment",
          quantity: Math.abs(item.availableStock - previousAvailable),
          previousAvailable,
          newAvailable: updated.availableStock,
          previousReserved: existing.reservedStock,
          newReserved: updated.reservedStock,
          reason: "Bulk stock update",
          performedBy: actorId,
          createdBy: actorId,
        } as Parameters<InventoryHistoryRepository["create"]>[0]);
      }

      results.push(updated);
    }

    return results;
  }

  async createSupplierInventory(
    data: CreateSupplierInventoryInput,
    actorId?: string,
  ): Promise<SupplierInventory> {
    logger.info("InventoryService: creating supplier inventory mapping", {
      productId: data.productId,
      supplierId: data.supplierId,
    });

    const variantSku = normalizeVariantSku(data.variantSku);
    const existing = await this.supplierInventoryRepository.findByProductAndSupplier(
      data.productId,
      data.supplierId,
      variantSku,
    );

    if (existing) {
      throw new ValidationError("Supplier inventory mapping already exists", {
        supplierId: ["This supplier is already mapped to the product/variant"],
      });
    }

    if (data.isPreferred) {
      const preferred = await this.supplierInventoryRepository.findPreferredByProduct(
        data.productId,
      );
      if (preferred) {
        await this.supplierInventoryRepository.update(preferred.id, {
          isPreferred: false,
        } as Parameters<SupplierInventoryRepository["update"]>[1]);
      }
    }

    const result = await this.supplierInventoryRepository.create({
      ...data,
      variantSku,
      supplierSku: data.supplierSku.trim(),
      currency: data.currency.toUpperCase(),
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<SupplierInventoryRepository["create"]>[0]);

    logger.info("InventoryService: supplier inventory created", {
      id: result.id,
      event: "Supplier Price Changed",
    });

    return result;
  }

  async updateSupplierInventory(
    id: string,
    data: UpdateSupplierInventoryInput,
    actorId?: string,
  ): Promise<SupplierInventory> {
    logger.info("InventoryService: updating supplier inventory", { id });

    const existing = await this.supplierInventoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Supplier inventory not found");
    }

    if (data.isPreferred) {
      const preferred = await this.supplierInventoryRepository.findPreferredByProduct(
        existing.productId,
      );
      if (preferred && preferred.id !== id) {
        await this.supplierInventoryRepository.update(preferred.id, {
          isPreferred: false,
        } as Parameters<SupplierInventoryRepository["update"]>[1]);
      }
    }

    const previousCost = existing.supplierCost;

    const result = await this.supplierInventoryRepository.update(id, {
      ...data,
      variantSku:
        data.variantSku !== undefined
          ? normalizeVariantSku(data.variantSku)
          : existing.variantSku,
      currency: data.currency ? data.currency.toUpperCase() : existing.currency,
      updatedBy: actorId,
    } as Parameters<SupplierInventoryRepository["update"]>[1]);

    if (data.supplierCost !== undefined && data.supplierCost !== previousCost) {
      logger.info("InventoryService: supplier price changed", {
        id: result.id,
        previousCost,
        newCost: result.supplierCost,
        event: "Supplier Price Changed",
      });
    }

    return result;
  }

  async getSupplierInventoryByProduct(productId: string): Promise<SupplierInventory[]> {
    return this.supplierInventoryRepository.findByProductId(productId);
  }

  async getSupplierInventoryBySupplier(supplierId: string): Promise<SupplierInventory[]> {
    return this.supplierInventoryRepository.findBySupplierId(supplierId);
  }

  async softDeleteInventory(id: string): Promise<boolean> {
    logger.info("InventoryService: soft deleting inventory", { id });
    return this.inventoryRepository.delete(id);
  }

  async exportInventory(filter: object = {}): Promise<ProductInventory[]> {
    logger.info("InventoryService: exporting inventory", { event: "Inventory Imported" });
    return this.inventoryRepository.find(filter);
  }

  getStockLevels(inventory: ProductInventory) {
    return this.stockCalculationService.calculateLevels(inventory);
  }
}

export default InventoryService;
