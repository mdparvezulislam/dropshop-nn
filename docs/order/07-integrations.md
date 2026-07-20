# 07 - Order Integrations

## Interfaces and Boundaries

1. **Inventory Integration**:
   - The Order Engine requests stock reservation, release, and commitment. It does not calculate stock levels locally.
   - Dynamic import resolves `InventoryService` for loose coupling.
2. **Pricing Integration**:
   - The Order Engine consumes already resolved price structures from the Checkout Session. It does not calculate product base prices locally.
3. **Supplier Integration**:
   - Stores immutable supplier ID references per item. Does not perform supplier settlements or operational supplier registry checks.
