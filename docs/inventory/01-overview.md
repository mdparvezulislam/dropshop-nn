# 01 - Inventory Engine Overview

## Purpose

The Inventory Engine is the single source of truth for every product's stock in DropshopNN. No other module may directly manage stock. Orders, Checkout, Catalog, Analytics, and Reporting must all consume inventory data from this engine.

## Scope

This engine covers:

- **Stock Foundation**: Available, reserved, incoming, damaged, returned, sold, virtual stock
- **Stock Status**: In Stock, Low Stock, Out of Stock, Pre-Order, Back Order, Discontinued
- **Stock Reservation**: Reserve, release, confirm, cancel, expiry
- **Supplier Stock**: Multi-supplier stock references per product
- **Stock Movements**: Track every inventory mutation with full history
- **Stock Validation**: Atomic operations with prevent-over-sell guarantees

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Inventory Engine                            │
├──────────────────────────────────────────────────────────────┤
│  Actions Layer                                                │
│  ┌────────┬──────────┬──────────┬──────────┬──────────┐     │
│  │Create  │ Adjust   │ Reserve  │ Supplier │ Bulk     │     │
│  │Actions │ Actions  │ Actions  │ Actions  │ Actions  │     │
│  └───┬────┴───┬──────┴───┬──────┴───┬──────┴───┬──────┘     │
│      │        │          │         │          │              │
├──────┴────────┴──────────┴─────────┴──────────┴─────────────┤
│  Services Layer                                              │
│  ┌─────────────┬─────────────────────┐                       │
│  │ Inventory   │ Stock Calculation   │                       │
│  │ Service     │ Service             │                       │
│  └──────┬──────┴─────────┬───────────┘                       │
│         │                │                                   │
├─────────┴────────────────┴──────────────────────────────────┤
│  Repository Layer                                            │
│  ┌──────────┬──────────────┬──────────────┐                 │
│  │Inventory │  Inventory   │  Supplier    │                 │
│  │Repo      │  History Repo│  Inventory   │                 │
│  └──────────┴──────────────┴──────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                                │
│  ┌──────────────┬────────────┬─────────────────┐            │
│  │Product       │ Inventory  │ Supplier        │            │
│  │Inventory     │ History    │ Inventory       │            │
│  └──────────────┴────────────┴─────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

1. **Single Source of Truth**: All stock resolution routes through Inventory Engine
2. **Atomic Operations**: Stock mutations are transactional and atomic
3. **Reservation Isolation**: Reserved stock is isolated from available stock
4. **Full Audit Trail**: Every movement is recorded with before/after values
5. **Event-Driven**: Every stock change publishes events

## Dependencies

| Dependency               | Purpose                            |
| ------------------------ | ---------------------------------- |
| `@/features/catalog`     | Product references                 |
| `@/shared/lib/event-bus` | Event publishing                   |
| `@/shared/core`          | BaseService, permissions, settings |
| `@/shared/utils`         | Logger, validation                 |
| `@/shared/errors`        | Error hierarchy                    |
