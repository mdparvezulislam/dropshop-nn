# DropshopNN — Complete Development Roadmap

> ✅ = Completed | 🔄 = In Progress | ⏳ = Pending | 🚀 = After Deploy

---

## PHASE 0 — Foundation ✅

### CORE-001 ✅

Enterprise Core Platform

- Feature flags registry (10 defaults)
- Platform settings (13 defaults)
- Engine lifecycle (preInit → init → postInit)
- Platform bootstrap with ordered phase execution
- Background job scheduler (10 registered jobs)
- Event bus (publish/subscribe)
- Engine verification and health checks

### IDENTITY-001 ✅

Identity & Workspace Engine

- NextAuth session management
- Role-based access control (RBAC)
- Permission system (checkPermission utility)
- Workspace shell registry (WORKSPACE_SHELLS)
- Command palette (Cmd+K)
- Breadcrumb navigation (auto-generated from pathname)
- Sidebar navigation with section grouping
- Topbar with user menu and notifications

---

## PHASE 1 — Commerce Foundation ✅

### CATALOG-001 ✅

Enterprise Catalog Engine

- Product CRUD (create, read, update, delete)
- SKU uniqueness validation
- Barcode/GTIN support
- Slug generation from product name
- Brand and category references (validated on create)
- Product variants (color, size, storage, RAM, capacity, material, weight)
- Product media (images, videos, documents)
- SEO metadata (title, description, keywords, ogImage)
- Product content (rich description, highlights, features, specifications)
- Search metadata for full-text search
- Supplier references
- Status workflow (draft → pending_review → active → inactive → archived)
- Visibility controls (public, private, hidden, supplier_only)
- Tags system
- Feature flags (featured, trending, flashSale, newArrival)

### PRICING-001 ✅

Enterprise Pricing Engine

- Multi-tier pricing (retail, wholesale, reseller, supplier)
- Cost price tracking
- Price lists
- Bulk pricing operations
- Margin calculation
- Currency: BDT (Bangladeshi Taka)
- Amount storage in cents

### INVENTORY-001 ✅

Enterprise Inventory Engine

- Stock management (onHand, reserved, available)
- Low-stock threshold alerts
- Batch stock adjustments
- Inventory history/audit trail
- Warehouse location tracking
- Inventory SKU and barcode mapping

### SUPPLIER-001 ✅

Supplier Management Engine

- Supplier profiles (businessName, code, email, phone, address)
- Supplier categories
- Supplier status management (pending, active, inactive, suspended, blocked, archived)
- Product-to-supplier mappings
- Supplier settings
- Banking information
- Notes and tags
- Supplier statistics
- Search and filtering

---

## PHASE 2 — Product Studio ✅

### PRODUCT-STUDIO-001 ✅

Enterprise Product Creation Studio

- Rich product editor with Tiptap (WYSIWYG)
- General section (name, SKU, model, barcode, short description)
- Description section (rich text editor)
- Pricing section (cost, selling, wholesale, reseller, compare price)
- Inventory section (SKU, barcode, stock, low-stock threshold)
- Variants section (dynamic add/remove, per-variant SKU, price, stock, weight)
- Media section (upload, reorder, featured image, alt text)
- SEO section (meta title, description, keywords, slug, ogImage)
- Right sidebar (status, visibility, section navigation)
- Autosave (3-second debounce)
- Publish workflow (save draft → submit → publish)
- Save + redirect on first create
- Schema validation (Zod) with studio-specific sub-schemas

### PRODUCT-MEDIA-001 ✅

Marketing Assets

- Image upload and management
- HD image variants
- Poster generation
- Video embeds
- Document attachments

---

## PHASE 3 — Customer Commerce ✅

### CHECKOUT-001 ✅

Unified Checkout

- Retail checkout flow
- Wholesale checkout (`type: "wholesaler"`)
- Reseller checkout
- MOQ (Minimum Order Quantity) validation
- Tier pricing application
- Company info collection (wholesale)
- PO reference field (wholesale)
- Checkout draft → order pipeline
- Address validation

### ORDER-001 ✅

