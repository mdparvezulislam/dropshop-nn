import {
  ProductInventory,
  StockAvailability,
  StockLevels,
  StockOperationType,
} from "../domain/inventory-entity";
import { ValidationError } from "@/shared/errors/app-error";

export interface StockMutationResult {
  availableStock: number;
  reservedStock: number;
  incomingStock: number;
  damagedStock: number;
  returnedStock: number;
  soldStock: number;
  virtualStock: number;
  availability: StockAvailability;
}

export class StockCalculationService {
  calculateOnHand(
    inventory: Pick<ProductInventory, "availableStock" | "reservedStock" | "damagedStock">,
  ): number {
    return inventory.availableStock + inventory.reservedStock + inventory.damagedStock;
  }

  calculateSellable(inventory: Pick<ProductInventory, "availableStock">): number {
    return Math.max(0, inventory.availableStock);
  }

  isLowStock(availableStock: number, lowStockThreshold: number, reorderLevel?: number): boolean {
    if (availableStock <= 0) return false;
    const threshold = Math.max(lowStockThreshold, reorderLevel ?? 0);
    return availableStock <= threshold;
  }

  isOutOfStock(availableStock: number): boolean {
    return availableStock <= 0;
  }

  isBelowReorder(availableStock: number, reorderLevel: number): boolean {
    return reorderLevel > 0 && availableStock <= reorderLevel;
  }

  isBelowSafety(availableStock: number, safetyStock: number): boolean {
    return safetyStock > 0 && availableStock < safetyStock;
  }

  resolveAvailability(params: {
    availableStock: number;
    lowStockThreshold: number;
    reorderLevel: number;
    allowPreOrder: boolean;
    allowBackorder: boolean;
  }): StockAvailability {
    if (params.availableStock <= 0) {
      if (params.allowPreOrder) return "pre_order";
      if (params.allowBackorder) return "backorder";
      return "out_of_stock";
    }

    if (this.isLowStock(params.availableStock, params.lowStockThreshold, params.reorderLevel)) {
      return "low_stock";
    }

    return "in_stock";
  }

  calculateLevels(inventory: ProductInventory): StockLevels {
    const availability = this.resolveAvailability({
      availableStock: inventory.availableStock,
      lowStockThreshold: inventory.lowStockThreshold,
      reorderLevel: inventory.reorderLevel,
      allowPreOrder: inventory.allowPreOrder,
      allowBackorder: inventory.allowBackorder,
    });

    return {
      onHand: this.calculateOnHand(inventory),
      available: inventory.availableStock,
      reserved: inventory.reservedStock,
      incoming: inventory.incomingStock,
      damaged: inventory.damagedStock,
      returned: inventory.returnedStock,
      sold: inventory.soldStock ?? 0,
      virtual: inventory.virtualStock ?? 0,
      sellable: this.calculateSellable(inventory),
      isLowStock: availability === "low_stock",
      isOutOfStock: availability === "out_of_stock",
      isBelowReorder: this.isBelowReorder(inventory.availableStock, inventory.reorderLevel),
      isBelowSafety: this.isBelowSafety(inventory.availableStock, inventory.safetyStock),
      availability,
    };
  }

