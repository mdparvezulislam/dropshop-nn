# 02 - Order Database Model

## Collection: `orders`

Renders complete order schema parameters inside MongoDB.

### Fields Definition

- `orderNumber` (String, unique, index) - human readable reference.
- `type` (String, enum: guest, customer, reseller, wholesaler) - client type.
- `status` (String, enum: ORDER_STATUSES) - state machine pointer.
- `checkoutDraftId` (String, index) - link to ingested checkout draft.
- `customer` (CustomerSnapshot) - name, phone, email, and NID mappings.
- `shipping` (ShippingSnapshot) - receiver name, contact details, district, division, full address address.
- `pricing` (PricingSnapshot) - total selling prices, tax totals, cost basis, margins, and currency.
- `timeline` (Array of TimelineEntry) - tracking log.
- `items` (Array of OrderItem) - quantities, pricing, and supplier info.
