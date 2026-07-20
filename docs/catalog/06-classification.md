# 06 - Classification

## Overview

Products are classified through categories, brands, collections, tags, and attributes. Classification enables navigation, filtering, and grouping across the platform.

## Categories

### Structure

Categories support a tree hierarchy with unlimited depth:

```
Electronics
  ├── Audio
  │     ├── Headphones
  │     ├── Speakers
  │     └── Microphones
  ├── Computers
  │     ├── Laptops
  │     ├── Desktops
  │     └── Tablets
  └── Accessories
        ├── Cables
        └── Chargers
```

### Category Fields

| Field              | Type     | Description                      |
| ------------------ | -------- | -------------------------------- |
| `name`             | String   | Category display name            |
| `slug`             | String   | URL-friendly identifier (unique) |
| `parentCategoryId` | ObjectId | Parent category reference        |
| `description`      | String   | Category description             |
| `image`            | String   | Category image URL               |
| `sortOrder`        | Number   | Display order                    |

### Category Rules

- One product can belong to one category
- Subcategories inherit parent visibility
- Categories can be soft-deleted
- Products in a deleted category are unlinked (not deleted)

## Brands

| Field         | Type   | Description                      |
| ------------- | ------ | -------------------------------- |
| `name`        | String | Brand display name               |
| `slug`        | String | URL-friendly identifier (unique) |
| `logo`        | String | Brand logo URL                   |
| `description` | String | Brand description                |
| `website`     | String | Brand website                    |

- One product can have one brand
- Brands are reusable across products
- Brands can be soft-deleted

## Collections

| Field         | Type       | Description                      |
| ------------- | ---------- | -------------------------------- |
| `name`        | String     | Collection display name          |
| `slug`        | String     | URL-friendly identifier (unique) |
| `description` | String     | Collection description           |
| `image`       | String     | Collection image                 |
| `isActive`    | Boolean    | Whether collection is visible    |
| `sortOrder`   | Number     | Display order                    |
| `productIds`  | ObjectId[] | Products in this collection      |

Collections are curated groupings (e.g., "Summer Sale", "New Arrivals", "Best Sellers 2026"). One product can belong to multiple collections. Collections are manually curated, not automatic.

## Tags

| Field  | Type   | Description                      |
| ------ | ------ | -------------------------------- |
| `name` | String | Tag display name                 |
| `slug` | String | URL-friendly identifier (unique) |

Tags are lightweight labels for filtering and search. One product can have many tags.

## Attributes

```typescript
interface ProductAttribute {
  key: string;
  value: string;
  group: "specification" | "technical" | "general";
}
```

Attributes are key-value pairs within a product for structured data. They differ from specifications in that attributes are searchable and filterable.

## Labels (Future)

Future label system for visual badges:

- "Best Seller"
- "Eco-Friendly"
- "Limited Edition"
- "Premium"
