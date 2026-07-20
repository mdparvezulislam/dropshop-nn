# Checkout Session

## Lifecycle

```
cart_review
    │
    ▼
price_resolved  ◄── Pricing Engine resolves every item
    │
    ▼
inventory_validated  ◄── Inventory Engine validates stock
    │
    ▼
inventory_reserved  ◄── Inventory Engine reserves stock (TTL-bound)
    │
    ▼
draft_created  ◄── Order Draft is persisted
    │
    ├── completed
    ├── expired (TTL)
    └── failed (validation/rejection)
```

## CheckoutSession Fields

| Field                   | Type                      | Description                                |
| ----------------------- | ------------------------- | ------------------------------------------ |
| `cartId`                | `string`                  | FK to Cart                                 |
| `type`                  | `CartType`                | Mirrors the cart type                      |
| `step`                  | `CheckoutStep`            | Current step in the flow                   |
| `status`                | `CheckoutStatus`          | `active`, `completed`, `expired`, `failed` |
| `resolvedPrices`        | `CheckoutPriceItem[]`     | Prices from Pricing Engine                 |
| `inventoryValidations`  | `CheckoutInventoryItem[]` | Stock check results                        |
| `inventoryReservations` | `CheckoutInventoryItem[]` | Reservation results with IDs               |
| `shipping`              | `CheckoutShippingInfo?`   | Collected shipping details                 |
| `shippingCompleted`     | `boolean`                 | Shipping info collected flag               |
| `totals`                | `CheckoutTotals?`         | Computed cart totals                       |
| `profitPreview`         | `CheckoutProfitPreview?`  | Profit projection                          |
| `draftId`               | `string?`                 | FK to Order Draft                          |
| `expiresAt`             | `Date`                    | TTL for automatic expiry                   |

## Checkout Flow (Full)

1. `startCheckout(cartId)` — validates cart, creates session
2. `resolvePrices(checkoutId)` — resolves all prices from Pricing Engine
3. `reserveInventory(checkoutId)` — validates and reserves stock
4. `setShipping(checkoutId, shipping)` — collects delivery details
5. `createOrderDraft(checkoutId)` — creates immutable draft, marks cart as converted

## Shipping Info

| Field              | Required | Description                   |
| ------------------ | -------- | ----------------------------- |
| `receiverName`     | Yes      | Full name of recipient        |
| `phone`            | Yes      | Contact phone                 |
| `alternativePhone` | No       | Secondary phone               |
| `division`         | Yes      | BD division                   |
| `district`         | Yes      | BD district                   |
| `upazila`          | Yes      | BD upazila                    |
| `area`             | Yes      | BD area                       |
| `address`          | Yes      | Full street address           |
| `deliveryNote`     | No       | Special delivery instructions |
