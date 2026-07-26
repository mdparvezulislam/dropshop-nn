# DROPSHOPNN ENTERPRISE PROJECT AUDIT

**Generated:** 2026-07-25
**Repository:** dropshop-nn (Private)
**Branch:** main
**Build Status:** ✅ `npx tsc --noEmit` passes | ✅ `npx next build` passes

---

## 1. PROJECT OVERVIEW

- **Project Name:** DropshopNN — Enterprise Commerce Operating System
- **Vision:** 14 engines, one unified workspace shell, 4 role-based workspaces (Admin, Reseller, Wholesale, Supplier), public storefront, and Enterprise Business Membership & Approval Center
- **Current Phase:** Phase 5 — Enterprise Catalog Automation & Background Processing
- **Total Source Files:** ~1,142 (`.ts` + `.tsx`)

### Tech Stack

| Layer           | Technology                                       |
| --------------- | ------------------------------------------------ |
| Framework       | Next.js 16.2.10 (React 19.2.4)                   |
| Language        | TypeScript 5.x (`strict: true`)                  |
| Database        | MongoDB via Mongoose 9.x                         |
| Auth            | NextAuth v5 (Credentials provider, JWT strategy) |
| Queue           | BullMQ (via ioredis)                             |
| Cache           | Redis (ioredis singleton)                        |
| UI              | Tailwind CSS v4 + Radix UI primitives            |
| Animation       | Framer Motion 12.x                               |
| Forms           | React Hook Form 7.x (Product Studio only)        |
| Validation      | Zod 4.x                                          |
| Rich Text       | Tiptap 3.x                                       |
| Payments        | None (manual deposit approval only)              |
| File Upload     | ImageKit SDK                                     |
| Package Manager | pnpm (workspace monorepo)                        |

### Deployment Stack

- Node.js runtime with server-side rendering
- MongoDB Atlas or self-hosted MongoDB
- Redis for BullMQ queues + caching
- ImageKit for image CDN
- Build output: Next.js standalone

### Source Structure

```
src/
├── app/                     # 268 pages across 5 route groups
│   ├── (website)/        # Public storefront (~75 pages)
│   ├── dashboard/        # Admin panel (~121 pages)
│   ├── wholesale/        # B2B workspace (~16 pages)
│   ├── reseller/         # Reseller workspace (~14 pages)
│   ├── supplier/         # Supplier workspace (~17 pages)
│   └── api/              # REST endpoints (29 routes)
├── components/              # ~146 shared components
│   ├── ui/               # 22 design system primitives
│   ├── forms/            # 4 form components
│   ├── workspace/        # 18 workspace shell components
│   ├── website/          # ~75 public website components
│   └── editor/           # Tiptap rich text editor
├── features/                # 25 domain modules
│   ├── catalog/          # Products, Brands, Categories (50 files)
│   ├── order/            # Orders, Timeline, COD (80 files)
│   ├── pricing/          # Pricing engine, Rules, Campaigns (70+ files)
│   ├── finance/          # Wallet, Ledger, Profit (47 files)
│   ├── analytics/        # Event ingestion, Dashboards (43 files)
│   ├── automation/       # Workflow engine, Tasks (35 files)
│   ├── courier/          # Provider adapters, Charges (78 files)
│   ├── identity/         # Roles, Memberships, Sessions, Security (70+ files)
│   ├── auth/             # Users, Auth services (30+ files)
│   ├── inventory/        # Stock management (15 files)
│   ├── customer/         # Customer management (9 files)
│   ├── notification/     # In-app notification system (20+ files)
│   ├── product-studio/   # Advanced product creation UI (53 files)
│   ├── settings/         # Settings + Feature flags (11 files)
│   ├── cms/              # Content management (20+ files)
│   ├── cost/             # Cost versioning (10+ files)
│   ├── checkout/         # Checkout engine (10+ files)
│   ├── cart/             # Shopping cart (10+ files)
│   ├── quotation/        # Wholesale quotations (4 files)
│   ├── supplier-workspace/ # Supplier UI config (2 files)
│   └── ...               # wallet, reseller-workspace, etc.
├── lib/                    # ~45 shared infrastructure files
├── config/                 # Env + App config (2 files)
├── constants/              # Global constants (1 file)
├── providers/              # AuthProvider (1 file)
├── hooks/                  # 5 global hooks
└── types/                  # Base entity types
```

---

## 2. IMPLEMENTATION STATUS

### CORE PLATFORM

| Module                | Status      | Notes                                                           |
| --------------------- | ----------- | --------------------------------------------------------------- |
| **Database Layer**    | ✅ Complete | Generic repository, soft-delete, pagination, transactions       |
| **Event Bus**         | ✅ Complete | Hybrid sync/async, BullMQ, idempotency, retry, timeline         |
| **Auth (NextAuth)**   | ✅ Complete | JWT, Credentials, edge-safe config, role/permissions in session |
| **Permission System** | ✅ Complete | Registry (26 modules), 10 system roles, 3-tier checking         |
| **API Routes**        | ✅ Complete | 29 routes, consistent delegation pattern                        |
| **Feature Flags**     | ✅ Complete | 11 flags with role-based access                                 |
| **Settings**          | ✅ Complete | 50+ defaults, cached service                                    |
| **Error Handling**    | ✅ Complete | 7 error types, action-guard pattern                             |
| **ImageKit Upload**   | ✅ Complete | Direct upload utility                                           |

### IDENTITY & AUTH

