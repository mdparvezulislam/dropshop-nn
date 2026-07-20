# Order Module — Entity Structure

## Order

```typescript
interface Order extends BaseDBEntity {
  orderNumber: string;                    // Human-readable, unique (e.g. ORD-20240719-0001)
  type: OrderType;                        // guest | customer | reseller | wholesaler
  status: OrderStatus;                    // Current state machine state
  previousStatuses: OrderStatus[];        // Ordered history of all prior statuses
  checkoutDraftId: string;                // Source checkout draft reference
  checkoutId: string;                     // Source checkout session reference
  cartId: string;                         // Source cart reference
  customer: CustomerSnapshot;             // Immutable customer info at order time
  shipping: ShippingSnapshot;             // Immutable shipping info at order time
  pricing: OrderPricingSnapshot;          // Immutable pricing snapshot
  profitPreview?: OrderProfitPreview;     // Profit preview from checkout
  shippingInfo?: OrderShippingInfo;       // Courier/tracking info (mutable)
  timeline: OrderTimelineEntry[];         // Embedded timeline entries
  items: OrderItem[];                     // Order line items
  note?: string;                          // Public note
  internalNote?: string;                  // Internal/admin note
  tags?: string[];                        // Categorization tags
  supplierReferences?: SupplierReference[]; // Supplier info for routing
  source?: string;                        // Origin channel
  autoConfirmed?: boolean;                // Was auto-confirmed
  resellerId?: string;                    // Reseller reference
  wholesaleId?: string;                   // Wholesale reference
  completedAt?: Date;
  cancelledAt?: Date;
  returnedAt?: Date;
  refundedAt?: Date;
  failedAt?: Date;
  expiresAt?: Date;
}
```

## Key Sub-types

### CustomerSnapshot (immutable)
- `customerId`, `name`, `phone`, `email`, `alternativePhone`

### ShippingSnapshot (immutable)
- `receiverName`, `phone`, `alternativePhone`, `division`, `district`, `upazila`, `area`, `address`, `deliveryNote`

### OrderPricingSnapshot (immutable)
- `items[]` — each with `productId`, `variantSku`, `productName`, `quantity`, `unitSellingPrice`, `unitWholesalePrice`, `unitCostBasis`, `totalSellingPrice`, `totalCostBasis`, `totalProfit`, `marginPercent`, `currency`, `pricingSource`, `campaignId`, `appliedRules`
- `subtotal`, `discountTotal`, `taxTotal`, `grandTotal`, `currency`

### OrderItem
- `productId`, `variantSku`, `productName`, `quantity`, `unitPrice`, `totalPrice`, `unitCost`, `totalCost`, `unitProfit`, `totalProfit`

### OrderShippingInfo (mutable)
- `courierId`, `courierName`, `trackingNumber`, `trackingUrl`, `estimatedDeliveryDate`, `actualDeliveryDate`, `shippingCost`

### OrderTimelineEntry
- `id`, `eventType`, `action`, `summary`, `actor`, `changes[]`, `metadata`, `correlationId`, `timestamp`
