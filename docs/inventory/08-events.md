# 08 - Inventory Events

## Event Types

| Event                             | Payload                                        | Trigger                     |
| --------------------------------- | ---------------------------------------------- | --------------------------- |
| `inventory.created`               | productId, variantSku, availableStock          | First inventory record      |
| `inventory.updated`               | productId, variantSku, changedFields           | Any inventory field changed |
| `inventory.stock_reserved`        | productId, variantSku, quantity, referenceId   | Stock reservation           |
| `inventory.stock_released`        | productId, variantSku, quantity, referenceId   | Stock release               |
| `inventory.stock_adjusted`        | productId, variantSku, operation, before/after | Manual adjustment           |
| `inventory.stock_sold`            | productId, variantSku, quantity, referenceId   | Order fulfillment           |
| `inventory.stock_returned`        | productId, variantSku, quantity                | Customer return             |
| `inventory.stock_damaged`         | productId, variantSku, quantity                | Damage marking              |
| `inventory.low_stock_detected`    | productId, variantSku, currentStock, threshold | Threshold crossed           |
| `inventory.out_of_stock_detected` | productId, variantSku                          | Stock reached zero          |

## Event Payloads

### StockReservedPayload

```typescript
{
  productId: string;
  variantSku?: string;
  quantity: number;
  referenceId?: string;
  availableAfterReserve: number;
}
```

### LowStockDetectedPayload

```typescript
{
  productId: string;
  variantSku?: string;
  currentStock: number;
  lowStockThreshold: number;
}
```

## Subscribers

| Event                             | Downstream Effect                                |
| --------------------------------- | ------------------------------------------------ |
| `inventory.created`               | Catalog: update stock metadata                   |
| `inventory.updated`               | Search: reindex availability; Dashboard: refresh |
| `inventory.stock_reserved`        | Checkout: confirm reservation; Analytics: track  |
| `inventory.stock_released`        | Checkout: update availability                    |
| `inventory.stock_sold`            | Analytics: record sale; Reports: update          |
| `inventory.low_stock_detected`    | Notification: alert admin; Dashboard: flag       |
| `inventory.out_of_stock_detected` | Catalog: update visibility; Search: demote       |