| Module                       | Status         | Notes                                                     |
| ---------------------------- | -------------- | --------------------------------------------------------- |
| **Authentication**           | ✅ Complete    | CredentialsProvider, JWT sessions, login/register pages   |
| **Users**                    | ✅ Complete    | Entity, service, repository, admin CRUD, CSV import       |
| **Roles**                    | ✅ Complete    | DB roles + system roles, permission matrix                |
| **Business Memberships**     | ✅ Complete    | 8 types, application flow, approval center                |
| **Sessions**                 | ✅ Complete    | MongoDB tracking, admin revoke                            |
| **Security**                 | ✅ Complete    | Lockout, password reset, device tracking, security events |
| **Notifications**            | ✅ Complete    | In-app bell (email/SMS stubbed), event-driven             |
| **Permissions Management**   | ✅ Complete    | Registry, dashboard, authorization dashboard              |
| **Email/Phone Verification** | ❌ Stubbed     | Tokens generated but not sent or stored                   |
| **OAuth Providers**          | ❌ Not Started | Credentials-only auth                                     |

### CATALOG

| Module                     | Status      | Notes                                                        |
| -------------------------- | ----------- | ------------------------------------------------------------ |
| **Products**               | ✅ Complete | Entity, model, service, repository, validation, CRUD actions |
| **Variants**               | ✅ Complete | 5-field generic variant architecture                         |
| **Brands**                 | ✅ Complete | CRUD + repository                                            |
| **Categories**             | ✅ Complete | CRUD + tree                                                  |
| **Collections**            | ✅ Complete | CRUD                                                         |
| **Product Specifications** | ✅ Complete | Key-value with groups                                        |
| **Automation Engine**      | ✅ Complete | Slug, SKU, SEO, pricing, badges (Phase 5)                    |
| **Bulk Operations**        | ✅ Complete | Publish, archive, delete, restore, category/brand change     |
| **Product Media**          | ✅ Complete | Multi-image with featured flag                               |
| **Search**                 | ✅ Complete | Full-text, filters, pagination                               |
| **Product Audit**          | ✅ Complete | Change tracking, versioning                                  |
| **Product SEO**            | ✅ Complete | Meta title/description, JSON-LD structured data              |

### PRICING

| Module                                | Status          | Notes                                                                                          |
| ------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| **Pricing Entity**                    | ✅ Complete     | Per-product/variant, multi-tier (retail/wholesale/reseller)                                    |
| **PricingEngine**                     | ✅ Complete     | 8-level cascade (campaign → global → supplier → brand → category → profile → manual → default) |
| **Global Pricing Rules**              | ✅ Complete     | Per-channel markup with min margin                                                             |
| **Category/Brand/Supplier Overrides** | ✅ Complete     | Priority-based                                                                                 |
| **Pricing Profiles**                  | ✅ Complete     | Reusable named profiles                                                                        |
| **Campaign Pricing**                  | ✅ Complete     | Time-windowed, highest priority                                                                |
| **MOQ Tiers**                         | ✅ Complete     | Bulk discount tiers                                                                            |
| **Additional Costs**                  | ✅ Complete     | Import, shipping, packaging, etc.                                                              |
| **Cost Versioning**                   | ✅ Complete     | Landed cost tracking with versioning                                                           |
| **Profit Calculation**                | ✅ Complete     | Margin, profit amount, commission, tax                                                         |
| **Pricing Approval**                  | ✅ Complete     | Workflow with history                                                                          |
| **Rule Engine**                       | ✅ Complete     | Conditions/actions, 10+ operators                                                              |
| **Wholesale Tiers**                   | 🚧 Inconsistent | Validation schema mismatches domain entity                                                     |

### INVENTORY

| Module                   | Status         | Notes                                                 |
| ------------------------ | -------------- | ----------------------------------------------------- |
| **Product Inventory**    | ✅ Complete    | Stock, reserved, incoming, damaged, returned, sold    |
| **Stock Operations**     | ✅ Complete    | State machine: adjust, reserve, release, stock-in/out |
| **Stock History**        | ✅ Complete    | Audit trail for every mutation                        |
| **Supplier Inventory**   | ✅ Complete    | Per-supplier stock/cost tracking                      |
| **Low Stock Alerts**     | ✅ Complete    | Threshold-based                                       |
| **Warehouse Management** | ❌ Not Started | Flag exists at "beta", no module                      |

### ORDERS

| Module                 | Status      | Notes                                                          |
| ---------------------- | ----------- | -------------------------------------------------------------- |
| **Order Lifecycle**    | ✅ Complete | 16-state machine, timeline tracking                            |
| **Order Service**      | ✅ Complete | Create, transition, cancel, return, refund, courier assignment |
| **COD Reconciliation** | ✅ Complete | Full lifecycle                                                 |
| **Exchange**           | ✅ Complete | Request → approve → pickup → replacement → reject              |
| **Complaints**         | ✅ Complete | Create → assign → resolve → close                              |
| **Failed Deliveries**  | ✅ Complete | Tracking + resolution                                          |
| **Follow-ups**         | ✅ Complete | Recurring scheduling                                           |
| **Call Logs**          | ✅ Complete | With outcome tracking                                          |
| **Export**             | ✅ Complete | CSV export                                                     |
| **Bulk Actions**       | ✅ Complete | Status, courier, etc.                                          |
| **State Machine**      | ✅ Complete | Finite-state machine with 16 states, validations               |

### FINANCE

