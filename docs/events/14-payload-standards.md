# 14 - Payload Standards

## Overview

All event payloads follow a strict standard to ensure consistency, type safety, and forward compatibility.

---

## Standard Fields

Every event payload MUST include:

```typescript
interface EventPayload {
  // Always present
  eventId: string; // UUID v7
  eventType: string; // e.g., "product.created"
  eventVersion: number; // Payload schema version (starts at 1)
  timestamp: string; // ISO 8601 UTC
  source: string; // Module name

  // Metadata
  correlationId: string; // Trace across event chain
  causationId?: string; // Parent event ID (if triggered by another event)
  actor?: {
    id: string;
    name?: string;
    role?: string;
  };

  // Domain data
  data: Record<string, unknown>;
}
```

---

## Naming Conventions

### Event Type

```
<domain>.<action>
```

- All lowercase
- Dot-separated
- Past tense verbs
- Example: `product.created`, `order.shipped`, `inventory.low_stock_detected`

### Field Names

- camelCase
- Single concept per field
- Avoid abbreviations (use `productId` not `pid`)
- Boolean fields: prefix with `is` (e.g., `isAutoApproved`)
- Timestamps: field name + `At` suffix (e.g., `createdAt`, `shippedAt`)

### Enum Values

- snake_case
- All lowercase
- Example: `in_stock`, `out_of_stock`, `pending_verification`

---

## Monetary Values

- All monetary values are **integer cents**
- Currency stored separately as ISO 4217 code (`BDT`, `USD`)
- Zero allowed (free products, zero cost)
- Negative not allowed (use refund events instead)

---

## Identifier Fields

| Type          | Format                  | Example                                  |
| ------------- | ----------------------- | ---------------------------------------- |
| Entity ID     | MongoDB ObjectId string | `"507f1f77bcf86cd799439011"`             |
| SKU           | Uppercase alphanumeric  | `"PRD-001-BLK"`                          |
| Order Number  | Prefixed sequential     | `"ORD-20260719-1234"`                    |
| Reseller Code | RSL-XXXX                | `"RSL-0042"`                             |
| Supplier Code | SUP-XXXX                | `"SUP-0101"`                             |
| Event ID      | UUID v7                 | `"0192ab3c-7d8e-4f01-9012-3456789abcde"` |

---

## Timestamps

- All timestamps are ISO 8601 in UTC
- Format: `"2026-07-19T14:30:00.000Z"`
- No local timezone offsets in payloads
- Timezone conversion handled by the consumer

---

## Changes Array Pattern

For update events, use the standardized changes array:

```typescript
changes: {
  field: string; // Field name (dot notation for nested)
  oldValue: unknown; // Previous value (null if new)
  newValue: unknown; // Current value
  type: "scalar" | "array" | "object" | "reference";
}
[];
```

Example:

```typescript
changes: [
  { field: "sellingPrice", oldValue: 10000, newValue: 12000, type: "scalar" },
  { field: "status", oldValue: "draft", newValue: "published", type: "scalar" },
];
```

---

## Payload Size Limits

| Constraint         | Limit       | Enforcement         |
| ------------------ | ----------- | ------------------- |
| Max payload size   | 256 KB      | EventBus validation |
| Max items in array | 1000        | Schema validation   |
| Max string length  | 10000 chars | Schema validation   |
| Max nesting depth  | 5 levels    | Schema validation   |

---

## Versioning

- `eventVersion` starts at 1
- Breaking changes increment the version
- Non-breaking additions use optional fields
- Subscribers must check `eventVersion` before processing
- Event Registry stores the latest version per event type

### Breaking Changes

- Removing a required field
- Changing a field type
- Restructuring nested objects

### Non-Breaking Changes

- Adding an optional field
- Adding a new enum value
- Extending allowed values

---

## Security & PII

- Never include passwords, secrets, or tokens
- Mask email addresses in analytics events
- Mask phone numbers except last 4 digits
- Never include raw payment details
- Use entity IDs instead of personal data where possible

---

## Example: Complete Event Payload

```typescript
{
  "eventId": "0192ab3c-7d8e-4f01-9012-3456789abcde",
  "eventType": "product.created",
  "eventVersion": 1,
  "timestamp": "2026-07-19T14:30:00.000Z",
  "source": "product-service",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "actor": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "role": "admin"
  },
  "data": {
    "productId": "507f1f77bcf86cd799439011",
    "sku": "PRD-001",
    "name": "Wireless Bluetooth Headphones",
    "slug": "wireless-bluetooth-headphones",
    "categoryId": "507f1f77bcf86cd799439012",
    "brandId": "507f1f77bcf86cd799439013",
    "variants": [
      { "sku": "PRD-001-BLK", "name": "Black", "attributes": { "color": "black" } },
      { "sku": "PRD-001-WHT", "name": "White", "attributes": { "color": "white" } }
    ],
    "status": "draft"
  }
}
```