  applyOperation(
    inventory: ProductInventory,
    operation: StockOperationType,
    quantity: number,
    absoluteAvailable?: number,
  ): StockMutationResult {
    if (quantity <= 0 && operation !== "adjustment") {
      throw new ValidationError("Stock operation quantity must be positive", {
        quantity: ["Quantity must be greater than zero"],
      });
    }

    let availableStock = inventory.availableStock;
    let reservedStock = inventory.reservedStock;
    let incomingStock = inventory.incomingStock;
    let damagedStock = inventory.damagedStock;
    let returnedStock = inventory.returnedStock;
    let soldStock = inventory.soldStock ?? 0;
    const virtualStock = inventory.virtualStock ?? 0;

    switch (operation) {
      case "stock_in":
        availableStock += quantity;
        if (incomingStock >= quantity) {
          incomingStock -= quantity;
        }
        break;

      case "stock_out":
        if (availableStock < quantity && !inventory.allowBackorder) {
          throw new ValidationError("Insufficient available stock", {
            quantity: [`Only ${availableStock} units available`],
          });
        }
        availableStock = Math.max(0, availableStock - quantity);
        break;

      case "adjustment":
        if (absoluteAvailable !== undefined) {
          availableStock = absoluteAvailable;
        } else {
          availableStock = Math.max(0, availableStock + quantity);
        }
        break;

      case "reservation":
        if (availableStock < quantity && !inventory.allowBackorder) {
          throw new ValidationError("Insufficient stock to reserve", {
            quantity: [`Only ${availableStock} units available to reserve`],
          });
        }
        availableStock = Math.max(0, availableStock - quantity);
        reservedStock += quantity;
        break;

      case "release":
        if (reservedStock < quantity) {
          throw new ValidationError("Cannot release more than reserved stock", {
            quantity: [`Only ${reservedStock} units are reserved`],
          });
        }
        reservedStock -= quantity;
        availableStock += quantity;
        break;

      case "transfer":
        if (availableStock < quantity) {
          throw new ValidationError("Insufficient stock for transfer", {
            quantity: [`Only ${availableStock} units available to transfer`],
          });
        }
        availableStock -= quantity;
        break;

      case "damage":
        if (availableStock < quantity) {
          throw new ValidationError("Insufficient stock to mark damaged", {
            quantity: [`Only ${availableStock} units available`],
          });
        }
        availableStock -= quantity;
        damagedStock += quantity;
        break;

      case "return":
        availableStock += quantity;
        returnedStock += quantity;
        break;

      case "sold":
        if (reservedStock < quantity) {
          if (availableStock < quantity) {
            throw new ValidationError("Insufficient stock to mark sold", {
              quantity: [`Only ${availableStock} units available`],
            });
          }
          availableStock -= quantity;
        } else {
          reservedStock -= quantity;
        }
        soldStock += quantity;
        break;

      default:
        throw new ValidationError("Unsupported stock operation", {
          operation: ["Invalid stock operation type"],
        });
    }

    const availability = this.resolveAvailability({
      availableStock,
      lowStockThreshold: inventory.lowStockThreshold,
      reorderLevel: inventory.reorderLevel,
      allowPreOrder: inventory.allowPreOrder,
      allowBackorder: inventory.allowBackorder,
    });

    return {
      availableStock,
      reservedStock,
      incomingStock,
      damagedStock,
      returnedStock,
      soldStock,
      virtualStock,
      availability,
    };
  }

  markIncoming(inventory: ProductInventory, quantity: number): number {
    if (quantity <= 0) {
      throw new ValidationError("Incoming quantity must be positive", {
        quantity: ["Quantity must be greater than zero"],
      });
    }
    return inventory.incomingStock + quantity;
  }

  markDamaged(
    inventory: ProductInventory,
    quantity: number,
  ): {
    availableStock: number;
    damagedStock: number;
  } {
    if (quantity <= 0) {
      throw new ValidationError("Damaged quantity must be positive", {
        quantity: ["Quantity must be greater than zero"],
      });
    }
    if (inventory.availableStock < quantity) {
      throw new ValidationError("Insufficient available stock to mark damaged", {
        quantity: [`Only ${inventory.availableStock} units available`],
      });
    }
    return {
      availableStock: inventory.availableStock - quantity,
      damagedStock: inventory.damagedStock + quantity,
    };
  }

  markReturned(
    inventory: ProductInventory,
    quantity: number,
  ): {
    availableStock: number;
    returnedStock: number;
  } {
    if (quantity <= 0) {
      throw new ValidationError("Returned quantity must be positive", {
        quantity: ["Quantity must be greater than zero"],
      });
    }
    return {
      availableStock: inventory.availableStock + quantity,
      returnedStock: inventory.returnedStock + quantity,
    };
  }
}

export default StockCalculationService;