| Module                  | Status         | Notes                                                                    |
| ----------------------- | -------------- | ------------------------------------------------------------------------ |
| **Wallet/Ledger**       | ✅ Complete    | Double-entry, workspace-isolated, 5 balance calculations                 |
| **Profit Release**      | ✅ Complete    | Event-driven, configurable delay (7d default)                            |
| **Withdrawals**         | ✅ Complete    | Request → review → approve/pay/reject → hold                             |
| **Deposits**            | ✅ Complete    | Request → approve/reject (manual, no payment gateway)                    |
| **Commissions**         | ✅ Complete    | Reseller, referral, platform types                                       |
| **Invoices**            | ✅ Complete    | From completed orders                                                    |
| **Reconciliation**      | ✅ Complete    | Wallet/ledger/order integrity, health score                              |
| **Financial Closing**   | ✅ Complete    | Daily + monthly snapshots                                                |
| **P&L Reports**         | ✅ Complete    | Period-based profit & loss                                               |
| **Analytics Dashboard** | ✅ Complete    | Aggregates, chart data                                                   |
| **Payment Gateway**     | ❌ Not Started | No bKash/Nagad/card integration — deposits require manual admin approval |

### CUSTOMER

| Module                     | Status      | Notes                                |
| -------------------------- | ----------- | ------------------------------------ |
| **Customer CRUD**          | ✅ Complete | Workspace-isolated, phone uniqueness |
| **Address Management**     | ✅ Complete | Typed addresses                      |
| **Customer Statistics**    | ✅ Complete | Refresh from orders                  |
| **Guest Checkout Linking** | ✅ Complete | createOrAttachCustomer               |

### COURIER

| Module                    | Status      | Notes                                   |
| ------------------------- | ----------- | --------------------------------------- |
| **Provider Architecture** | ✅ Complete | Provider pattern with registry          |
| **Charge Calculation**    | ✅ Complete | Zone + weight + COD fee                 |
| **COD Reconciliation**    | ✅ Complete | Expected vs collected                   |
| **Delivery Automation**   | ✅ Complete | Hub history, rider tracking             |
| **Analytics**             | ✅ Complete | Health metrics, shipment stats          |
| **Steadfast Adapter**     | ❌ Stubbed  | No real API call                        |
| **Pathao Adapter**        | ❌ Stubbed  | No real API call                        |
| **Redx Adapter**          | ❌ Stubbed  | No real API call                        |
| **Paperfly Adapter**      | ❌ Stubbed  | No real API call                        |
| **eCourier Adapter**      | ❌ Stubbed  | No real API call                        |
| **Sundarban Adapter**     | ❌ Stubbed  | Self-labeled "Future Ready Integration" |

### ANALYTICS

| Module              | Status      | Notes                                     |
| ------------------- | ----------- | ----------------------------------------- |
| **Event Ingestion** | ✅ Complete | EventBus → fact repository                |
| **Metric Rollups**  | ✅ Complete | Hourly/daily aggregates                   |
| **Query Service**   | ✅ Complete | Overview, sales, funnel, catalog, content |
| **Dashboards**      | ✅ Complete | Executive, live, analytics views          |
| **Snapshots**       | ✅ Complete | Daily/monthly/yearly                      |
| **Export**          | ✅ Complete | CSV                                       |

### AUTOMATION

| Module                | Status      | Notes                                   |
| --------------------- | ----------- | --------------------------------------- |
| **Workflow Engine**   | ✅ Complete | Create, execute, retry, cancel          |
| **Rules Engine**      | ✅ Complete | 10+ operators, nested field resolution  |
| **Scheduler**         | ✅ Complete | Cron-based (simplified)                 |
| **Retry Engine**      | ✅ Complete | DLQ, max retries, exponential backoff   |
| **Task Library**      | ❌ Stubbed  | 15 task handlers — all return mock data |
| **Webhook Execution** | ❌ Stubbed  | Returns 200 without HTTP call           |

### CUSTOMER-FACING

| Module                         | Status         | Notes                                                         |
| ------------------------------ | -------------- | ------------------------------------------------------------- |
| **Public Website**             | ✅ Complete    | 9-section homepage, product pages, blog, about, contact, etc. |
| **Product Details**            | ✅ Complete    | Gallery, variants, tabs/accordion, pricing, marketing kit     |
| **Cart/Checkout**              | ✅ Complete    | Multi-step checkout with customer/shipping/payment/review     |
| **Search**                     | ✅ Complete    | Full-text, filters, trending searches                         |
| **Blog**                       | ✅ Complete    | Articles, TOC, reading progress, sharing                      |
| **Brand Pages**                | ✅ Complete    | Brand-specific catalog pages                                  |
| **Category Pages**             | ✅ Complete    | Filtered product listings                                     |
| **Account Dashboard**          | ✅ Complete    | Orders, profile, addresses, wishlist, memberships             |
| **Become Reseller/Wholesaler** | ✅ Complete    | Public application forms with Bangla                          |
| **Compare Products**           | 🚧 In Progress | Compare drawer exists                                         |
| **Reviews**                    | 🚧 In Progress | Section component exists                                      |

### WORKSPACE SHELLS

| Module                  | Status         | Notes                                                    |
| ----------------------- | -------------- | -------------------------------------------------------- |
| **Admin Dashboard**     | ✅ Complete    | KPI cards, charts, quick actions, attention items        |
| **Reseller Workspace**  | ✅ Complete    | Dashboard, orders, products, wallet, withdrawals         |
| **Wholesale Workspace** | ✅ Complete    | Dashboard, orders, quotations, invoices                  |
| **Supplier Workspace**  | ✅ Complete    | Products, inventory, purchase orders, deliveries         |
| **Product Studio**      | ✅ Complete    | 53 files, 19 sections, 13 hooks, Quick Create + Advanced |
| **CMS**                 | 🚧 In Progress | Content management exists, not deeply audited            |

