# Order Module — Implementation Guide

## File Structure

```
src/features/order/
├── domain/
│   ├── order-entity.ts          # Order, CustomerSnapshot, ShippingSnapshot, etc.
│   ├── state-machine.ts         # 16-state machine, transitions, guards
│   ├── order-timeline.ts        # Timeline entity types
│   └── order-events.ts          # Event payloads and type union
├── types/
│   └── validation.ts            # Zod schemas for all inputs
├── repositories/
│   ├── order-model.ts           # Mongoose schema + model for orders
│   ├── order-repository.ts      # OrderRepository extends BaseRepository
│   └── timeline-model.ts        # Mongoose schema + model for timeline
├── services/
│   ├── order-service.ts         # Order lifecycle, transitions, events
│   └── order-timeline-service.ts # Timeline append/query
├── actions/
│   └── order-actions.ts         # 12 server actions with auth + validation
├── init.ts                      # Feature flags, settings, event registration
└── index.ts                     # Barrel exports
```

## Setup Steps

### 1. Feature Flags
```typescript
import { registerOrderFeatureFlags } from "@/features/order";
registerOrderFeatureFlags();
```
Call this in the app initialization (e.g., `src/app/layout.tsx` or a provider).

### 2. Event Subscriptions
Register the `checkout.order_draft_created` → order creation handler:
```typescript
EventRegistry.registerAsyncSubscriber("checkout.order_draft_created", {
  eventType: "checkout.order_draft_created",
  queue: "order-creation",
  handlerName: "createOrderFromDraftHandler",
  handle: async (event) => {
    const { draftId, checkoutId, cartId, type, grandTotal } = event.data;
    // Build and call OrderService.createFromDraft()
  },
});
```

### 3. Environment Variables
None required for the order module itself. Connections are shared via `DatabaseConnectionManager`.

## Testing

### Unit Tests
- State machine: every valid/invalid transition
- Order creation: duplicate draftId guard, autoConfirm behavior
- Timeline: entry creation in both collections
- Status transition: permission checks, event publishing
- Cancellation: inventory release trigger

### Integration Tests
- Full lifecycle: draft → pending → confirmed → packed → dispatched → delivered → completed
- Return flow: delivered → return_requested → return_initiated → returned → refunded
- Cancellation with inventory release
- List + filter + pagination

## Boundary Verification
- No direct imports of pricing module entities
- No direct imports of inventory module entities (dynamic import only)
- No direct imports of courier, finance, or analytics modules
- All cross-module communication is event-driven
- All monetary values in integer cents

## Future Expansion

### Phase 2
- **Batch operations**: bulk status transitions, bulk courier assignment
- **Order splitting**: split multi-item orders by supplier or warehouse
- **Scheduled jobs**: auto-complete, auto-cancel expired drafts

### Phase 3
- **Supplier routing**: auto-assign items to suppliers
- **Multi-warehouse**: route items from closest warehouse
- **Returns portal**: self-service customer return request
