# 01 - Project Roadmap

## Phase 0: Project Foundation (Completed)

- Complete directory setup, linting/formatting rules, and dev workflows.
- Set up configuration validation and db/caching connections (MongoDB, Redis, BullMQ, ImageKit).
- Implement standard error handlers, loggers, and API responders.

## Phase 1: Core Infrastructure (Completed)

- Build shared configurations, constants, formatters, and helper utilities.
- Centralize Zod validations and custom exceptions.
- Provide primary UI blocks (Card, Table, Badge, Spinner, Skeleton, EmptyState, ErrorState).

## Phase 2: Database Foundation & Mongoose Infrastructure (Completed)

- Connection manager cache, retry strategies, and graceful process teardown handlers.
- Base schemas with timestamp tracking and Soft Delete query hooks.
- Generic Repository class abstracting Mongoose CRUD and session transactions.

## Phase 3: Identity & Authentication Foundation (Completed)

- Implement Credentials authentication utilizing AuthService and bcryptjs hashing.
- Protect routes with edge-compatible Middleware routing filters.
- Set up Zod authentication validations and sleek UI screens (Login, Forgot Password, Reset Password, Unauthorized).

## Phase 4: Enterprise Supplier Management Platform (Completed)

- Mongoose schema with embedded profiles, settings, contacts, documents, and bank details.
- SupplierRepository extending generic boundaries.
- Secure Server Actions with role permission controls.
- Onboarding, listing, editing, and detailed tab pages.

## Phase 5: Product Catalog Foundation (Completed)

- Product domain independent of pricing and inventory.
- Brand, Category, ProductTag, variants, media, attributes, SEO.
- Product repository, service, search service, Zod validation, server actions.
- Dashboard product list, create wizard, detail, and edit pages.

## Phase 6: Enterprise Pricing & Inventory Foundation (Completed)

- **Pricing module** fully independent from Product (catalog only).
- ProductPricing model: cost/sell/wholesale/reseller/compare/promo prices, tax & commission ready.
- Pricing rules: fixed, percentage, supplier/category/brand based, dynamic-ready.
- ProfitCalculationService + PricingService + PricingRepository.
- **Inventory module** fully independent from Product.
- ProductInventory, InventoryHistory, SupplierInventory models.
- Stock operations: in/out/adjustment/reservation/release/transfer-ready.
- StockCalculationService + InventoryService + reusable repositories.
- Warehouse-ready fields (`warehouseId`) without full WMS implementation.
- Permissions: Inventory.View/Update/Adjust, Pricing.View/Update/Override.
- Audit events via structured logger: Price Changed, Stock Updated, Stock Adjusted, Supplier Price Changed, Inventory Imported.
- UI: Pricing list/editor/bulk; Inventory dashboard/list/adjust/history/low-stock.

## Phase 7: Enterprise Reseller Management Platform (Completed)

- Reseller module fully independent from Suppliers.
- Reseller profile: business, owner, contact, address, NID/trade-license ready, status lifecycle.
- ResellerProduct private catalog — master Product never modified.
- Reseller-only pricing (selling, discount, margin, recommended, reset).
- Collections, favorites, product groups, tags.
- Customer-ready architecture stubs (not implemented).
- Dashboard stats: total/active/hidden products; revenue/orders/wallet ready flags.
- Search: product, status, category/supplier filter hooks.
- Repositories: Reseller, ResellerProduct (+ Collection, Group).
- Services: ResellerService, ProductAssignmentService, ResellerPricingService.
- Permissions: Reseller.Create/View/Update/Suspend.
- Audit: Reseller Created/Updated, Product Added/Removed, Price Updated.
- UI: list, details, edit, my products, assignment, pricing.

## UI-001: Enterprise Workspace & Design System (Completed)

- Commerce OS app shell: sidebar, topbar, breadcrumbs, command palette, notifications, user menu.
- Design tokens in `globals.css` (dark-first Linear/Stripe aesthetic).
- Shared layouts: List, Details, Create (studio).
- Design system components: buttons, forms, data table, status chips, stat cards, toolbar.
- Tiptap rich text editor for product descriptions (reusable).
- Workspace home dashboard (attention + activity, not vanity stats).
- Product Studio create experience.
- Redesigned Products, Suppliers, Inventory, Pricing list surfaces.
- Documentation under `docs/ui/`.
- **No** model/repository/service/API contract changes.
