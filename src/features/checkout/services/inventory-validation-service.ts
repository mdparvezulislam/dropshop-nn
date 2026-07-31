import { InventoryService } from "@/features/inventory/services/inventory-service";
import { logger } from "@/lib/utils/logger";
import { NotFoundError } from "@/lib/errors/app-error";

export interface InventoryCheckRequest {
  productId: string;
  variantSku?: string;
  quantity: number;
}

export interface InventoryCheckResult {
  productId: string;
  variantSku?: string;
  quantity: number;
  available: number;
  isValid: boolean;
  message?: string;
  reservationId?: string;
}

export class InventoryValidationService {
  private readonly inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  async validateSingle(request: InventoryCheckRequest): Promise<InventoryCheckResult> {
    logger.info("InventoryValidationService: validating stock", {
      productId: request.productId,
      quantity: request.quantity,
    });

    const inventory = await this.inventoryService.getInventoryByProduct(
      request.productId,
      request.variantSku,
    );

    if (!inventory) {
      // Untracked product (no inventory record) — dropship-sellable, matching
      // the storefront's stock semantics. Reservation soft-passes the same way.
      return {
        productId: request.productId,
        variantSku: request.variantSku,
        quantity: request.quantity,
        available: request.quantity,
        isValid: true,
        message: "Inventory untracked",
      };
    }

    const available = inventory.availableStock;

    if (inventory.status === "frozen") {
      return {
        productId: request.productId,
        variantSku: request.variantSku,
        quantity: request.quantity,
        available,
        isValid: false,
        message: "Inventory is frozen",
      };
    }

    if (inventory.availability === "discontinued") {
      return {
        productId: request.productId,
        variantSku: request.variantSku,
        quantity: request.quantity,
        available,
        isValid: false,
        message: "Product is discontinued",
      };
    }

    if (request.quantity > available && !inventory.allowBackorder && !inventory.allowPreOrder) {
      return {
        productId: request.productId,
        variantSku: request.variantSku,
        quantity: request.quantity,
        available,
        isValid: false,
        message: `Insufficient stock. Requested ${request.quantity}, available ${available}`,
      };
    }

    return {
      productId: request.productId,
      variantSku: request.variantSku,
      quantity: request.quantity,
      available,
      isValid: true,
    };
  }

  async validateBatch(requests: InventoryCheckRequest[]): Promise<InventoryCheckResult[]> {
    return Promise.all(requests.map((req) => this.validateSingle(req)));
  }

  async reserve(
    inventoryId: string,
    quantity: number,
    referenceId?: string,
    actorId?: string,
  ): Promise<{ reserveId?: string; success: boolean; message?: string }> {
    logger.info("InventoryValidationService: reserving stock", {
      inventoryId,
      quantity,
    });

    try {
      const result = await this.inventoryService.reserveStock(
        inventoryId,
        quantity,
        referenceId,
        actorId,
      );
      return {
        reserveId: result.history.id,
        success: true,
      };
    } catch (error: any) {
      logger.error("InventoryValidationService: reservation failed", error, { inventoryId });
      return {
        success: false,
        message: error.message || "Failed to reserve stock",
      };
    }
  }

  async release(inventoryId: string, quantity: number, actorId?: string): Promise<boolean> {
    try {
      await this.inventoryService.releaseStock(inventoryId, quantity, undefined, actorId);
      return true;
    } catch (error) {
      logger.error("InventoryValidationService: release failed", error, { inventoryId });
      return false;
    }
  }
}

export default InventoryValidationService;
