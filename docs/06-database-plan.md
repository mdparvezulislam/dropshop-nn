# 06 - Database Plan

## MongoDB Connections & Pools

- Connections are managed by `DatabaseConnectionManager` in `src/shared/lib/database/connection-manager.ts` (connection pooling, retry loop, and graceful process shutdown SIGINT/SIGTERM handlers).
- Max pool size: 10.
- Min pool size: 2.
- ReadyState status endpoints are monitored by `DatabaseConnectionManager.getHealthStatus()`.

## Base Mongoose Schema Infrastructure

All Mongoose schemas automatically extend the custom Mongoose foundation features:

- **Base Fields**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, `isDeleted`, `status`, `metadata`.
- **Soft Delete**: Query hooks automatically strip soft-deleted records (`isDeleted: { $ne: true }`) across `find`, `findOne`, and count queries. Use `.isDeleted(true)` to include deleted records.
- **Output transform**: Virtual `id` is mapped to string from `_id`, while `__v` and `_id` are removed on JSON serialization.

## MongoDB Indexing Guidelines

1. **Single Fields**: Add index attributes to unique fields and lookup fields (e.g., `sku` in products, `email` in users).
2. **Compound Indexes**: Construct indexes for combined filter queries (e.g., `{ productId: 1, variantSku: 1 }` for pricing/inventory).
3. **Text Search**: Add text indexing configurations for text searches.
4. **TTL Indexes**: Leverage TTL indexes on temp entries (e.g., email verification codes, temporary queues).

---

## MongoDB Collections Schema

### Users (`users`)

- `_id`: ObjectId
- `name`: String
- `email`: String (indexed, unique)
- `passwordHash`: String
- `role`: Enum ("admin", "user", "courier")
- Base schema audit and tracking parameters...

### Products (`products`) — Catalog only

- `_id`: ObjectId
- `sku`: String (indexed, unique)
- `name`: String
- `slug`: String
- `supplierId`: ObjectId → Supplier
- `brandId` / `categoryId`: optional ObjectIds
- `variants[]`: catalog attributes + variant SKU (no price/stock)
- **No price or stock fields** — owned by Pricing & Inventory modules
- Base schema audit and tracking parameters...

### ProductPricing (`productpricings`)

- `productId`: ObjectId → Product (indexed)
- `variantSku`: String (optional, indexed)
- Unique compound: `{ productId, variantSku }`
- Money fields stored as **integer cents**: `baseCostPrice`, `purchasePrice`, `supplierPrice`, `sellingPrice`, `wholesalePrice`, `resellerPrice`, `comparePrice`, `promotionalPrice`, `discountAmount`, `profitAmount`
- `discountPercentage`, `profitMargin`, `taxRate`, `commissionRate`
- `currency`: ISO 3-letter code
- `taxInclusive`: Boolean
- `pricingRule`: fixed | percentage | supplier_based | category_based | brand_based | dynamic
- `ruleConfig`: embedded rule parameters
- `status`: active | inactive | scheduled | expired
- `effectiveFrom` / `effectiveTo`

### ProductInventory (`productinventories`)

- `productId`: ObjectId → Product (indexed)
- `variantSku`: String (optional)
- `warehouseId`: ObjectId (optional, null = default / global) — warehouse-ready
- Unique compound: `{ productId, variantSku, warehouseId }`
- Stock buckets: `availableStock`, `reservedStock`, `incomingStock`, `damagedStock`, `returnedStock`
- Thresholds: `safetyStock`, `reorderLevel`, `lowStockThreshold`
- `availability`: in_stock | low_stock | out_of_stock | pre_order | backorder
- `allowPreOrder`, `allowBackorder`
- `status`: active | inactive | frozen

### InventoryHistory (`inventoryhistories`)

- `inventoryId`: ObjectId → ProductInventory
- `productId`: ObjectId → Product
- `operation`: stock_in | stock_out | adjustment | reservation | release | transfer
- `quantity`, `previousAvailable`, `newAvailable`, `previousReserved`, `newReserved`
- `reason`, `referenceId`, `notes`, `performedBy`
- Indexes on `{ inventoryId, createdAt }`, `{ productId, createdAt }`

### SupplierInventory (`supplierinventories`)

- `productId` + `supplierId` + optional `variantSku` (unique compound)
- `supplierSku`, `supplierCost` (cents), `supplierStock`
- `leadTimeDays`, `minimumOrderQuantity`, `isPreferred`, `currency`
- `status`: active | inactive | discontinued

### Suppliers (`suppliers`)

- See Phase 4 supplier schema (business profile, contacts, banking, documents, settings).

### Reseller (`resellers`)

- `code`: unique (RSL-####)
- Profile: businessName, ownerName, contactPerson, email, phone, logo, coverImage
- `address`: country, division, district, upazila, area, postalCode, fullAddress
- `businessType`, `nidNumber`, `nidVerified`, `tradeLicenseNumber`, `tradeLicenseVerified`
- `status`: pending | active | suspended | blocked | archived
- `userId` optional → User
- `collections[]`, `tags[]`, `notes`

### ResellerProduct (`resellerproducts`)

- `resellerId` → Reseller, `productId` → Product (reference only — Product never updated)
- Optional `variantSku`
- `customTitle`, `customDescription`, `personalNotes`
- `sellingStatus`: draft | active | hidden | out_of_catalog
- `isFavorite`, `isHidden`, `collectionIds[]`, `groupIds[]`, `tags[]`
- Embedded `pricing` (cents): sellingPrice, discounts, recommendedPrice, costBasis, profit*, currency, isCustomPrice
- Unique compound: `{ resellerId, productId, variantSku }`

### ResellerCollection / ResellerProductGroup

- Per-reseller named sets with `slug` and `productIds[]`

### Orders / Payments (planned)

- Not implemented in Phase 6/7.

---

## Relationships

```
Supplier
   ↓
SupplierInventory
   ↓
Product (catalog)
   ├── ProductPricing
   ├── ProductInventory → InventoryHistory
   └── ResellerProduct → Reseller
```

---

## Redis Caching Schema

- Cache Keys structure: `dropshop:cache:<domain>:<identifier>` (e.g., `dropshop:cache:pricing:productId`).
- Cache expiry: TTL configurations of 15 minutes default for database payloads.
- BullMQ Redis prefix: `dropshop:queue:<queue-name>` to isolate job lists.
