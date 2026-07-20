# Validation & Types

## Validation Rules
All user-facing input is validated with Zod schemas in `src/features/supplier/types/validation.ts`.

| Schema | Key Rules |
|---|---|
| `createSupplierSchema` | `businessName` (1–200 chars), `code` (2–20, alphanumeric uppercase), `email` (valid email), `phone` (5–20), `category` (enum of 5), `contacts` (max 10) |
| `updateSupplierSchema` | All fields optional, at least one required |
| `settingsSchema` | `currency` (3 chars), `paymentTerms` (one of 5 enums), booleans validated |
| `bankAccountSchema` | `bankName`, `accountName`, `accountNumber` (1–50), `routingNumber` (1–50), `currency` (3 chars) |
| `contactSchema` | `name` (1–100), `role` (1–100), `email` (valid), `phone` (valid), `isPrimary` (boolean) |
| `addressSchema` | All string fields max 200 chars, `country` max 2 chars |
| `supplierCategorySchema` | Enum of 5 categories |
| `supplierStatusSchema` | Enum of 6 statuses |
| `supplierNoteSchema` | `content` (1–2000 chars) |
| `supplierPerformanceSchema` | All numeric, score 0–100, rate 0–100 |
| `supplierListQuerySchema` | `page` (default 1), `limit` (default 10, max 100), optional filters |
| `createSupplierProductMappingSchema` | `supplierId`, `productId` (valid ObjectId), `costPrice` (positive int), `leadTimeDays` (0–365), `moq` (0+), `isPreferred` (boolean) |
| `updateSupplierProductMappingSchema` | All fields optional |

## Domain Types
Exported from `src/features/supplier/types/index.ts`:
- `ISupplier`, `ISupplierAddress`, `ISupplierContact`, `ISupplierBanking`, `ISupplierSettings`, `ISupplierPerformance`, `ISupplierNote`, `ISupplierProductMapping`
- `SupplierCategory`, `SupplierStatus` (string literal unions)
- `SupplierCategoryEnum`, `SupplierStatusEnum` (const objects)
- `SupplierListOptions`, `SupplierSortOptions`, `PaginatedResult<T>`