Order Lifecycle

- 16-state order machine:
  - `draft` → `pending` → `confirmed` → `packed` → `ready_for_dispatch` → `courier_assigned` → `shipped` → `out_for_delivery` → `delivered` → `completed`
  - Terminal: `completed`, `cancelled`, `refunded`
  - Special: `return_requested`, `return_initiated`, `returned`, `failed`
- Allowed transitions (getAllowedTransitions)
- Terminal state detection (isTerminal)
- Cancellation detection (isCancellable)
- Human-readable labels (getHumanLabel)
- Order notes (public, internal)
- Order timeline/audit trail
- Courier assignment
- Tracking updates
- Return request and processing
- Refund processing

### CUSTOMER-001 ✅

Customer Engine

- Customer profiles
- Order history
- Address management
- Customer notes
- Tagging system
- Session→customer resolution

### RETURN-001 ✅

Return & Refund Engine

- Return request initiation
- Return processing workflow
- Refund execution

---

## PHASE 4 — Operations ✅

### FINANCE-001 ✅

Wallet, Ledger, Withdraw, Settlement

- User wallets (getOrCreateUserWalletAction)
- Transaction ledger
- Withdrawal requests
- Balance reconciliation
- Daily summary generation
- Clear pending ledgers
- Expire stale withdrawals
- Reconcile wallets

### COURIER-001 ✅

Courier, Shipment, Tracking, Fulfillment

- Courier assignment
- Tracking number/URL management
- Shipment status sync
- Sync tracking background job
- Expire stale pickups
- Retry failed submissions
- Daily reconciliation

---

## PHASE 5 — Public Website ✅

### WEBSITE-001 ✅

Public Website Foundation

- Responsive navbar with mobile drawer
- Footer with links and newsletter
- Global search (product search with highlighting)
- Dark/light theme toggle
- Mobile navigation
- SEO meta tags
- Loading states (skeletons)
- Error pages (404, 500)

### HOME-001 ✅

Homepage

- Hero section with CTA
- Category grid
- Featured products
- Trending products
- Flash sale section
- New arrivals
- Wholesale section
- Reseller section
- Brand showcase
- Customer reviews
- Blog preview
- Newsletter signup

### PRODUCT-PAGE-001 ✅

Product Details

- Image gallery with zoom
- Variant selector
- Customer reviews
- Related products
- Shipping information
- FAQ accordion

### CATEGORY-001 ✅

Category Listing

- Filtered product grid by category/slug
- Sort options
- Pagination

### SEARCH-001 ✅

Global Search

- Full-text product search
- Result highlighting
- Search suggestions

### CART-001 ✅

Shopping Cart

- Add/remove items
- Quantity adjustment
- Persistent cart state
- Price calculation

### ACCOUNT-001 ✅

Customer Account

- Profile management
- Address book
- Order history
- Notifications
- Security settings
- Wishlist
- Role management

### BLOG-001 ✅

Blog

- CMS-driven blog listing
- Blog detail pages with slug routing
- Rich text content

### CMS-001 ✅

CMS Pages

- Privacy Policy
- Terms of Service
- Refund Policy
- About Us
- Contact Us
- Dynamic CMS page rendering

---

## PHASE 6 — Admin Workspace ✅

### ADMIN-WORKSPACE-001 ✅

Admin ops control center on unified shell (`/dashboard/*`). 30+ pages.

#### Dashboard

- Revenue, orders, customers, products, suppliers, inventory stats
- Recent orders list
- Low stock alerts
- Quick action links

#### Products

- Product list with search, status filter, pagination
- Product Studio (create, edit)
- Product detail view
- Variants management
- Media gallery
- Pricing tiers
- SEO fields
- Publish workflow

#### Orders

- Order list with search, status filter
- Order detail (items, timeline, pricing, notes)
- Order Kanban board
- Status transitions
- Edit shipping details
- Courier assignment
- Cancel order

#### Customers

- Customer list
- Customer detail (orders, notes, addresses)

#### Suppliers

