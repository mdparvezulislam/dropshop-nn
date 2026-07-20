# Core Entities

## Supplier (`ISupplier`)

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Auto-generated MongoDB ID |
| `businessName` | `string` | Registered business name |
| `code` | `string` | Unique short code (uppercase, alphanumeric) |
| `email` | `string` | Primary contact email |
| `phone` | `string` | Primary phone number |
| `category` | `SupplierCategory` | `wholesaler`, `manufacturer`, `distributor`, `dropshipper`, `independent` |
| `status` | `SupplierStatus` | `pending`, `active`, `inactive`, `suspended`, `blocked`, `archived` |
| `address` | `ISupplierAddress` | Physical / registered address |
| `contacts` | `ISupplierContact[]` | Multiple named contacts with roles |
| `banking` | `ISupplierBanking` | Payment details |
| `settings` | `ISupplierSettings` | Shipping, return, payment, notification preferences |
| `performance` | `ISupplierPerformance` | Calculated score and metrics |
| `notes` | `ISupplierNote[]` | Internal notes with author and timestamps |
| `tags` | `string[]` | Arbitrary labels |
| `website` | `string?` | Business website |
| `facebook` | `string?` | Facebook page or profile |
| `whatsApp` | `string?` | WhatsApp number |
| `orderEmail` | `string?` | Email for sending purchase orders |
| `createdBy` | `string?` | User ID who created |
| `createdAt` | `Date` | Auto-generated |
| `updatedAt` | `Date` | Auto-generated |

## Status Workflow
```
pending ──> active ──> suspended
                │          │
                ├──> inactive    └──> blocked
                │
                └──> archived
```

## SupplierProductMapping

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | Auto-generated |
| `supplierId` | `ObjectId` | FK to Supplier |
| `productId` | `ObjectId` | FK to Catalog product |
| `supplierSku` | `string` | Supplier's own SKU |
| `costPrice` | `number` | Unit cost in cents |
| `leadTimeDays` | `number` | Typical lead time |
| `moq` | `number` | Minimum order quantity |
| `isPreferred` | `boolean` | Preferred supplier flag |
| `notes` | `string` | Free-text mapping notes |
| `createdBy` | `string?` | User ID |
| `updatedBy` | `string?` | User ID |
| `createdAt` | `Date` | |
| `updatedAt` | `Date` | |

Unique compound index on `(supplierId, productId)`.
