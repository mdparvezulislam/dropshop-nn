# 13 - Order Engine API Boundaries

## Entrypoints

### Ingestion API

- `createFromDraft(input: CreateOrderFromDraftInput): Promise<Order>`
  - Accepts checkout draft mapping.
  - Generates unique order number.
  - Automatically publishes `order.created`.

### Transitions API

- `transitionStatus(orderId, toStatus, actor, reason): Promise<Order>`
  - Processes state validation checks.
  - Publishes target domain events.
