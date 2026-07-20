# 18 - Future Expansion Architecture

## Overview

This document maps the planned future expansions and the architectural decisions that enable them.

---

## Expansion Roadmap

### Phase 8: Customer Module & Checkout

**Priority: High**

- Customer profiles (addresses, preferences, history)
- Shopping cart with persistence
- Checkout flow with address selection
- Order placement with inventory reservation
- Payment integration (bKash, Nagad, COD)
- Order confirmation and tracking

### Phase 9: Order Management System

**Priority: High**

- Order lifecycle management
- Split shipments and partial fulfillment
- Order notes and internal communication
- Return and refund processing
- Order status dashboard
- Bulk order operations

### Phase 10: Courier Integration

**Priority: High**

- Multi-courier support (SteadFast, eCourier, Pathao, Sundarban)
- Rate calculation and comparison
- Automated dispatch
- Tracking number generation
- Delivery status webhooks
- COD collection management

### Phase 11: Payment Gateway Integration

**Priority: High**

- bKash Merchant API integration
- Nagad Payment Gateway
- SSLCommerz integration
- Payment reconciliation
- Refund processing
- Transaction history

### Phase 12: Wallet & Payout System

**Priority: Medium**

- Multi-currency digital wallet
- Admin wallet for platform revenue
- Reseller wallet for earnings
- Supplier wallet for payments
- Automatic and manual payouts
- Transaction ledger with audit

### Phase 13: Invoice & Billing System

**Priority: Medium**

- Automated invoice generation
- Tax invoice format (VAT ready)
- Credit note / debit note
- Bulk invoice generation
- Invoice history and download
- Legal document storage

### Phase 14: Multi-Warehouse Management (WMS)

**Priority: Medium**

- Full warehouse entity management
- Warehouse-to-warehouse transfers
- Warehouse capacity tracking
- Location-based stock allocation
- Pick, pack, ship workflows
- Barcode/RFID integration (future)

### Phase 15: Supplier Comparison Engine

**Priority: Low**

- Multi-supplier cost comparison per product
- Best-supplier selection algorithm
- Auto-assign orders to best supplier
- Supplier scorecard (cost, speed, reliability)
- Supplier switching recommendations

### Phase 16: Advanced Analytics & BI

**Priority: Low**

- Custom report builder
- Drag-and-drop dashboard widgets
- Scheduled PDF report delivery
- BI tool integration (Metabase, Power BI)
- Data export warehouse (Snowflake/BigQuery)
- ML-based demand forecasting

### Phase 17: Multi-Tenant & International

**Priority: Low**

- Multi-tenant architecture (regional subdomains)
- Full multi-currency support
- International address formats
- International payment gateways
- Multi-language admin panel
- Regional tax compliance

---

## Architectural Readiness

### Already Ready (No Changes Needed)

- Feature module isolation (microservice-ready)
- Event bus architecture (pub/sub decoupling)
- Product + Pricing + Inventory separation
- Repository pattern (data layer abstraction)
- Service layer (business logic encapsulation)
- Integer cents for all monetary values
- BDT-ready with multi-currency stored per record

### Minor Changes Needed

- Multi-warehouse `warehouseId` field already present
- Customer entity stubs in reseller module
- Multi-supplier per product (SupplierInventory)
- Campaign/scheduled pricing fields present

### Significant Changes Needed

- Full OMS (Order Management System) — new feature module
- Payment gateway integrations (external APIs)
- Courier API integrations (external APIs)
- Wallet ledger (complex financial transactions)
- Invoice legal document generation
- BI integration (data warehouse export)

---

## Expansion Principles

### 1. No Breaking Changes

New modules must not break existing functionality. Follow the existing patterns:

- New feature module in `src/features/<name>/`
- Follows same directory structure (`domain/`, `repositories/`, `services/`, `actions/`, `types/`)
- Extends `BaseRepository`
- Publishes events on the Event Bus
- Subscribes to relevant events from other modules

### 2. Feature Flag Gating

All new features should be gated behind feature flags:

```typescript
// src/shared/config/app-config.ts
features: {
  enableCustomerModule: false,
  enableOrderManagement: false,
  enableCourierIntegration: false,
  enableWallet: false,
  enableInvoicing: false,
}
```

### 3. Progressive Enhancement

Start with the minimum viable version of each feature and add complexity over time.

### 4. Backward Compatibility

- Existing API contracts remain unchanged
- New features add new endpoints, never modify existing response shapes
- New database fields are optional with sensible defaults

---

## Dependency Map

```
Phase 8: Customer + Checkout
    depends on → Product, Pricing, Inventory (existing)
    depends on → Auth (existing)

Phase 9: Order Management
    depends on → Customer + Checkout (Phase 8)
    depends on → Product, Pricing, Inventory, Reseller (existing)

Phase 10: Courier Integration
    depends on → Order Management (Phase 9)

Phase 11: Payment Gateway
    depends on → Customer + Checkout (Phase 8)
    depends on → Order Management (Phase 9)

Phase 12: Wallet & Payout
    depends on → Supplier, Reseller (existing)
    depends on → Order Management (Phase 9)
    depends on → Payment Gateway (Phase 11)

Phase 13: Invoice & Billing
    depends on → Order Management (Phase 9)
    depends on → Payment Gateway (Phase 11)

Phase 14: WMS
    depends on → Inventory (existing)
    depends on → Order Management (Phase 9)

Phase 15: Supplier Comparison
    depends on → Supplier (existing)
    depends on → Product, Pricing (existing)

Phase 16: Advanced BI
    depends on → All phases 8-15

Phase 17: Multi-Tenant
    depends on → All phases 8-16
```
