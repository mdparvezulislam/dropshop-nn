# Service Layer

## SupplierService
Main orchestrator located at `src/features/supplier/services/supplier-service.ts`.

### Supplier CRUD
| Method | Description |
|---|---|
| `createSupplier(data)` | Creates a new supplier; auto-assigns `pending` status; validates code uniqueness |
| `updateSupplier(id, data)` | Partial update of supplier fields; disallows code change after creation |
| `getSupplierById(id)` | Returns full supplier with populated performance |
| `listSuppliers(filter, pagination, sort)` | Paginated listing with optional status/category/district filters |

### Status & Operations
| Method | Description |
|---|---|
| `updateStatus(id, status)` | Transitions supplier status with validation |
| `updateSettings(id, settings)` | Updates settings sub-document |
| `updateBanking(id, banking)` | Updates banking sub-document |
| `addNote(id, content, authorId)` | Appends a note to the notes array |
| `addTags(id, tags)` | Appends tags (no duplicates) |

### Performance
| Method | Description |
|---|---|
| `updatePerformance(id, data)` | Updates performance metrics; fires `supplier.performance_updated` event |

### Search & Listing
| Method | Description |
|---|---|
| `searchSuppliers(query)` | Quick search across businessName, code, email, phone |
| `listSuppliers(filter, pagination, sort)` | Advanced filtered listing |

### Product Mapping
| Method | Description |
|---|---|
| `mapProduct(data, userId)` | Creates a product mapping; sets preferred if none exists |
| `updateProductMapping(id, data, userId)` | Updates existing mapping |
| `removeProductMapping(id)` | Deletes mapping |
| `getSupplierProductMappings(supplierId)` | All mappings for a supplier |
| `getProductSuppliers(productId)` | All suppliers of a product |

### Statistics
| Method | Description |
|---|---|
| `getSupplierStats(id)` | Returns aggregated statistics for a single supplier |

## StatisticsService
Located at `src/features/supplier/services/statistics-service.ts`. Provides:
- `getSupplierStats(supplierId)` — performance metrics summary for a single supplier
- `getDashboardSummary()` — aggregate across all suppliers (counts, avg score, mapped products)