### MISSING MODULES

| Module                  | Status         | Notes                                                  |
| ----------------------- | -------------- | ------------------------------------------------------ |
| **Marketing**           | ❌ Not Started | Feature directory does not exist                       |
| **Warehouse**           | ❌ Not Started | Multi-warehouse flag exists, no module                 |
| **Reports**             | 🚧 Partial     | Handled inside analytics/finance, no dedicated feature |
| **Payment Gateway**     | ❌ Not Started | No bKash/Nagad integration                             |
| **Email Service**       | ❌ Stubbed     | Logger only — no SMTP/SES integration                  |
| **SMS Service**         | ❌ Stubbed     | Logger only                                            |
| **Push Notifications**  | ❌ Stubbed     | Logger only                                            |
| **Database Migrations** | ❌ Not Started | `/migrations/` is empty                                |

---

## 3. PRODUCT DOMAIN AUDIT

### Current Model (`Product` entity)

```
Identity:  name, slug, sku, barcode?, gtin?, productType?
Classification:  categoryId?, brandId?, supplierId?, tags[], visibility, status, badges[]
Content:  shortDescription?, description?, notice?, specifications[]
Media:  media[]
Variants:  hasVariants?, variants[]
SEO:  metaTitle?, metaDescription?
Legacy:  productModel?, featured?, trending?, flashSale?, newArrival?, seo?, content?, suppliers[], searchMetadata?
```

### Schema Problems

1. **Stock missing from entity type**: `Product` has no `stock` or `stockQuantity`. Accessed everywhere via `as any` — ~15 occurrences.
2. **Pricing missing from entity**: No `costPrice`, `sellingPrice`, `pricing` fields. All accessed via `as any`.
3. **Dual storage for `description`**: Both `Product.description` and `Product.content.description` + `Product.content.richDescription`.
4. **Dual storage for SEO**: Both `Product.metaTitle/metaDescription` and `Product.seo.metaTitle/metaDescription`.
5. **Dual storage for `specifications`**: Both `Product.specifications` and `Product.content.specifications`.
6. **Legacy booleans vs badges array**: `featured`, `trending`, `flashSale`, `newArrival` coexist with `badges[]`. Repository inflates both.
7. **stockQuantity vs stock naming**: Inconsistent across files — both names used interchangeably.
8. **title vs name**: Some queries use `p.title ?? p.name`, but entity only has `name`.

### Dead Code

| Item                      | Location         | Reason                                                                |
| ------------------------- | ---------------- | --------------------------------------------------------------------- |
| `ProductCreateDTO`        | `product-dto.ts` | Defined but type chain uses `CreateProductInput` from Zod             |
| `ProductUpdateDTO`        | `product-dto.ts` | Same                                                                  |
| `ProductResponseDTO`      | `product-dto.ts` | Same                                                                  |
| `ProductSearchDTO`        | `product-dto.ts` | Never imported anywhere                                               |
| `FinalCleanProductEntity` | `product-dto.ts` | `export type X = X` alias with no purpose                             |
| `searchMetadata`          | Entity + Model   | No service method ever sets it — only passed through in `duplicate()` |
| `publishSchedule`         | Dashboard query  | Queried but no field exists in entity/model                           |

### Validation Gaps

- URLs (`media.url`, `seo.ogImage`) not validated as URLs
- No validation that `isFeatured` media count = 1
- `slug` has no URL-safe character pattern
- `tags` have no min length or dedup
- `stock` has zero validation (not even in schema)
- No cross-field validation (e.g., `hasVariants: true` should require variants)

### Architecture Issues

1. **Service god object**: `ProductService` (912 lines) does everything — validation, automation, uniqueness, pricing, events, audit, versioning.
2. **No dependency injection**: Every service/repository uses `new X()` in constructors. Untestable without mocking entire DB.
3. **Type safety erosion**: `as any` in ~15+ places for stock/pricing/costPrice casts.
4. **DTO layer is dead**: Defined but never enters the pipeline. Zod output goes straight to service.
5. **Soft delete bypassed**: `ProductService.delete()` does not use soft delete plugin; `bulkRestoreAction` uses raw MongoDB.
6. **Bulk operations bypass service**: `bulkStatusChangeAction` uses raw `findByIdAndUpdate` — no events, audit, or versioning.
7. **Duplicate bypasses automation**: `service.duplicate()` calls `repository.create()` directly without automation engine.

---

## 4. BUSINESS DOMAIN AUDIT

### Roles & Permissions

- **10 system roles**: Super Admin (`*`), Admin, Manager, Support, Warehouse, Finance, Operations, Courier Manager, Marketing, Viewer
- **26 registered modules** via Permission Registry
- **Two permission string formats coexist**: Old `"Domain.Action"` (e.g., `"Identity.View"`) used in ~10 action files, new `"module.resource.action"` (`"identity.identity.view"`) used in middleware and newer actions. Non-admin roles assigned old-format permissions would fail newer checks.
- **Admin/Super Admin bypass everywhere** — permission checks short-circuit for these roles.
- **No middleware.ts file exists** — route protection relies on server components calling `auth()` manually.

### Business Memberships

