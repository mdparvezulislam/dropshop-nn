# Checkout API Boundaries

## Module Dependency Map

```
Checkout
    │
    ├── reads → Cart (own model)
    ├── reads → CheckoutSession (own model)
    ├── reads → OrderDraft (own model)
    │
    ├── calls → PricingService.getPricingByProduct()
    │         (NEVER writes pricing data)
    │
    ├── calls → InventoryService.getInventoryByProduct()
    │         InventoryService.reserveStock()
    │         InventoryService.releaseStock()
    │         (NEVER writes inventory levels directly)
    │
    └── publishes → Events to EventBus
                  (Order Engine, Analytics, etc. subscribe)
```

## What Checkout MUST NOT Do

| Prohibited Action          | Reason                              |
| -------------------------- | ----------------------------------- |
| Write to ProductPricing    | Pricing Engine ownership            |
| Write to ProductInventory  | Inventory Engine ownership          |
| Create final Orders        | Order Engine ownership              |
| Process payments           | Payment Engine ownership            |
| Access wallet/finance      | Wallet/Finance Engine ownership     |
| Compute prices locally     | Must route through Pricing Engine   |
| Validate stock locally     | Must route through Inventory Engine |
| Trust frontend price/stock | Security violation                  |

## Boundary Verification Checklist

- [ ] No direct import of Pricing Mongoose model
- [ ] No direct import of Inventory Mongoose model
- [ ] No direct import of Order Mongoose model
- [ ] All price data flows through `PriceResolutionService`
- [ ] All stock data flows through `InventoryValidationService`
- [ ] Order draft is read-only (no update operations)
- [ ] Cart status transitions are idempotent
- [ ] Event publishes use typed payloads
