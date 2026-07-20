# 11 - Reseller Workspace

## Overview

The Reseller Inventory Workspace shows resellers their available stock information while hiding sensitive internal data.

## Display Sections

### 1. Available Stock

- Current sellable stock count
- Stock status badge (In Stock, Low Stock, Out of Stock)
- Estimated delivery time

### 2. Stock Status

- Visual indicator: green (in stock), yellow (low stock), red (out of stock)
- Pre-order / backorder availability notice
- Expected restock date (if available)

### 3. Low Stock Warnings

- Warning when stock is running low
- Suggested order quantity
- Reorder notification signup

## Data NEVER Displayed

The following are NEVER exposed to resellers:

- ❌ Supplier Inventory Levels
- ❌ Internal Stock Costs
- ❌ Reserved Stock Quantities
- ❌ Damaged Stock Counts
- ❌ Incoming Stock Details
- ❌ Safety Stock Levels
- ❌ Reorder Levels
- ❌ Other Resellers' Stock

## Access Control

The Reseller Workspace is only accessible to users with role `reseller`. Unauthorized access attempts:

- Return 403 Forbidden
- Log security event

## Implementation

```typescript
// Inventory service filters data for reseller display
const inventory = await inventoryService.getInventoryByProduct(productId);
const stockLevels = inventoryService.getStockLevels(inventory);

// Reseller sees limited fields
return {
  availableStock: stockLevels.sellable,
  availability: stockLevels.availability,
  isLowStock: stockLevels.isLowStock,
  isOutOfStock: stockLevels.isOutOfStock,
};
```