- Supplier list with search, category filter
- Supplier detail (profile, products, banking, notes, tags, stats)
- Supplier CRUD
- Status management (active, inactive, suspended, blocked)
- Product-to-supplier mapping

#### Inventory

- Stock list
- Stock adjustments
- Inventory history
- Low-stock alerts
- New adjustment form

#### Finance

- Wallet overview
- Ledger transactions
- Withdrawal management

#### Courier

- Shipment management
- Tracking status
- Fulfillment overview

#### Identity

- User management
- Role management
- Permission system
- Approval workflows
- Active sessions

#### Settings

- Platform settings
- Feature flag management

#### Audit

- Audit log viewer

#### Content CMS

- Pages (create, edit, list)
- Banners (create, edit, list)
- Blog (create, edit, list)
- Homepage layout
- Navigation management
- Media library

#### Analytics

- Sales analytics
- Order analytics
- Catalog analytics
- Content analytics

#### Notifications

- Template management
- Notification logs

---

## PHASE 7 — Reseller Workspace ✅

### RESELLER-WORKSPACE-001 ✅

Reseller commerce workspace on unified shell (`/reseller/*`). 11 pages.

#### Dashboard

- Orders, wallet, catalog stats, customers, recent orders

#### Products

- Browse catalog
- Product search
- Product detail view

#### Create Order ⭐

- CHECKOUT pipeline integration
- Product selection with pricing
- Customer info collection
- Payment method selection
- Order confirmation

#### Orders

- Order list with status filter
- Order detail with timeline
- Status tracking

#### Customers

- Customer list
- Customer detail (notes, create-order deep link)

#### Wallet

- Balance display
- Transaction history
- Withdraw requests

#### Reports

- Order profit analysis
- Revenue statistics

#### Marketing Kit

- CMS media assets
- Product marketing materials
- Downloadable assets

#### Shop Settings

- Profile save (logo, banner, phone, address)
- Brand customization

#### Settings

- Order preferences
- Payment settings
- Notification preferences

---

## PHASE 8 — Wholesale Workspace ✅

### WHOLESALE-WORKSPACE-001 ✅

Wholesale buyer workspace on unified shell (`/wholesale/*`). 12 pages.

#### Dashboard

- 8 stat widgets (total orders, pending, completed, total spent, outstanding balance, products available, pending quotations, invoices due)
- Recent orders
- Recent quotations

#### Products

- Catalog list with search
- Product detail with tier pricing, MOQ, stock info

#### Bulk Orders

- CHECKOUT pipeline with `type: "wholesaler"`
- MOQ validation
- Tier pricing application
- Company info collection
- PO reference field
- Order list + detail (timeline, shipping, payment)

#### Orders

- Order history detail (timeline, shipping, payment)

#### Quotations

- Quotation list
- Request quotation form

#### Invoices

- Invoice list
- Invoice detail

#### Customers

- Customer list

#### Company Profile

- Business information
- Document uploads
- Contact details
- Address management

#### Settings

- Order preferences
- Payment settings
- Notification preferences
- Appearance customization

---

## PHASE 9 — Supplier Workspace ✅

### SUPPLIER-WORKSPACE-001 ✅

Supplier workspace on unified shell (`/supplier/*`). 14 pages.

#### Dashboard

- 8 stat cards (products, pending approval, approved, rejected, low stock, pending orders, completed, balance)
- Recent orders
- Inventory alerts
- Quick actions

#### Products

- List with status chips and search
- Detail (description, variants, pricing, stock, edit link)

#### Product Submission

- General info (name, SKU, model, barcode, short/full description)
- Pricing (cost, selling, wholesale)
- Variants (dynamic add/remove: SKU, label, price, stock, weight)
- Inventory (initial stock, low-stock threshold)
- Save as draft or submit for review

#### Product Edit

- Pre-populated form from existing product
- Update general info, pricing, variants, inventory
- Resubmit for review

#### Purchase Orders

- List with status chips
- Detail (items, timeline, accept/decline for pending, summary, shipping, notes)

#### Orders

- List
- Detail (items, customer & delivery with full address, timeline, payment, tracking)

#### Deliveries

