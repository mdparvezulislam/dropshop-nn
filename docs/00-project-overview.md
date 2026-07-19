# 00 - Project Overview

## DropshopNN

DropshopNN is a modern, high-performance, enterprise-grade dropshipping management and logistics orchestration platform. It is engineered from the ground up to support highly concurrent order ingestion, automated courier dispatching, real-time inventory management, multi-tenant pricing controls, customer billing wallets, and comprehensive reporting.

### Core Objectives

1. **Scalability**: Handle high transaction volume and bulk order updates without degradation.
2. **Modular Architecture**: Enforce DDD boundaries to ensure domain logic is isolated and easily maintainable.
3. **Resilience**: Ensure transactional safety across MongoDB and background tasks (BullMQ + Redis).
4. **Developer Velocity**: Support a highly optimized, type-safe development environment.

### Target Domains (Modules)

- **Auth**: Multi-role authentication (Admin, Merchant, Courier, Customer).
- **Products**: Global catalog only (no price/stock on product).
- **Suppliers**: Supplier onboarding, profiles, settings.
- **Pricing**: Independent pricing foundation — costs, sell tiers, rules, profit, tax/commission ready.
- **Inventory**: Independent inventory foundation — stock buckets, history, supplier stock maps, warehouse-ready.
- **Resellers**: Independent reseller platform — profiles, private catalogs, reseller-only pricing (master product never modified).
- **Orders**: Status management, split-shipments, merchant processing (future).
- **Payments**: Transactions processing, refunds, reconciliation (future).
- **Courier**: Real-time integration, rate optimization, dispatch routing (future).
- **Wallet**: Digital ledger, credits, merchant pay-outs (future).
- **Invoices**: Tax calculations, legal document rendering (future).
