# Implementation Notes

## Files Created

### Domain (3 files)

| File                        | Content                                           |
| --------------------------- | ------------------------------------------------- |
| `domain/cart-entity.ts`     | Cart and CartItem types                           |
| `domain/checkout-entity.ts` | CheckoutSession, OrderDraft, and supporting types |
| `domain/checkout-events.ts` | Event payloads and type definitions               |

### Validation (1 file)

| File                  | Content                                                 |
| --------------------- | ------------------------------------------------------- |
| `types/validation.ts` | Zod schemas for all cart, checkout, and shipping inputs |

### Repositories (4 files)

| File                                  | Content                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| `repositories/cart-model.ts`          | Mongoose schema for `carts` collection                      |
| `repositories/cart-repository.ts`     | Cart data access with active/lookup queries                 |
| `repositories/checkout-model.ts`      | Mongoose schemas for `checkout_sessions` and `order_drafts` |
| `repositories/checkout-repository.ts` | Checkout session and order draft data access                |

### Services (4 files)

| File                                       | Content                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| `services/price-resolution-service.ts`     | Delegates price resolution to Pricing Engine                   |
| `services/inventory-validation-service.ts` | Delegates stock validation to Inventory Engine                 |
| `services/cart-service.ts`                 | Cart CRUD, item management, abandoned cart detection           |
| `services/checkout-service.ts`             | Full checkout orchestration: start → resolve → reserve → draft |

### Actions (1 file)

| File                          | Content                                         |
| ----------------------------- | ----------------------------------------------- |
| `actions/checkout-actions.ts` | Server Actions for cart and checkout operations |

### Registry (2 files)

| File       | Content                                 |
| ---------- | --------------------------------------- |
| `init.ts`  | Feature flags, settings, event registry |
| `index.ts` | Public API barrel exports               |

## Key Design Decisions

1. **Separation of Cart and Checkout** — Cart manages items and persistence; Checkout manages the order placement flow. This allows cart reuse and independent lifecycle management.

2. **Price Resolution on Cart Add** — Prices are resolved at `addItem` time and stored on the cart item. They are re-resolved at checkout start to ensure freshness.

3. **Sequential Checkout Steps** — The checkout flow is strictly sequential with step tracking. Each step validates prerequisites before proceeding.

4. **TTL-Based Session Expiry** — Checkout sessions self-expire via MongoDB TTL index. No cron job required for cleanup.

5. **Event-Driven Downstream** — Checkout publishes events; it never calls Order Engine, Notification Engine, etc. directly.

6. **No Wholesale MOQ Logic in Checkout** — MOQ validation belongs to the Wholesaler module, not Checkout. Checkout resolves wholesale prices and passes quantity through.

7. **Profit Preview is Estimated** — The profit preview in cart items and the order draft is a best-effort calculation based on available cost data. Final profit calculation belongs to the Order/Finance engine.

## Type Checking

```bash
npx tsc --noEmit
```

## Boundary Verification

Run the verification checklist in `11-api-boundaries.md` before considering implementation complete.
