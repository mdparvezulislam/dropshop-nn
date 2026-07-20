# 01 - Catalog Engine Overview

## Purpose

The Catalog Engine is the central product registry for DropshopNN. It owns all product identity, content, media, classification, specifications, variants, SEO, and relationships. Every other engine — Pricing, Inventory, Orders, Search, Analytics, Reports — consumes catalog data but never writes to it.

## Scope

This engine covers:

- **Product Identity**: ID, SKU, Barcode, GTIN, slug
- **Product Content**: Name, description (Tiptap JSON), highlights, features, specifications, warranty
- **Media System**: Featured image, gallery, videos, documents
- **Variant Engine**: Color, size, storage, bundle, capacity — unlimited variants with per-variant SKU, barcode, images, weight, dimensions
- **Classification**: Categories, brands, collections, tags, attributes, labels
- **SEO**: Meta title/description, keywords, canonical URL, Open Graph, Twitter Card
- **Search Metadata**: Keywords, synonyms, search weight, popularity score
- **Supplier Relationships**: M:N product-supplier references (no pricing/stock)
- **Catalog Events**: ProductCreated, ProductUpdated, ProductDeleted, ProductPublished, ProductArchived, VariantCreated, VariantUpdated, MediaUpdated, SEOUpdated, VisibilityChanged

## Boundaries

### Catalog Owns
- Product identity and metadata
- Product content and descriptions
- Product media and documents
- Variants and their attributes
- Classification (brands, categories, collections, tags)
- SEO and search metadata
- Supplier references (M:N)

### Catalog Does NOT Own
- **Pricing**: No cost price, selling price, reseller price, discount, or any monetary value
- **Inventory**: No stock levels, reservations, warehouse data
- **Orders**: No order items, fulfillment status
- **Wallet/Finance**: No transactions, payouts, commissions
- **Supplier Data**: No supplier cost, lead time, or stock

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Catalog Engine                              │
├──────────────────────────────────────────────────────────────────────┤
│  Actions Layer                                                       │
│  ┌──────────────┬──────────────┬────────────────┐                   │
│  │ Product      │ Classification│ Media         │                   │
│  │ Actions      │ Actions      │ Actions        │                   │
│  └──────┬───────┴──────┬───────┴──────┬─────────┘                   │
│         │              │              │                             │
├─────────┴──────────────┴──────────────┴─────────────────────────────┤
│  Services Layer                                                     │
│  ┌──────────────────────────────┬──────────────────────────────────┐│
│  │ ProductService               │ CatalogSearchService             ││
│  │ (CRUD, publish, archive,     │ (search, filter, autocomplete)   ││
│  │  variants, media)            │                                  ││
│  └──────────┬───────────────────┴──────────┬───────────────────────┘│
│             │                              │                        │
├─────────────┴──────────────────────────────┴───────────────────────┤
│  Repository Layer                                                  │
│  ┌──────────────┬──────────────┬────────────────┐                  │
│  │ Product      │ Brand/Cat/   │ Collection     │                  │
│  │ Repository   │ Tag Repos    │ Repository     │                  │
│  └──────────────┴──────────────┴────────────────┘                  │
├────────────────────────────────────────────────────────────────────┤
│  Domain Layer                                                      │
│  ┌──────────────┬──────────────┬────────────────┐                  │
│  │ Product      │ Classification│ Catalog       │                  │
│  │ Entity       │ Entities     │ Events         │                  │
│  └──────────────┴──────────────┴────────────────┘                  │
└────────────────────────────────────────────────────────────────────┘
```

## Event Bus Integration

All catalog mutations publish events. Downstream engines subscribe:

```
Catalog Event → Event Bus
  ├── Pricing Engine (initialize default pricing on ProductCreated)
  ├── Inventory Engine (initialize zero stock on ProductCreated)
  ├── Search Engine (reindex on any change)
  ├── Analytics Engine (track product metrics)
  ├── Reporting Engine (update product reports)
  ├── Notification Engine (notify suppliers of visibility changes)
  └── Audit Engine (record all product mutations)
```

## Dependencies

| Dependency | Purpose |
|-----------|---------|
| `@/shared/lib/event-bus` | Event publishing for catalog events |
| `@/shared/lib/database/generic-repository` | BaseRepository |
| `@/shared/utils` | Logger, slug, validation utilities |
| `@/shared/errors` | Error hierarchy |
| `@/shared/core/permissions` | Permission definitions |
| `@/features/identity` | Actor tracking for audit |
