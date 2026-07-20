# DropshopNN — Project Summary

## Current Status

All 11 engines are registered and operational: IDENTITY, CATALOG, PRICING, INVENTORY, SUPPLIER, CHECKOUT, ORDER, CUSTOMER, FINANCE, COURIER. The platform has 4 workspaces (Admin, Reseller, Wholesale, Supplier) plus Auth pages. Build compiles with zero TypeScript errors.

## Latest Completed Phase

**Supplier Workspace** — self-service supplier portal at `/supplier/`. Full sidebar nav (Dashboard, Products, Inventory, Purchase Orders, Deliveries, Orders, Payments, Reports, Profile, Settings). Reuses Catalog, Inventory, Order, and Finance engines. All pages use shared ListLayout + DataTable + StatCard components. Production build verified.

## Current Phase

Documentation cleanup — consolidated ~200 markdown files into README.md (Bangla) + docs/00-project.md (short summary). Removed all engine-specific, architecture, events, and planning docs.

## Next Planned Phase

**Customer Workspace** — public-facing storefront at `/customer/` with browsing, cart, checkout, order tracking, and profile management.
