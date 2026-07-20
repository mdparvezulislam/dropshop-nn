# 07 - Inventory Architecture

## Overview

Inventory is organized as five independent but interconnected systems. The separation ensures that supplier stock, warehouse stock, reserved stock, incoming stock, and sellable stock are tracked independently.

Refer to `docs/17-inventory-architecture.md` for the existing implementation details. This document extends that architecture with enterprise-level additions.

---

## Inventory Buckets

### 1. Catalog Inventory
The platform's sellable stock. This is what customers see as availability.

```
ProductInventory {
  productId
  variantSku?
  warehouseId?           // null = default/global warehouse
  availableStock         // Sellable units
  reservedStock          // Held for active orders
  incomingStock          // On-order from suppliers
  damagedStock           // Unsellable units
  returnedStock          // Returned units (pending inspection)
  safetyStock            // Buffer level (not for sale)
  reorderLevel           // When to reorder
  lowStockThreshold      // Warning level
  availability           // Computed: in_stock | low_stock | out_of_stock | pre_order | backorder
}
```

### 2. Supplier Inventory
Stock owned by suppliers. Used for dropshipping fulfillment.

```
SupplierInventory {
  productId
  supplierId
  variantSku?
  supplierSku
  supplierStock          // Supplier's reported stock
  supplierCost           // Cost in cents
  leadTimeDays           // Days to fulfill
  minimumOrderQuantity
  isPreferred
}
```

### 3. Warehouse Inventory
Future multi-warehouse support. Each warehouse has its own stock row.

```
WarehouseInventory {
  productId
  variantSku?
  warehouseId            // FK to Warehouse
  availableStock
  reservedStock
  capacity?              // Max storage units
  allocationRule         // Priority, distance, etc.
}
```

### 4. Reserved Inventory
Stock held for active orders, payment processing, or checkout carts.

```
ReservedInventory {
  productId
  variantSku?
  orderId | cartId       // What holds the reservation
  quantity
  expiresAt              // TTL for automatic release
  status                 // active | released | fulfilled | expired
}
```

### 5. Incoming Inventory
Stock expected from suppliers, inbound transfers, or purchase orders.

```
IncomingInventory {
  productId
  variantSku?
  purchaseOrderId
  supplierId
  expectedQuantity
  receivedQuantity
  expectedDate
  status                 // ordered | in_transit | partial | received | cancelled
}
```

---

## Stock Operations

| Operation | Bucket Effect | History Entry |
|-----------|---------------|---------------|
| `stock_in` | +availableStock | Stock In |
| `stock_out` | −availableStock | Stock Out |
| `adjustment` | ±availableStock | Adjustment |
| `reservation` | −available → +reserved | Reservation |
| `release` | −reserved → +available | Release |
| `transfer` | −source available (→ +target available) | Transfer |
| `damage` | −available → +damaged | Damage |
| `return` | +available (from returned) | Return |

---

## Availability Computation

```typescript
function resolveAvailability(inventory: ProductInventory): AvailabilityStatus {
  const sellable = inventory.availableStock - inventory.reservedStock;
  if (sellable > inventory.lowStockThreshold) return 'in_stock';
  if (sellable > 0) return 'low_stock';
  if (inventory.allowPreOrder) return 'pre_order';
  if (inventory.allowBackorder) return 'backorder';
  return 'out_of_stock';
}
```

---

## Multi-Warehouse Support (Future)

Architecture ready for:
- Multiple warehouses identified by `warehouseId`
- Per-warehouse stock rows (unique on product+variant+warehouse)
- Warehouse transfer operations (source → target)
- Warehouse allocation based on customer location
- Warehouse-specific availability thresholds

---

## Automation

```
Stock Updated / Reserved / Released
│
├── Availability Recalculation
├── Low Stock Alert (if threshold crossed)
├── Dashboard Refresh
├── Analytics Event: "inventory.updated"
├── Activity Timeline Update
├── Report Queue Update
└── Audit Log Entry
```
