# Order Module — Overview

## Purpose
The Order module is the enterprise order management engine for DropshopNN. It owns the complete order lifecycle, state machine, timeline, validation, events, history, and business rules — without owning pricing, inventory, finance, courier, or analytics.

## Responsibilities
- **Order Lifecycle** — full lifecycle from draft through delivery, completion, cancellation, return, and refund
- **State Machine** — 16-state immutable state machine with enforced valid transitions
- **Customer Snapshot** — immutable clone of customer details at time of order creation
- **Pricing Snapshot** — immutable clone of resolved pricing at time of order creation
- **Order Timeline** — every status change, action, user interaction, system event, and automation recorded
- **Order Events** — domain events published for Finance, Courier, Analytics, Notification, Audit, and Automation engines
- **Inventory Release** — requests inventory release on cancellation of confirmed orders

## Boundaries
| Owns | Delegates to | Must NOT touch |
|---|---|---|
| Order lifecycle (CRUD + state machine) | Pricing Engine (price calculation) | Product catalog edits |
| Order status transitions | Inventory Engine (stock reserve/release) | Customer wallet/balance |
| Order timeline & audit trail | Courier Engine (dispatch) | Supplier payments |
| Customer/pricing snapshots | Finance Engine (settlement) | Analytics dashboard |
| Order events publishing | Notification Engine (alerts) | Tax calculation |

## Order Types
| Type | Identifier | Use Case |
|---|---|---|
| `guest` | sessionId | Guest checkout orders |
| `customer` | customerId | Registered customer orders |
| `reseller` | resellerId | Reseller orders |
| `wholesaler` | wholesaleId | Wholesale bulk orders |

## Location
All order code lives under `src/features/order/`:
- `domain/` — order entity, state machine, timeline entity, domain events
- `types/` — Zod validation schemas
- `repositories/` — Mongoose models and repositories for orders and timeline entries
- `services/` — order service, timeline service
- `actions/` — Next.js Server Actions
