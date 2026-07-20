# Checkout Automation

## Flow
```
Checkout starts
    │
    ├── [Sync] Audit log entry
    ├── [Sync] Activity timeline update
    │
    ├── [Async] PricingEngine.resolvePrices()
    │       └── PriceResolutionService
    │
    ├── [Async] InventoryEngine.validateStock()
    │       └── InventoryValidationService
    │
    ├── [Async] InventoryEngine.reserveStock()
    │       └── Stock reservation with TTL
    │
    ├── [Async] Order draft created
    │       └── Event: checkout.order_draft_created
    │
    └── [Async] Downstream subscribers
            ├── Order Engine → create order
            ├── Analytics Engine → funnel tracking
            ├── Notification Engine → confirmations
            └── Audit Engine → immutable record
```

## Abandoned Cart Recovery
- `CartService.markAbandoned(before)` — batch marks carts with `lastActivityAt` before threshold
- Configurable via setting `checkout.abandoned_cart_hours` (default 24 hours)
- Enabled/disabled via feature flag `checkout.abandoned_cart_recovery`

## Session Expiry
- Checkout sessions have a TTL via `expiresAt` field with MongoDB TTL index
- Configurable via setting `checkout.session_ttl_minutes` (default 30)
- On expiry, event `checkout.expired` is published for downstream cleanup

## Bulk Operations
- Abandoned cart marking (batch status update)
- Session expiry (automatic via TTL index, manual via `expireSession`)
