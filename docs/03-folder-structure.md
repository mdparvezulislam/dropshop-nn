# 03 - Folder Structure

## Project Map

```
dropshop-nn/
├── docs/                      # Foundational architecture docs
├── src/
│   ├── app/                   # Next.js App Router (Layouts, Pages, Routes)
│   │   ├── auth/              # Auth pages (Login, Forgot Password, Reset Password, Unauthorized)
│   │   └── dashboard/
│   │       ├── products/      # Product catalog pages
│   │       ├── suppliers/     # Supplier view pages
│   │       ├── pricing/       # Pricing list, editor, bulk update
│   │       ├── inventory/     # Inventory dashboard, adjust, history, low-stock
│   │       └── resellers/     # Reseller list, details, products, pricing
│   ├── features/              # Feature modules (Domain-driven modules)
│   │   ├── auth/
│   │   │   ├── domain/        # Core entities (user-entity, role-entity, permission-entity)
│   │   │   ├── repositories/  # Database access layer
│   │   │   ├── services/      # Business logic services
│   │   │   ├── components/    # Feature specific UI components
│   │   │   ├── actions/       # Server actions
│   │   │   ├── hooks/         # Custom client state hooks
│   │   │   └── types/         # Feature type schemas (validation)
│   │   ├── supplier/
│   │   │   ├── domain/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── actions/
│   │   │   └── types/
│   │   ├── product/
│   │   │   ├── domain/        # Catalog only (no price/stock)
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── actions/
│   │   │   └── types/
│   │   ├── pricing/
│   │   │   ├── domain/        # ProductPricing, profit types
│   │   │   ├── repositories/  # pricing-model, pricing-repository
│   │   │   ├── services/      # pricing-service, profit-calculation-service
│   │   │   ├── actions/       # pricing-actions
│   │   │   └── types/         # Zod pricing schemas
│   │   ├── inventory/
│   │   │   ├── domain/        # ProductInventory, InventoryHistory, SupplierInventory
│   │   │   ├── repositories/  # inventory-model, inventory-repository
│   │   │   ├── services/      # inventory-service, stock-calculation-service
│   │   │   ├── actions/       # inventory-actions
│   │   │   └── types/         # Zod inventory schemas
│   │   ├── reseller/
│   │   │   ├── domain/        # Reseller, ResellerProduct (never mutates Product)
│   │   │   ├── repositories/  # reseller-model, reseller-repository
│   │   │   ├── services/      # reseller-service, product-assignment, reseller-pricing
│   │   │   ├── actions/       # reseller-actions
│   │   │   └── types/         # Zod reseller schemas
│   │   └── ... (orders, payments, courier, wallet, invoices)
│   ├── shared/                # Code shared across multiple feature domains
│   │   ├── components/        # Shared UI components
│   │   │   ├── ui/            # Primitives (Button, DataTable, Dialog, …)
│   │   │   ├── workspace/     # App shell + page layouts (Sidebar, Topbar, ListLayout)
│   │   │   ├── forms/         # Form composites (CurrencyInput, TagsInput, FormField)
│   │   │   └── editor/        # Tiptap RichTextEditor
│   │   ├── config/            # System config (env validation, app-config)
│   │   ├── constants/         # Global domain constants (routes, permissions, stock, pricing)
│   │   ├── errors/            # Custom AppError classes
│   │   ├── hooks/             # Utility React hooks
│   │   ├── lib/               # Shared libraries (mongoose, redis, bullmq, auth, imagekit)
│   │   ├── types/             # Shared TypeScript typings
│   │   └── utils/             # Helper functions
├── docs/ui/                   # Design system documentation (UI-001)
```

## Pricing & Inventory Independence

```
Supplier ──► SupplierInventory ──► Product (catalog)
                                      │
                                      ├──► ProductPricing
                                      └──► ProductInventory ──► InventoryHistory
```

Product contains catalog data only. All stock, pricing, and availability live in dedicated modules.

## Reseller Independence

```
Product (master — read-only for resellers)
        │
        ▼
ResellerProduct ──► Reseller
```

Suppliers and Resellers are separate modules with no shared write path on Product.
