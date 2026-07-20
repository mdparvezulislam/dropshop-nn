# 19 - Domain Glossary

## A

**Activity Feed**: A chronological stream of actions performed on or related to an entity. Powered by the Audit System.

**Admin**: A platform role with full operational control over all modules except system configuration.

**Aggregate**: A cluster of domain objects that can be treated as a single unit. Products with their pricing and inventory are separate aggregates identified by ID.

**Analytics Engine**: Centralized system that captures business events and computes metrics for dashboards and reports.

**Audit Log**: Immutable, append-only record of all meaningful business actions.

**Audit System**: The system responsible for recording, storing, and querying audit entries.

**Automation Engine**: System that orchestrates cascading updates triggered by business events.

**Availability**: Computed status indicating whether a product can be purchased. Values: `in_stock`, `low_stock`, `out_of_stock`, `pre_order`, `backorder`.

## B

**Bangladesh Address**: Hierarchical address format: Division → District → Upazila → Area → Postal Code.

**BaseRepository**: Abstract generic repository providing standard CRUD operations for all feature repositories.

**BDT**: Bangladeshi Taka — the primary currency of the platform. All monetary values are integer cents (paisa).

**bKash**: A mobile money service in Bangladesh. Primary payment integration target.

**BullMQ**: Redis-backed job queue library used for background job processing (notifications, analytics, reports, automations).

**Business Profile**: A first-class entity containing business information for resellers, wholesalers, and suppliers.

**Business Timeline**: Chronological activity history for every business entity (product, supplier, reseller, order).

## C

**Campaign Pricing**: Temporary pricing for marketing campaigns with start and end dates.

**Catalog**: The master collection of all products. Catalog data includes name, description, media, variants, attributes, brand, and category. No pricing or inventory data.

**COD**: Cash on Delivery — the most common payment method in Bangladesh.

**Commission**: Platform fee charged on transactions. Configurable per supplier or product.

**Compare Price**: The MSRP or list price used for comparison with the actual selling price.

**Customer**: A registered buyer on the platform. Can view retail pricing and place orders.

## D

**Dashboard**: Role-appropriate live data view showing KPIs, charts, tables, and activity feeds.

**Dead Letter Queue**: BullMQ queue for jobs that have exhausted their retry attempts.

**Domain Entity**: Pure TypeScript class representing a business concept with no database dependencies.

**Domain-Driven Design (DDD)**: Software design methodology emphasizing the domain model and its business rules.

**Dropshipping**: Fulfillment model where the supplier ships directly to the customer; the platform never holds inventory.

## E

**Event Bus**: Central publish/subscribe system that decouples modules through asynchronous events.

**Event Store**: (Future) Persistent storage of all business events enabling event sourcing patterns.

## F

**Feature Module**: Self-contained directory (`src/features/<name>/`) containing domain, repositories, services, actions, and types for a business capability.

**Feature Flag**: Configuration toggle enabling/disabling features without code changes.

**Fixed Pricing**: A pricing strategy where prices are explicitly set and stored.

**Flash Sale**: Time-limited deep discount pricing, usually lasting hours.

## G

**Guest**: An unauthenticated visitor with access only to public catalog data.

## I

**ImageKit**: Cloud-based image optimization and CDN service used for all media assets.

**In-App Notification**: Notification displayed within the platform interface (bell icon, toast, dropdown).

**Incoming Inventory**: Stock expected from suppliers, tracked as estimated inbound quantities.

**Integer Cents**: Monetary values stored as integers representing the smallest currency unit (paisa for BDT, cent for USD).

**Inventory**: Feature module managing all stock-related data — available, reserved, incoming, damaged, returned.

**ISR**: Incremental Static Regeneration — Next.js feature for static page generation with periodic updates.

## L

**Lead Time**: Days between placing an order with a supplier and receiving the stock.

**Localization**: Adaptation of the platform for the Bangladesh market — language, currency, address, mobile, and commerce workflows.

## M

