# Supplier-Product Mapping

## Purpose

Associate a supplier with a catalog product, capturing the supplier-specific cost price, SKU, and order parameters. This is the bridge between the Supplier and Catalog modules.

## The Mapping Entity

`SupplierProductMapping` is stored in a dedicated Mongoose collection `supplier_product_mappings` with a unique compound index on `(supplierId, productId)`.

| Field          | Type       | Description                     |
| -------------- | ---------- | ------------------------------- |
| `supplierId`   | `ObjectId` | FK → Supplier                   |
| `productId`    | `ObjectId` | FK → Catalog Product            |
| `supplierSku`  | `string`   | Supplier's SKU for this product |
| `costPrice`    | `number`   | Unit cost in cents              |
| `leadTimeDays` | `number`   | Typical lead time in days       |
| `moq`          | `number`   | Minimum order quantity          |
| `isPreferred`  | `boolean`  | Flag for default supplier       |
| `notes`        | `string?`  | Free-text remark                |
| `createdBy`    | `string?`  | User ID                         |
| `updatedBy`    | `string?`  | User ID                         |

## Operations

- **mapProduct** — create a new mapping
- **updateProductMapping** — update cost, SKU, lead-time, etc.
- **removeProductMapping** — delete mapping
- **getSupplierProductMappings(supplierId)** — all mappings for a supplier
- **getProductSuppliers(productId)** — all suppliers of a product

## Integration with Catalog

Catalog products contain `suppliers: SupplierReference[]` which is a lightweight summary (`supplierId`, `supplierSku`, `isPrimary`, `sortOrder`). The detailed cost/lead-time data lives in the mapping table.

## Events

- `supplier.product_mapped`
- `supplier.product_mapping_updated`
- `supplier.product_mapping_removed`
