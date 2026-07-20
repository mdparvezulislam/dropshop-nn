# Supplier Module — Overview

## Purpose
The Supplier module is the single source of truth for supplier profiles, supplier-product mappings, and supplier performance data within DropshopNN. Every other module (Catalog, Pricing, Inventory) reads supplier data exclusively through this module's service layer — no direct model imports from outside.

## Responsibilities
- **Supplier Profile Management** — CRUD for supplier entities (business name, code, contacts, addresses, banking, settings)
- **Supplier Classification** — Categorisation by `SupplierCategory` (wholesaler, manufacturer, distributor, dropshipper, independent)
- **Supplier Status Workflow** — lifecycle: `pending` → `active` → `suspended` / `blocked` / `archived`
- **Product Mapping** — map a supplier to a product with cost price, SKU, lead time, MOQ
- **Performance Tracking** — score, delivery metrics, return rates, order volumes
- **Pricing Import** — parse incoming CSV/PDF/API price-lists (planned)
- **Note & Tag System** — free-text notes and arbitrary tag labels per supplier

## Boundaries
| May read/use | Must NOT touch |
|---|---|
| Shared env config (`src/shared/config/env.ts`) | Pricing calculations (goes to Pricing Service) |
| Shared event bus | Stock levels (goes to Inventory Service) |
| Shared error classes | Product catalog entities directly |
| Shared logger | Order or checkout logic |
| Catalog product ID (as FK reference only) | User / reseller / wallet logic |

## Location
All supplier code lives under `src/features/supplier/`:
- `domain/` — entity interfaces and event contracts
- `types/` — Zod validation schemas and TypeScript types
- `repositories/` — Mongoose models and data-mapping layer
- `services/` — business logic orchestrators
- `actions/` — Next.js Server Actions

## Data Ownership
- Supplier module **owns** the supplier document, supplier-product mapping, performance history, notes and tags.
- Catalog module references supplier IDs via `suppliers: SupplierReference[]`.
- Inventory module references supplier IDs for `SupplierInventory` cost/lead-time data.
- Pricing module may optionally use supplier cost data as a rule input but calls Supplier Service — never reads supplier models directly.