- **8 membership types** fully defined: customer, reseller, wholesaler, dealer, distributor, corporate_buyer, affiliate, supplier
- **Application workflow**: pending → under_review → need_info → approved/rejected
- **Resubmission engine**: Editable, rejection-resubmit, admin questions
- **Admin Approval Center**: Full UI with analytics, review drawer, multi-select user management
- **Two approval systems overlap**: Business Profile Approval (older, workspace-creating) + Business Membership Application (newer, form-based). Unclear if both are required.

### Pricing & Visibility Rules

- **6 visibility levels**: public, private, hidden, supplier_only, reseller_only, wholesale_only
- **5 status values**: draft, pending_review, active, inactive, archived
- **8-level pricing engine cascade** (campaign → global → supplier → brand → category → profile → manual → default)
- **Three different default markup sets** in different parts of the system (init.ts: 40/25/20, resolvePricingByRole: 30/20/12, studio: 30/12/20)
- **MOQ pricing not integrated**: `resolveMoqPrice()` is separate from `calculatePrice()`
- **PromotionalPrice not auto-applied** in pricing engine
- **Price restoration after campaign not implemented**

### Supplier Logic

- `SupplierReference` exists but never integrated with pricing
- `SupplierPricingRule` has `leadCost`/`handlingFee` stored but never used in calculations

---

## 5. UI AUDIT

### Design System

- **22 Radix-based primitives** with CVA variants, HSL CSS variables, dark/light/high-contrast themes
- **Consistent styling**: `cn()`, `cva`, Tailwind v4 `@theme` block
- **One inconsistency**: `Spinner` hardcodes `text-indigo-500` instead of using CSS variable

### Admin Dashboard

- **4 workspace shells** (admin/reseller/wholesale/supplier) via `WorkspaceRegistry`
- **Responsive sidebar**: Collapsible (17rem / 4.5rem), permission-gated nav items, 8 sections with ~80 items
- **Dashboard home**: Greeting banner, 8 KPI cards, static bar chart (hardcoded mock data), pending items
- **PageHeader, StatCard, StatusChip, SearchBox, DataTable** — reusable workspace primitives
- **Analytics dashboards**: 12 dedicated analytics view pages

### Product Studio (53 files)

- **Most complex UI feature**: 19 section components, 13 hooks, 5 modals, 2 modes (Quick Create + Advanced)
- **Quick Create**: 9-field dark-themed panel with auto-tier pricing preview
- **Advanced Mode**: 15 sections, 3 lazy-loaded via `next/dynamic()`
- **Health Score**: 16-item evaluation (0-100%), clickable missing-item links
- **SmartParser**: Fully offline regex NLP — extracts title, specs, features, keywords, SEO
- **Auto-save**: 3-second debounce, localStorage draft recovery
- **Live Preview**: Desktop/tablet/mobile viewport switcher
- **Well-architected data flow**: Hook → validation → server action → services → repositories

### Product Studio Gaps (Found & Fixed in this session)

- ✅ `onMagicParse` now forwards rich text value
- ✅ `SpecificationSection` now receives `specs` and `onSpecsChange` props
- ✅ Specification type alignment across form state / component / Zod schema

### Public Website

- **9-section homepage**: Hero, Trust, Categories, Flash Deals, Campaign, New Arrivals, Why Choose Us, Testimonials, Newsletter
- **~75 components**: Product cards, gallery, variants, tabs, search, cart, checkout, blog
- **Separate light-mode theme** scoped to `[data-layout="public"]`
- **Bangla-first microcopy**: 70% English / 30% Bangla labels
- **Responsive**: Consistent Tailwind breakpoints, mobile sidebar drawer

### Design Issues

- Some text fails WCAG AA contrast (`text-slate-400` on `bg-slate-950`)
- `site-header.tsx` vs `site-header-premium.tsx` — duplicated implementation
- `brand-slider.tsx` and `brand-slider-section.tsx` coexist — likely unused duplicate
- 3 hero section implementations exist, only 1 exported
- Dashboard chart uses hardcoded mock data (12 static bars)
- No skip-to-content link found

---

## 6. ARCHITECTURE AUDIT

### What's Right

- **Feature-First DDD**: Clear domain boundaries with entity → service → repository → action layers
- **Repository Pattern**: Generic `BaseRepository<TDocument, TDomain>` with domain mapping
- **Event Bus**: Hybrid sync/async with idempotency, retry, BullMQ queues
- **Permission System**: 3-tier (middleware → action → service), well-typed registry
- **Server Action pattern**: Consistent `"use server"` + Zod + auth + error response shape
- **TypeScript strict mode**: Enabled (`strict: true`)
- **Lazy loading**: `next/dynamic()` for heavy components, dynamic `import()` for feature actions

### What's Wrong

- **No dependency injection**: Every service creates dependencies via `new X()`. Unit testing requires mocking MongoDB.
- **God services**: `ProductService` (912 lines), `PricingEngineService` (374 lines)
- **Duplicate type hierarchies**: `BaseEntity` (`@/types`) and `DomainEntity` (`contracts.ts`) are structurally identical but unrelated types
- **DTO layer is dead**: `ProductCreateDTO`/`ProductUpdateDTO`/`ProductResponseDTO` defined but never wired into pipeline
- **Pervasive `as any`**: ~30+ occurrences across catalog, pricing, order for stock/pricing/payload fields missing from entity types
- **Bulk operations bypass service**: Raw MongoDB calls in bulk status change, bulk restore
- **Soft delete bypassed**: `delete()` methods don't use the soft-delete plugin
- **Inline schema definition**: `BusinessTimeline` model created inside service method
- **Two independent Redis configs**: Can diverge

