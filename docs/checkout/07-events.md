# Checkout Events

## Published Events
| Event Type | Payload | Trigger |
|---|---|---|
| `checkout.cart_created` | `CartCreatedPayload` | New cart created |
| `checkout.cart_updated` | `CartUpdatedPayload` | Item added, removed, or quantity changed |
| `checkout.started` | `CheckoutStartedPayload` | Checkout session initiated |
| `checkout.validated` | `CheckoutValidatedPayload` | Prices and inventory validated |
| `checkout.inventory_reserved` | `InventoryReservedPayload` | Stock reserved for items |
| `checkout.order_draft_created` | `OrderDraftCreatedPayload` | Order draft persisted |
| `checkout.expired` | `CheckoutExpiredPayload` | Session timed out |

## Expected Subscribers
| Subscriber | Events | Action |
|---|---|---|
| Order Engine | `checkout.order_draft_created` | Convert draft to order |
| Inventory Engine | `checkout.inventory_reserved`, `checkout.expired` | Manage reservation lifecycle |
| Pricing Engine | `checkout.order_draft_created` | Snapshot prices for audit |
| Analytics Engine | All | Track funnel metrics |
| Notification Engine | `checkout.started`, `checkout.order_draft_created` | User notifications |
| Audit Engine | All | Immutable audit trail |

## Event Payloads

### CartCreatedPayload
```typescript
{
  cartId: string;
  type: string;
  sessionId?: string;
  userId?: string;
}
```

### CheckoutStartedPayload
```typescript
{
  checkoutId: string;
  cartId: string;
  type: string;
}
```

### OrderDraftCreatedPayload
```typescript
{
  draftId: string;
  checkoutId: string;
  cartId: string;
  type: string;
  grandTotal: number;
  itemCount: number;
}
```

### CheckoutExpiredPayload
```typescript
{
  checkoutId: string;
  cartId: string;
  reason?: string;
}
```

## Registration
Events are registered in `init.ts` via `EventRegistry.register()`. All checkout events use handler type `async` with default retry config.
