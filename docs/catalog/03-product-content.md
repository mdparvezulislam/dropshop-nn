# 03 - Product Content

## Overview

Product content includes all descriptive and informational fields. Content is stored as structured data to support rich rendering and search indexing.

## Content Fields

| Field | Type | Format | Description |
|-------|------|--------|-------------|
| `name` | String | Plain text | Product display name (max 255 chars) |
| `shortDescription` | String | Plain text | Brief summary (max 500 chars) |
| `richDescription` | Object | Tiptap JSON | Full rich editor content |
| `highlights` | String[] | Bullet list | Key selling points (max 10) |
| `includedItems` | String[] | List | What's in the box |
| `features` | String[] | Bullet list | Product features (max 20) |
| `specifications` | Object[] | Key-value pairs | Technical specs |
| `technicalDetails` | Object | Tiptap JSON | Detailed technical information |
| `warrantyInformation` | String | Plain text | Warranty terms |
| `returnPolicy` | String | Plain text | Return policy details |
| `productModel` | String | Plain text | Model number/name |

## Specification Format

```typescript
interface ProductSpecification {
  key: string;
  value: string;
  group: "specification" | "technical" | "general";
}
```

Specifications are grouped for UI rendering:
- **General**: Color, material, style
- **Specification**: Dimensions, weight, capacity
- **Technical**: Processor, RAM, storage, connectivity

## Rich Description (Tiptap)

The `richDescription` field stores Tiptap JSON format for rich text editing:

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Product description" }] }
  ]
}
```

## Content Validation Rules

| Field | Rule |
|-------|------|
| name | Required, 2-255 characters |
| shortDescription | Optional, max 500 characters |
| highlights | Max 10 items, 200 chars each |
| features | Max 20 items, 500 chars each |
| specifications | Max 50 key-value pairs |
| warrantyInformation | Max 2000 characters |
| returnPolicy | Max 2000 characters |

## Content Ownership

Content is owned entirely by the Catalog Engine. No other engine modifies product content. External engines read content through the catalog's public API/services.