### Code Duplication

- 3 different default markup sets (init.ts: 40/25/20, resolvePricingByRole: 30/20/12, studio: 30/12/20)
- `site-header.tsx` and `site-header-premium.tsx` — 80% overlap
- Multiple hero section implementations
- `BrandPricingOverride.minProfitPercent` vs `CategoryPricingOverride.minMarginPercent` — same concept, different name
- `stockQuantity` vs `stock` naming inconsistency
- `PricingService.createPricing()` called from studio-actions AND product-service

---

## 7. PERFORMANCE AUDIT

### Next.js Optimization

| Area               | Status        | Notes                                    |
| ------------------ | ------------- | ---------------------------------------- |
| Server Components  | ✅ Used       | Public website server components         |
| Client Components  | ✅ Used       | Interactive features                     |
| Dynamic Imports    | ✅ Used       | 3 in product-studio, dashboard home, CMS |
| Image Optimization | ✅ Configured | ImageKit + Next.js Image component       |
| React Compiler     | ✅ Enabled    | `reactCompiler: true` in next.config     |
| Bundle Splitting   | ✅ Good       | Feature-based code organization          |

### Database Performance

| Area                     | Status            | Notes                                           |
| ------------------------ | ----------------- | ----------------------------------------------- |
| MongoDB Indexes          | ✅ Good           | Compound indexes on most queried fields         |
| Text Search Index        | ✅ Present        | On name + shortDescription + tags               |
| Connection Pool          | ✅ 10 min / 2 min | Configured in connection-manager                |
| Aggregation              | 🚧 Used           | In dashboard stats but not performance-reviewed |
| N+1 Query Risk           | ⚠️ Present        | Bulk operations iterate with per-item queries   |
| No MongoDB `.populate()` | ✅ Good           | No join overhead; relations by ID only          |

### Risks

- **Dashboard home page**: Calls 8+ feature actions via `Promise.allSettled` on every load
- **Dashboard chart**: Hardcoded mock data — no actual aggregation query
- **Bulk operations**: Sequential per-item updates with no batching
- **No response caching**: No Redis-based cache for read queries, no `stale-while-revalidate`
- **Product list with pricing**: Every product in a list may trigger a pricing DB lookup (N+1)
- **PricingEngine cascade**: Each `calculatePrice()` can make up to 6+ DB queries per call

---

## 8. SECURITY AUDIT

### Authentication

| Area               | Status                         | Notes                                |
| ------------------ | ------------------------------ | ------------------------------------ |
| Password Hashing   | ✅ bcryptjs                    | Salt rounds: 10                      |
| JWT Sessions       | ✅ Implemented                 | 24h expiry                           |
| Account Lockout    | ✅ Implemented                 | Configurable attempts + duration     |
| Password Reset     | ✅ Implemented                 | Token-based, rate-limited            |
| 2FA                | ❌ Defined but not implemented | Env vars exist, no actual 2FA        |
| Email Verification | ❌ Stubbed                     | Tokens generated but not sent/stored |
| OAuth              | ❌ Not started                 | Credentials-only                     |

### Authorization

| Area                     | Status            | Notes                                          |
| ------------------------ | ----------------- | ---------------------------------------------- |
| Permission Registry      | ✅ Complete       | 26 modules, validated                          |
| Role-Based Access        | ✅ Implemented    | 10 system roles                                |
| Route Protection         | 🚧 Incomplete     | No middleware.ts — relies on server components |
| Permission String Format | ⚠️ Inconsistent   | Old format vs new format coexistence           |
| Rate Limiting            | ⚠️ In-memory only | Not distributed, lost on restart               |

### Data Security

| Area               | Status         | Notes                                        |
| ------------------ | -------------- | -------------------------------------------- |
| Env Validation     | ✅ Zod schema  | 40+ validated env vars                       |
| Secrets Encryption | ✅ AES-256-GCM | Master key from env var                      |
| Input Validation   | ✅ Zod         | All user inputs validated                    |
| CSRF Protection    | ❌ Not visible | NextAuth provides some, no explicit tokens   |
| Fake Auth (dev)    | ⚠️ Present     | `ENABLE_FAKE_LOGIN` — documented for removal |

### Risks

- **CORS not configured**: No security headers in `next.config.ts`
- **No rate limiting on API**: Only account-level lockout for login
- **CSV import creates users with empty passwords**: `passwordHash: ""`, `status: "pending"`
- **Weak encryption key derivation**: SHA-256 of env var — if env is weak, all secrets are decryptable
- **Auto-trust devices**: `AUTO_TRUST_DEVICES` can bypass device verification
- **Permission string gap**: Non-admin roles with old-format permissions would silently fail new checks

---

## 9. CODE QUALITY AUDIT

### Strengths

- Consistent folder structure: `domain/`, `services/`, `repositories/`, `actions/`, `components/`, `types/`
- TypeScript strict mode enabled
- CVA-based component variants, Radix UI primitives, consistent `cn()` utility
- Server action pattern standardized across all features
- Zod validation on all server action inputs
- Feature flags and settings centralized

### Issues

