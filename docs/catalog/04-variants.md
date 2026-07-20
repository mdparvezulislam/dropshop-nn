# 04 - Variants

## Overview

The variant engine supports unlimited variant dimensions and combinations. Each variant has its own identity (SKU, barcode) and physical attributes (weight, dimensions).

## Variant Dimensions

Products can have any number of variant dimensions:

| Dimension | Example Values | Type |
|-----------|---------------|------|
| Color | Red, Blue, Black | String |
| Size | S, M, L, XL | String |
| Storage | 64GB, 128GB, 256GB | String |
| RAM | 8GB, 16GB, 32GB | String |
| Capacity | 1kg, 5kg, 10kg | String |
| Material | Cotton, Polyester, Leather | String |
| Bundle | Console + Controller, Console + 2 Games | String |
| Custom | Any key-value pair | Custom Attribute |

## Variant Structure

```typescript
interface ProductVariant {
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  capacity?: string;
  material?: string;
  sku: string;              // Unique SKU for this variant
  barcode?: string;          // Variant-specific barcode
  price?: number;            // Only for price indication; official pricing in Pricing Engine
  weight?: number;           // Weight in grams
  weightUnit?: string;       // g, kg, lb
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;           // cm, in
  };
  images?: string[];         // Variant-specific images
  status: "active" | "inactive";
  sortOrder?: number;
  customAttributes?: Record<string, string>;  // Custom variant attributes
}
```

## Variant SKU Convention

Variant SKUs relate to the parent product SKU:

```
PRO-SKU-001              (Parent product SKU)
PRO-SKU-001-RED          (Color: Red)
PRO-SKU-001-RED-M        (Color: Red, Size: M)
PRO-SKU-001-BLUE-L       (Color: Blue, Size: L)
```

## Variant Status

| Status | Description |
|--------|-------------|
| `active` | Variant is available and sellable |
| `inactive` | Variant is temporarily unavailable |

When all variants are inactive, the product status should be set to inactive.

## Variant Operations

| Operation | Description | Event |
|-----------|-------------|-------|
| Add variant | Add new variant to product | VariantCreated |
| Update variant | Modify variant attributes | VariantUpdated |
| Remove variant | Soft-remove variant | ProductUpdated |
| Reorder variants | Change sort order | ProductUpdated |
| Batch update | Update multiple variants | ProductUpdated |

## Future: Matrix View

Admin UI should display variants in a matrix/grid view for bulk editing:

```
        │ Size S │ Size M │ Size L │ Size XL
────────┼────────┼────────┼────────┼─────────
Color R │ SKU-01 │ SKU-02 │ SKU-03 │ SKU-04
Color B │ SKU-05 │ SKU-06 │ SKU-07 │ SKU-08
Color G │ SKU-09 │ SKU-10 │ SKU-11 │ SKU-12
```
