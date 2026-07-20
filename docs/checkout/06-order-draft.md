# Order Draft

## Purpose

The Order Draft is the output of a successful checkout. It is an immutable record of the resolved prices, inventory reservations, shipping details, and computed totals — ready for the Order Engine to convert into a final order.

## OrderDraft Fields

| Field                   | Type                       | Description                       |
| ----------------------- | -------------------------- | --------------------------------- |
| `checkoutId`            | `string`                   | FK to the checkout session        |
| `cartId`                | `string`                   | FK to the original cart           |
| `type`                  | `CartType`                 | Customer type at time of checkout |
| `resolvedPrices`        | `CheckoutPriceItem[]`      | Final resolved prices per item    |
| `inventoryReservations` | `CheckoutInventoryItem[]`  | Reservation confirmations         |
| `shipping`              | `CheckoutShippingInfo`     | Shipping details                  |
| `totals`                | `CheckoutTotals`           | Computed monetary totals          |
| `profitPreview`         | `CheckoutProfitPreview?`   | Profit projection                 |
| `metadata`              | `Record<string, unknown>?` | Extensible metadata               |

## Totals Structure

| Field           | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `subtotal`      | Sum of resolved prices                                           |
| `discountTotal` | Sum of all discounts (0 in current implementation)               |
| `taxTotal`      | Sum of taxes (0 in current implementation, ready for tax engine) |
| `grandTotal`    | subtotal − discountTotal + taxTotal                              |
| `currency`      | ISO 4217                                                         |

## Profit Preview

| Field            | Description                          |
| ---------------- | ------------------------------------ |
| `totalCostBasis` | Sum of cost bases across items       |
| `totalRevenue`   | Same as grandTotal                   |
| `totalProfit`    | totalRevenue − totalCostBasis        |
| `averageMargin`  | (totalProfit / totalCostBasis) × 100 |

## What OrderDraft is NOT

- NOT a final order — no order number, no fulfillment, no payment
- NOT a payment record — no transaction IDs
- NOT a shipping label — no courier assignment
- NOT modifiable after creation — it is read-only

## Downstream Use

The Order Engine picks up `order_draft_created` events to convert drafts into proper orders. This is a separate responsibility outside the Checkout module.