| Category                 | Count | Examples                                                                                               |
| ------------------------ | ----- | ------------------------------------------------------------------------------------------------------ |
| `as any` casts           | 30+   | Stock, pricing, costPrice in catalog, pricing, orders                                                  |
| Dead DTO files           | 4     | `ProductCreateDTO`, `ProductUpdateDTO`, `ProductResponseDTO`, `ProductSearchDTO`                       |
| Duplicate components     | 5+    | `site-header` ×2, `hero-section` ×3, `brand-slider` ×2, `variants-section` vs `variant-studio-section` |
| Unused entity fields     | 5+    | `searchMetadata`, `promotionalPrice`, `leadCost`, `handlingFee`, `discountRules`                       |
| Hardcoded values         | 3+    | 3 different default markup sets, `dropshop.com.bd` in JSON-LD, `indigo-500` in Spinner                 |
| Stub implementations     | 30+   | 7 courier adapters, 15 automation task handlers, email/SMS/push notification channels                  |
| God classes              | 2     | `ProductService` (912 lines), `PricingEngineService` (374 lines)                                       |
| Inline MongoDB queries   | 3     | Bulk status change, bulk restore, bulk operations in catalog-actions                                   |
| Inline schema definition | 1     | `BusinessTimeline` model                                                                               |
| Unused variables         | 2     | `aEntry`/`bEntry` in event-registry.ts                                                                 |

### Technical Debt Summary

- **Dead code**: ~8 files/artifacts that serve no runtime purpose
- **Stub debt**: ~30+ implementations that look real but do nothing
- **Type debt**: ~30+ `as any` casts erasing type safety
- **Duplicate logic**: 3 markup sets, 2 header implementations, multiple sections
- **Architecture debt**: No DI, god services, inconsistent permission formats

---

## 10. CURRENT ROADMAP STATUS

| Metric                | Status                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Current Phase**     | Phase 5 — Enterprise Catalog Automation & Background Processing                            |
| **Last Completed**    | `PRODUCT-AUTOMATION-ENGINE-001` (Slug/SKU/SEO/Pricing/Badge automation)                    |
| **Current Task**      | Project Audit (this document)                                                              |
| **Current Milestone** | Pre-Phase 6 — stabilizing all 14 engines                                                   |
| **Blockers**          | Courier adapters all stubbed, no payment gateway, no warehouse module, no marketing module |
| **Priorities**        | Real courier API integrations, payment gateway, connect stubbed automation handlers        |

---

## 11. NEXT RECOMMENDED TASK

**Task:** **Courier Provider API Integration — Steadfast + Pathao Adapters**

**Why:**

1. **Most critical production gap**: 7 courier provider adapters are fully stubbed — they return mock data, make zero HTTP calls. For a dropshipping platform, courier integration (shipment creation, tracking, COD reconciliation) is table stakes.
2. **Highest ROI**: The orchestration layer (CourierService, ChargeService, CODReconciliationService, DeliveryAutomationService) is fully real and production-ready. Only the provider adapters need API wiring.
3. **Bangladesh-first**: Steadfast and Pathao are the two most commonly used couriers in Bangladesh. Integrating these two covers the majority of real-world shipments.
4. **Architecture is ready**: Provider pattern, registry, charge calculation, health tracking — all in place. Implementation is isolated to adapter files.

**Expected Deliverables:**

- Real `steadfast-adapter.ts` — HTTP POST to Steadfast API for createShipment, trackShipment, cancelShipment — with API key/secret from SecretsService
- Real `pathao-adapter.ts` — OAuth2 token flow + API calls for Pathao
- `.env` vars for Steadfast (`STEADFAST_API_KEY`, `STEADFAST_SECRET_KEY`, `STEADFAST_BASE_URL`) and Pathao (`PATHAO_CLIENT_ID`, `PATHAO_CLIENT_SECRET`, `PATHAO_BASE_URL`)
- Error handling + retry for each API call
- Webhook signature verification for delivery status callbacks
- Tests (optional but recommended)

**Estimated Complexity:** Medium (2-3 days)

**Dependencies:**

- SecretsService (real, store API credentials) — ✅ exists
- CourierService (real, orchestrates adapter calls) — ✅ exists
- ChargeService (real, calculates fees) — ✅ exists

---

## 12. FUTURE ROADMAP

### ✅ COMPLETED

- Phase 1: Core Platform (Database, Auth, Permissions, Event Bus, Settings)
- Phase 2: Product Domain (Entity, CRUD, Variants, Media, SEO)
- Phase 3: Pricing Engine (Rules Engine, PricingEngine cascade, Profiles, Campaigns, MOQ)
- Phase 4: Inventory + Customer + Analytics
- Phase 5: Order Domain (16-state machine, COD, Exchanges, Complaints)
- Phase 6: Finance (Wallet, Ledger, Profit, Withdrawals, Reconciliation, Closing)
- Phase 7: Identity (Roles, Memberships, Approvals, Sessions, Security)
- Phase 8: Admin UI (Dashboard, Product Studio, Workspace Shells, 4 role-based workspaces)
- Phase 9: Public Website (Homepage, Product Details, Cart, Checkout, Blog, Search)
- Phase 10: Notification System (In-app bell, event-driven)
- Phase 11: Analytics (Event ingestion, Dashboards, Snapshots)
- Phase 12: Automation Engine (Workflow engine, Rules, Scheduler, Retry)
- Phase 13: Catalog Automation (Slug/SKU/SEO/Pricing/Badge engine)

### 🚧 IN PROGRESS

- Project Audit & Stabilization (current)

### 🔜 NEXT

- **Courier Provider API Integration** (Steadfast + Pathao — highest production value)
- **Payment Gateway Integration** (bKash, Nagad — critical for Bangladesh market)

### 📅 LATER