**Manager**: Platform role with operational control over assigned modules but limited administrative access.

**MOQ**: Minimum Order Quantity — the smallest quantity a supplier or wholesaler will sell.

**MongoDB**: Document database used for all persistent data storage.

**Multi-Warehouse**: (Future) Support for multiple physical warehouses with independent stock tracking.

## N

**Nagad**: A mobile money service in Bangladesh, operated by the Bangladesh Post Office.

**NID**: National ID card — primary identification document in Bangladesh.

**Notification Engine**: Centralized system dispatching notifications across In-App, Email, SMS, and push channels.

## O

**Order**: A request from a customer/reseller/wholesaler to purchase products. Contains order lines, pricing, shipping, and payment information.

**OMS**: Order Management System — (future) comprehensive order lifecycle management module.

## P

**Permission**: A `Domain.Action` string (e.g., `Pricing.View`) representing authorization to perform a specific operation.

**Pricing Engine**: Reusable system that resolves the correct price for any product given role, quantity, and context.

**Pricing Rule**: Strategy for determining prices: fixed, percentage, supplier-based, category-based, brand-based, or dynamic.

**Product**: Master catalog entity — contains descriptive data only. No price or stock fields.

**ProductPricing**: Feature entity containing all monetary data for a product variant.

**ProductInventory**: Feature entity containing all stock data for a product variant.

**ProfitCalculationService**: Service that computes profit amounts, margins, tax, and commission.

**Promotional Price**: A temporary reduced price for marketing purposes.

## R

**Redis**: In-memory data store used for caching, session storage, BullMQ job queues, and pub/sub.

**Reporting Engine**: Centralized system for generating, scheduling, and exporting business reports.

**Repository**: Data access layer converting between MongoDB documents and domain entities.

**Reseller**: A business user who sells platform products at a markup through their own channels.

**ResellerProduct**: Private overlay on a master Product, allowing resellers to customize pricing, description, and status without modifying the original.

**Reserved Stock**: Inventory held for active orders or pending payments.

**Role**: A collection of permissions assigned to a user, determining what they can do on the platform.

## S

**Server Action**: Next.js function running on the server, triggered by client interactions. The entry point for all mutating operations.

**Service Layer**: Business logic layer coordinating domain operations, repository access, and third-party integrations.

**SKU**: Stock Keeping Unit — unique identifier for a product or variant.

**Soft Delete**: Marking a record as deleted (`isDeleted: true`) rather than removing it from the database.

**Strategy Pattern**: Design pattern used by the Pricing Engine to support multiple pricing strategies.

**Super Admin**: Highest platform role with system-wide access, including configuration management.

**Supplier**: A business that provides products to the platform for sale.

**SupplierInventory**: Mapping between a supplier and a product, containing supplier-specific SKU, cost, stock, and lead time.

## T

**TIN**: Taxpayer Identification Number (Tax ID) — required for business registration in Bangladesh.

**Tier Pricing**: Wholesale pricing model where price decreases at predefined quantity thresholds.

## U

**Upazila**: Administrative sub-district level in Bangladesh address hierarchy (also called Thana).

## V

**Variant**: A specific version of a product (size, color, material) identified by a variant SKU.

**VAT**: Value Added Tax — 5% standard rate in Bangladesh for e-commerce.

**Verification**: Process of confirming business identity through document review (NID, trade license, bank details).

**VIP Pricing**: (Future) Special pricing tier for high-value customers.

**Visibility Rules**: Role-based rules determining what product data each user role can see.

**VisibilityService**: Service that filters product data based on the requesting user's role.

## W

**Warehouse**: (Future) A physical storage location for inventory. Identified by `warehouseId`.

**Wholesaler**: A bulk buyer who purchases large quantities at discounted prices.

**Wholesale Pricing**: Quantity-based pricing tiers for bulk purchases.

**WMS**: Warehouse Management System — (future) comprehensive warehouse operations module.

## Z

**Zod**: TypeScript-first schema validation library used for all input validation.
