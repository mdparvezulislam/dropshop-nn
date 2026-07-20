# Checkout Module — Overview

## Purpose
The Checkout module is the centralized cart and checkout engine for DropshopNN. It orchestrates price resolution (delegated to Pricing Engine), inventory validation (delegated to Inventory Engine), shipping collection, and order draft creation — without ever owning pricing, inventory, or orders.

## Responsibilities
- **Shopping Cart** — guest, customer, reseller, and wholesale carts with persistent storage
- **Price Resolution** — delegates all price calculation to the Pricing Engine
- **Inventory Validation** — delegates all stock checks to the Inventory Engine
- **Inventory Reservation** — requests stock reservations from Inventory Engine
- **Order Draft Creation** — creates an immutable draft of the resolved checkout for downstream order processing

## Boundaries
| Owns | Delegates to | Must NOT touch |
|---|---|---|
| Cart CRUD | Pricing Engine (prices) | Final Order creation |
| Checkout session lifecycle | Inventory Engine (stock) | Payment processing |
| Shipping info collection | — | Wallet / Finance |
| Order draft creation | — | Courier / Shipping execution |
| Checkout events | — | Product catalog edits |

## Cart Types
| Type | Identifier | Use Case |
|---|---|---|
| `guest` | `sessionId` | Anonymous browsing |
| `customer` | `userId` | Registered customer |
| `reseller` | `resellerId` | Reseller order placement |
| `wholesaler` | `wholesaleId` | Wholesale bulk ordering |

## Location
All checkout code lives under `src/features/checkout/`:
- `domain/` — cart, checkout session, order draft entities and domain events
- `types/` — Zod validation schemas
- `repositories/` — Mongoose models and repositories
- `services/` — cart service, checkout orchestration, price resolution, inventory validation
- `actions/` — Next.js Server Actions
