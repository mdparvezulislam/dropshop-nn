# Price Resolution

## Core Principle

> Checkout never computes prices. All price resolution is delegated to the Pricing Engine via `PriceResolutionService`.

## Integration

`PriceResolutionService` calls `PricingService.getPricingByProduct()` and maps the result to `ResolvedPrice`.

## Price Selection by Role

| Role                  | Source Field       | Pricing Source Label       |
| --------------------- | ------------------ | -------------------------- |
| `retail` / `customer` | `sellingPrice`     | `retail`                   |
| `reseller`            | `resellerPrice`    | `reseller`                 |
| `wholesale`           | `wholesalePrice`   | `wholesale`                |
| Any (with promo)      | `promotionalPrice` | `campaign` or `flash_sale` |

## Resolution Order

1. Load `ProductPricing` by `productId` + optional `variantSku`
2. Select base price by role
3. If `promotionalPrice` is set and lower than base, apply promo
4. Compute `totalPrice = unitPrice × quantity`
5. Compute `profitPreview` from cost basis
6. Return resolved price with source metadata

## Security

- Price is ALWAYS resolved server-side from the Pricing Engine.
- The client never sends a price. Any price from the frontend is ignored.
- The `PriceResolutionService` is the only path for price data into checkout.

## Profit Preview

Each resolved price includes a lightweight profit preview:

- `costBasis` — base cost or purchase price
- `profitAmount` — (unitPrice − costBasis) × quantity
- `profitMargin` — percentage margin
