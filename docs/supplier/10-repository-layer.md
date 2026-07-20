# Repository Layer

## SupplierRepository

- Extends `BaseRepository<ISupplier>` which provides `create`, `findById`, `findOne`, `find`, `update`, `delete` primitives
- Additional methods:
  - `findByCode(code)` — find supplier by unique code
  - `findByEmail(email)` — find by email
  - `searchSuppliers(query, limit?)` — multi-field regex search against `businessName`, `code`, `email`, `phone`
  - `find(filter, options? )` — enhanced with pagination support

## SupplierProductMappingRepository

- Extends `BaseRepository<ISupplierProductMapping>`
- Additional methods:
  - `findBySupplier(supplierId)` — all mappings for a supplier
  - `findByProduct(productId)` — all suppliers of a product
  - `findBySupplierAndProduct(supplierId, productId)` — single mapping
  - `setPreferred(supplierId, productId, mappingId)` — unset other preferred and set this one

## Data Mapping

- Mongoose documents are converted to domain entities at the repository boundary.
- `_id` is preserved as a string in domain entities.
- Timestamps (`createdAt`, `updatedAt`) are preserved as dates.
- All monetary values (costPrice) are stored as integer cents.

## Dependencies

- `SupplierModel` — Mongoose model for `Supplier` collection
- `SupplierProductMappingModel` — Mongoose model for `supplier_product_mappings` collection
