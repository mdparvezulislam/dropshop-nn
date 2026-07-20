# 02 - Product Model

## Core Fields

| Field | Type | Required | Unique | Indexed | Description |
|-------|------|----------|--------|---------|-------------|
| `name` | String | Yes | No | Yes | Product display name |
| `slug` | String | Yes | Yes | Yes | URL-friendly identifier |
| `sku` | String | Yes | Yes | Yes | Stock keeping unit |
| `barcode` | String | No | Yes | Yes | Barcode/UPC |
| `gtin` | String | No | Yes | Yes | Global Trade Item Number |
| `brandId` | ObjectId | No | No | Yes | Reference to Brand |
| `categoryId` | ObjectId | No | No | Yes | Reference to Category |
| `supplierId` | ObjectId | No | No | Yes | Primary supplier reference |
| `status` | Enum | Yes | No | Yes | draft, pending_review, active, inactive, archived |
| `visibility` | Enum | Yes | No | Yes | public, private, hidden, supplier_only |
| `featured` | Boolean | No | No | Yes | Featured product flag |
| `trending` | Boolean | No | No | Yes | Trending product flag |
| `flashSale` | Boolean | No | No | Yes | Flash sale eligible flag |
| `newArrival` | Boolean | No | No | Yes | New arrival flag |

## Status Lifecycle

```
draft ──→ pending_review ──→ active ──→ archived
                │               │
                └──→ inactive ←─┘
```

### Status Descriptions

| Status | Description |
|--------|-------------|
| `draft` | Product being created; not visible anywhere |
| `pending_review` | Submitted for admin review |
| `active` | Published and visible per visibility rules |
| `inactive` | Temporarily unavailable; can be reactivated |
| `archived` | Permanently removed from catalog; soft-deleted |

## Visibility Levels

| Visibility | Description | Visible To |
|------------|-------------|------------|
| `public` | Visible in all catalog views | All roles |
| `private` | Visible only with direct link | Admin, Manager |
| `hidden` | Exists but not in listings | Anyone with direct link |
| `supplier_only` | Only visible to the owning supplier | Supplier |

## Slug Generation

Slugs are auto-generated from the product name and guaranteed unique:

```
"Premium Wireless Headphones" → "premium-wireless-headphones"
"If taken"                    → "premium-wireless-headphones-1"
```

## Soft Delete

Products are soft-deleted (isDeleted: true) never hard-deleted. This preserves:
- Order history references
- Analytics data continuity
- Audit trail integrity