- Order-based delivery list

#### Inventory

- Stock list with batch info

#### Payments

- Wallet balance + ledger transactions

#### Reports

- Order stats (pending, completed, total revenue)
- Top products analysis

#### Documents

- Trade license
- BIN/VAT certificate
- Company agreement
- Product certifications
- Business insurance
- Bank statement
- Upload status indicators
- Required/optional markers

#### Profile

- Company info form

#### Settings

- Preferences form

---

## PHASE 10 — Intelligence ⏳

### ANALYTICS-001 ⏳

Analytics Engine

- Sales analytics (revenue, growth, trends)
- Order analytics (volume, status distribution, fulfillment time)
- Catalog analytics (product performance, category breakdown)
- Customer analytics (acquisition, retention, lifetime value)
- Content analytics (page views, engagement)
- Custom date ranges
- Export functionality

### NOTIFICATION-001 ⏳

Notification Engine

- Email notifications
- SMS notifications
- Push notifications
- In-app notifications
- Notification templates
- Notification logs
- Delivery status tracking
- Preference management

---

## 🚀 DEPLOY

### RELEASE-001 ⏳

Production Deployment

- Environment hardening
- Performance audit
- Security review
- Monitoring setup
- Deployment pipeline
- Database indexing
- CDN configuration
- SSL/TLS
- Rate limiting

---

## 🚀 AFTER DEPLOY

### AUTOMATION-001 🚀

Business Process Automation

- Automated order processing
- Inventory auto-reorder
- Price rule engine
- Abandoned cart recovery
- Welcome email sequences

### REPORTING-001 🚀

Advanced Reporting

- Custom report builder
- Scheduled reports
- Export to PDF/Excel
- Email report delivery

### BI-001 🚀

Business Intelligence

- Data warehouse integration
- Advanced dashboards
- Predictive analytics
- Demand forecasting

### PURCHASE-001 🚀

Purchase Management

- Purchase order workflow
- Vendor management
- Purchase approval chains
- Cost tracking

### WAREHOUSE-001 🚀

Warehouse Management

- Multi-warehouse support
- Bin/location management
- Pick/pack/ship workflow
- Barcode scanning

### ACCOUNTING-001 🚀

Accounting Integration

- Chart of accounts
- Journal entries
- Tax calculation
- Financial statements

### COUPON-001 🚀

Coupon & Discount Engine

- Percentage/fixed discounts
- Minimum order requirements
- Usage limits
- Expiry dates
- Coupon codes

### LOYALTY-001 🚀

Loyalty & Rewards

- Points system
- Tier-based rewards
- Referral bonuses
- Reward catalog

### AFFILIATE-001 🚀

Affiliate Program

- Affiliate registration
- Tracking links
- Commission calculation
- Payout management

### REVIEW-001 🚀

Review & Rating System

- Product reviews
- Star ratings
- Photo reviews
- Review moderation

### CRM-001 🚀

Customer Relationship Management

- Contact management
- Interaction tracking
- Lead scoring
- Pipeline management

### HELPDESK-001 🚀

Helpdesk & Support

- Ticket system
- Knowledge base
- Live chat integration
- SLA management

### EMAIL-001 🚀

Email Marketing

- Campaign builder
- Audience segmentation
- A/B testing
- Analytics

### SMS-001 🚀

SMS Marketing

- Campaign management
- Transactional SMS
- Bulk SMS
- Delivery reports

### WHATSAPP-001 🚀

WhatsApp Integration

- Business API
- Template messages
- Order notifications
- Customer support

### PUSH-001 🚀

Push Notifications

- Web push
- Mobile push
- Segmentation
- Scheduling

### MARKETPLACE-001 🚀

Multi-Vendor Marketplace

- Vendor onboarding
- Product listings
- Commission management
- Vendor dashboard

### MOBILE-API-001 🚀

Mobile API

- RESTful API
- GraphQL endpoint
- Mobile app SDK
- Offline support

### SDK-001 🚀

Developer SDK

- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK
- Documentation

### PUBLIC-API-001 🚀

Public API