- Warehouse Management Module
- Marketing Feature Module
- Automation Task Handler Real Implementations
- Database Migration System
- Email Service (SMTP/SES)
- SMS Service Integration
- Push Notification Service
- Distributed Rate Limiting (Redis-backed)
- Performance Optimization (Response caching, N+1 queries, index tuning)
- Security Hardening (CSP headers, CSRF tokens, API rate limiting)

---

## 13. ACTION ITEMS

### HIGH PRIORITY

| Item                                                                                        | Effort   | Impact                                    |
| ------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| Integrate Steadfast + Pathao courier APIs (replace stubs)                                   | 2-3 days | Unlocks real shipment creation & tracking |
| Integrate bKash/Nagad payment gateway                                                       | 3-5 days | Unlocks real payment flow                 |
| Implement automation task handlers (send_email, send_sms, execute_webhook, create_shipment) | 2-3 days | Makes automation engine functional        |
| Fix pricing record creation bug in studio-actions.ts (uses productId instead of pricingId)  | 1 hour   | Prevents silent pricing update failure    |

### MEDIUM PRIORITY

| Item                                                                  | Effort   | Impact                            |
| --------------------------------------------------------------------- | -------- | --------------------------------- |
| Add `stock` and `pricing` to Product entity type (eliminate `as any`) | 1 day    | Type safety, eliminates 15+ casts |
| Resolve 3 different default markup sets to single source of truth     | 1 day    | Consistent pricing across system  |
| Add `middleware.ts` for route-level auth enforcement                  | 1 day    | Security coverage for all routes  |
| Implement database migration system                                   | 2-3 days | Safe schema changes               |

### LOW PRIORITY

| Item                                                            | Effort | Impact                     |
| --------------------------------------------------------------- | ------ | -------------------------- |
| Remove dead DTO files                                           | 30 min | Code cleanliness           |
| Consolidate duplicate UI components (site-header, hero-section) | 1 day  | Reduce maintenance surface |
| Fix permission string format inconsistency                      | 1 day  | Non-admin role correctness |
| Remove unused entity fields                                     | 1 day  | Schema clarity             |

### TECHNICAL DEBT

| Item                                                      | Effort   | Impact                |
| --------------------------------------------------------- | -------- | --------------------- |
| Inject dependencies via constructor instead of `new X()`  | 2-3 days | Testability           |
| Break up `ProductService` (912 lines)                     | 1-2 days | Maintainability       |
| Replace `(global as any)` with typed declarations         | 1 day    | Type safety           |
| Remove legacy boolean badge fields from entity            | 1 day    | Schema simplification |
| Consolidate dual-storage fields (description, SEO, specs) | 2-3 days | Data consistency      |

---

## 14. FINAL SUMMARY

### Metrics

| Dimension                | Score | Rationale                                                                                                                                                                    |
| ------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Completion**   | ~75%  | All 14 engines have core implementation, but 30+ stubs exist (courier, automation tasks, payments, email, SMS)                                                               |
| **Architecture Quality** | 8/10  | Feature-First DDD is solid. Repository pattern is consistent. Event bus is comprehensive. Missing DI, some god services, dead DTO layer.                                     |
| **Code Quality**         | 7/10  | Consistent patterns, good TypeScript usage, but 30+ `as any` casts, duplicate components, 3 markup sets, inline schema definition                                            |
| **Enterprise Readiness** | 8/10  | Permission registry, feature flags, settings service, event bus with retry/BullMQ, audit trails, versioning, role-based workspaces                                           |
| **Production Readiness** | 5/10  | Couriers are fully stubbed → no real shipments. No payment gateway → no real payments. No middleware → unprotected routes. Stub automation handlers. In-memory rate limiter. |
| **Scalability**          | 6/10  | MongoDB with indexes, BullMQ queues, event bus. But: N+1 queries in bulk ops, no response caching, in-memory rate limiter per-instance.                                      |
| **Maintainability**      | 7/10  | Well-organized feature folders, consistent patterns, good component isolation. Drag: god services, duplicate components, inconsistent naming.                                |
| **Technical Debt**       | ~30%  | 30+ stubs, 30+ `as any` casts, 5+ duplicate components, dead code, 3 markup sets                                                                                             |

### Overall Grade: **B+** (Solid enterprise foundation with critical production gaps in courier and payment integrations)

### Verbatim Summary

**DropshopNN is a genuinely impressive enterprise commerce OS.** The architecture is well-considered (Feature-First DDD, Repository pattern, Event Bus with BullMQ, layered permissions, 4 workspace shells). The domain coverage is extensive — orders (16-state machine), finance (double-entry ledger, reconciliation, profit release), pricing (8-level cascade engine), inventory, analytics, automation workflow engine, and an award-winning Product Studio UI (53 files, 19 sections, 13 hooks, smart parser, health score, live preview).

**However, the project has a critical "facade" problem.** Seven courier provider adapters, fifteen automation task handlers, email/SMS/push notification channels, payment gateway — all appear fully built at the interface level but return mock data. A production deployment cannot create a real shipment, process a real payment, or send a real notification. The orchestration layers are genuinely real (CourierService, FinanceJobs, AutomationEngine, NotificationDispatcher), but they orchestrate over stubs.

**The correct path forward** is to wire the real API integrations (Steadfast, Pathao, bKash) into the existing adapter pattern. The architecture is ready — the adapters just need actual HTTP calls. This is the single highest-ROI task in the backlog.

Total codebase: ~1,142 source files. Build passes with 0 errors. TypeScript strict mode. Production-grade where real, elegantly stubbed where not yet integrated.
