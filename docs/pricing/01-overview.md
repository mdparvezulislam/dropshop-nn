# 01 - Pricing Engine Overview

## Purpose

The Pricing & Profit Engine is the single source of truth for every product price in DropshopNN. No other module may calculate product prices independently. Checkout, Orders, Finance, Reports, and Analytics must all consume prices from this engine.

## Scope

This engine covers:

- **Cost Foundation**: Supplier price, purchase price, landing cost, packaging, operating cost, total cost
- **Selling Prices**: Retail, reseller, wholesale base, minimum, recommended, campaign, flash sale, festival
- **Wholesale Tier Pricing**: Unlimited quantity tiers with per-tier pricing
- **Reseller Rules**: Min selling price, max discount, custom price controls
- **Profit Engine**: Automatic gross/net profit, margin %, projected profit
- **Campaign Pricing**: Time-windowed pricing overrides
- **Media Visibility**: Role-based media access (Public Gallery, Marketing Kit)
- **Rule Engine**: Centralized, reusable rule evaluation

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Pricing & Profit Engine                         │
├────────────────────────────────────────────────────────────────────────┤
│  Actions Layer                                                         │
│  ┌──────┬──────────┬──────────┬──────────┬───────────────┐            │
│  │Price │ Campaign │ Wholesale│ Rule     │ Media Vis.    │            │
│  │Actions│ Actions  │ Actions  │ Actions  │ Actions       │            │
│  └──┬───┴───┬──────┴──┬───────┴──┬───────┴───┬───────────┘            │
│     │       │         │         │           │                         │
├─────┴───────┴─────────┴─────────┴───────────┴────────────────────────┤
│  Services Layer                                                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐        │
│  │ Pricing  │ Rule     │ Profit   │ Campaign │ Media Vis.   │        │
│  │ Service  │ Engine   │ Engine   │ Service  │ Service      │        │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────┘        │
│       │          │          │         │            │                  │
├───────┴──────────┴──────────┴─────────┴────────────┴────────────────┤
│  Repository Layer                                                    │
│  ┌──────────┬──────────┬──────────┐                                  │
│  │ Pricing  │ Rule     │ Media    │                                  │
│  │ Repo     │ Repo     │ Vis. Repo│                                  │
│  └──────────┴──────────┴──────────┘                                  │
├──────────────────────────────────────────────────────────────────────┤
│  Domain Layer                                                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐       │
│  │ Pricing  │ Rules    │ Profit   │ Campaign │ Media Vis.   │       │
│  │ Entity   │ Entity   │ Entity   │ Entity   │ Entity       │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

## Core Principles

1. **Single Source of Truth**: All price resolution routes through PricingEngine
2. **Role-Aware**: Different roles see different prices
3. **Campaign Override**: Active campaigns override base prices
4. **Tier Resolution**: Wholesale tiers auto-select based on quantity
5. **Validation First**: All price writes validated against rules
6. **Event-Driven**: Every price change publishes events

## Dependencies

| Dependency               | Purpose                            |
| ------------------------ | ---------------------------------- |
| `@/features/catalog`     | Product references                 |
| `@/shared/lib/event-bus` | Event publishing                   |
| `@/shared/core`          | BaseService, permissions, settings |
| `@/shared/utils`         | Logger, validation                 |
| `@/shared/errors`        | Error hierarchy                    |
