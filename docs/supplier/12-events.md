# Domain Events

## Event Types
| Event | Payload | Fired When |
|---|---|---|
| `supplier.created` | `SupplierCreatedPayload` | New supplier created |
| `supplier.updated` | `SupplierUpdatedPayload` | Supplier profile details updated |
| `supplier.status_changed` | `SupplierStatusChangedPayload` | Status transition occurs |
| `supplier.deleted` | `SupplierDeletedPayload` | Supplier deleted |
| `supplier.performance_updated` | `SupplierPerformanceUpdatedPayload` | Performance metrics recalculated |
| `supplier.product_mapped` | `ProductMappedPayload` | Product mapped to supplier |
| `supplier.product_mapping_updated` | `ProductMappingUpdatedPayload` | Existing mapping updated |
| `supplier.product_mapping_removed` | `ProductMappingRemovedPayload` | Mapping removed |

## Event Structure
```typescript
interface SupplierEvent {
  type: SupplierEventType;
  payload: SupplierEventPayload;
  timestamp: Date;
  correlationId?: string;
}
```

## Event Payload Details

### SupplierCreatedPayload
| Field | Type |
|---|---|
| `supplierId` | `string` |
| `code` | `string` |
| `businessName` | `string` |
| `email` | `string` |
| `category` | `string` |
| `createdBy` | `string?` |

### SupplierStatusChangedPayload
| Field | Type |
|---|---|
| `supplierId` | `string` |
| `previousStatus` | `string` |
| `newStatus` | `string` |
| `changedBy` | `string?` |

### ProductMappedPayload
| Field | Type |
|---|---|
| `supplierId` | `string` |
| `productId` | `string` |
| `supplierSku` | `string` |
| `costPrice` | `number` |
| `mappedBy` | `string?` |

## Consumer Expectations
- Catalog module should listen for `supplier.status_changed` to mark inactive/blocked suppliers as unavailable.
- Pricing module should listen for cost price updates to re-evaluate price rules.
- Inventory module should listen for lead-time changes on mapped products.