- API key management
- Rate limiting
- Webhook support
- API documentation

### PLUGIN-001 🚀

Plugin System

- Plugin registry
- Plugin marketplace
- Hook system
- Plugin lifecycle management

---

## Final Launch Roadmap

```text
PHASE 0 ✅
├── CORE-001 ✅
└── IDENTITY-001 ✅

PHASE 1 ✅
├── CATALOG-001 ✅
├── PRICING-001 ✅
├── INVENTORY-001 ✅
└── SUPPLIER-001 ✅

PHASE 2 ✅
├── PRODUCT-STUDIO-001 ✅
└── PRODUCT-MEDIA-001 ✅

PHASE 3 ✅
├── CHECKOUT-001 ✅
├── ORDER-001 ✅
├── CUSTOMER-001 ✅
└── RETURN-001 ✅

PHASE 4 ✅
├── FINANCE-001 ✅
└── COURIER-001 ✅

PHASE 5 ✅
├── WEBSITE-001 ✅
├── HOME-001 ✅
├── PRODUCT-PAGE-001 ✅
├── CATEGORY-001 ✅
├── SEARCH-001 ✅
├── CART-001 ✅
├── ACCOUNT-001 ✅
├── BLOG-001 ✅
└── CMS-001 ✅

PHASE 6 ✅
└── ADMIN-WORKSPACE-001 ✅ (30+ pages)

PHASE 7 ✅
└── RESELLER-WORKSPACE-001 ✅ (11 pages)

PHASE 8 ✅
└── WHOLESALE-WORKSPACE-001 ✅ (12 pages)

PHASE 9 ✅
└── SUPPLIER-WORKSPACE-001 ✅ (14 pages)

PHASE 10 ⏳
├── ANALYTICS-001 ⏳
└── NOTIFICATION-001 ⏳

====================
🚀 PRODUCTION DEPLOY
====================
RELEASE-001 ⏳

AFTER DEPLOY 🚀
├── AUTOMATION-001
├── REPORTING-001
├── BI-001
├── PURCHASE-001
├── WAREHOUSE-001
├── ACCOUNTING-001
├── COUPON-001
├── LOYALTY-001
├── AFFILIATE-001
├── REVIEW-001
├── CRM-001
├── HELPDESK-001
├── EMAIL-001
├── SMS-001
├── WHATSAPP-001
├── PUSH-001
├── MARKETPLACE-001
├── MOBILE-API-001
├── SDK-001
├── PUBLIC-API-001
└── PLUGIN-001
```

---

## Summary

| Phase                         | Status       | Pages          | Engines                               |
| ----------------------------- | ------------ | -------------- | ------------------------------------- |
| PHASE 0 — Foundation          | ✅ Complete  | —              | CORE, IDENTITY                        |
| PHASE 1 — Commerce            | ✅ Complete  | —              | CATALOG, PRICING, INVENTORY, SUPPLIER |
| PHASE 2 — Product Studio      | ✅ Complete  | —              | PRODUCT-STUDIO                        |
| PHASE 3 — Customer Commerce   | ✅ Complete  | —              | CHECKOUT, ORDER, CUSTOMER, RETURN     |
| PHASE 4 — Operations          | ✅ Complete  | —              | FINANCE, COURIER                      |
| PHASE 5 — Public Website      | ✅ Complete  | 25+            | —                                     |
| PHASE 6 — Admin Workspace     | ✅ Complete  | 30+            | —                                     |
| PHASE 7 — Reseller Workspace  | ✅ Complete  | 11             | —                                     |
| PHASE 8 — Wholesale Workspace | ✅ Complete  | 12             | —                                     |
| PHASE 9 — Supplier Workspace  | ✅ Complete  | 14             | —                                     |
| PHASE 10 — Intelligence       | ⏳ Pending   | —              | ANALYTICS, NOTIFICATION               |
| RELEASE-001 — Deploy          | ⏳ Pending   | —              | —                                     |
| After Deploy                  | 🚀 Planned   | —              | 21 future modules                     |
| **Total**                     | **88 pages** | **14 engines** | **4 workspaces**                      |
