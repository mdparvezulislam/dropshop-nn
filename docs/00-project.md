# DropshopNN — Project Summary

## Current Status

Role-driven commerce platform with 11 engines (IDENTITY, CATALOG, PRICING, INVENTORY, SUPPLIER, CHECKOUT, ORDER, CUSTOMER, FINANCE, COURIER) and 4 workspaces (Admin, Reseller, Wholesale, Supplier). Single Pricing Engine, single Checkout pipeline, single Order Engine. Shared workspace shell (`WorkspaceLayout` + parameterized `Topbar`), shared list shell (`ResourceListPage`), and role-aware checkout entry (`completeRoleCheckoutAction`). Middleware protects all workspace routes. Production build passes.

## Latest Completed Phase

**ARCHITECTURE-ALIGNMENT-001** — Deduplicated pricing math (ProfitCalculationService is sole source); fixed margin formula bug; consolidated layouts/topbars/breadcrumbs; introduced ResourceListPage + SettingsPageShell; removed empty skeleton engines; aligned reseller order create with checkout pipeline; secured `/reseller`, `/wholesale`, `/supplier` via middleware.

## Current Phase

Architecture alignment complete. Platform is ready for public storefront work.

## Next Planned Phase

**PUBLIC-WEBSITE-001 / Customer Workspace** — public storefront at role-aware routes (`/products`, `/product/[slug]`, `/checkout`, `/orders`) with Guest/Customer retail behavior, marketing-kit permission gates, and shared Product Card.
