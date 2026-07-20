# 18 - Event Versioning

## Overview

Event versioning ensures that changes to event payloads do not break existing subscribers. The event schema evolves independently from the publishing service.

---

## Version Strategy

The platform uses a **compatible versioning** strategy:

- **Major version**: Breaking change (field removed, type changed, structure changed)
- **Minor version**: Non-breaking addition (new optional field, new enum value)
- Event type string includes major version: `product.created.v1`

---

## Version Format

```
<domain>.<action>.v<major>
```

Examples:

- `product.created.v1`
- `price.updated.v2`
- `order.shipped.v1`

The `eventVersion` field in the payload contains the full semver:

```typescript
eventVersion: 1; // Major version
```

---

## Version Compatibility Rules

| Change Type        | Version Bump | Subscriber Impact                                   |
| ------------------ | ------------ | --------------------------------------------------- |
| Add optional field | Minor        | None — subscribers ignore unknown fields            |
| Add required field | Major        | All subscribers must update                         |
| Remove field       | Major        | Subscribers reading removed field will break        |
| Rename field       | Major        | Subscribers using old name will break               |
| Change field type  | Major        | Type mismatch errors                                |
| Add enum value     | Minor        | Subscribers should handle unknown values gracefully |
| Remove enum value  | Major        | Subscribers using removed value break               |

---

## Subscriber Version Handling

```typescript
class ProductCreatedSubscriber {
  async handle(event: BusinessEvent): Promise<void> {
    const version = event.eventVersion;

    if (version === 1) {
      return this.handleV1(event.data as ProductCreatedV1Payload);
    }

    if (version === 2) {
      return this.handleV2(event.data as ProductCreatedV2Payload);
    }

    throw new Error(`Unsupported event version: ${version}`);
  }

  private async handleV1(data: ProductCreatedV1Payload): Promise<void> {
    // V1 had: productId, sku, name, categoryId
    const { productId, sku, name } = data;
    await this.indexProduct({ productId, sku, name });
  }

  private async handleV2(data: ProductCreatedV2Payload): Promise<void> {
    // V2 added: brandId, attributes
    const { productId, sku, name, brandId, attributes } = data;
    await this.indexProduct({ productId, sku, name, brandId, attributes });
  }
}
```

---

## Event Registry Version Tracking

```typescript
interface EventVersionInfo {
  eventType: string;
  currentVersion: number;
  versions: {
    version: number;
    createdAt: string;
    changelog: string;
    schema?: object; // JSON Schema for the payload
  }[];
  deprecatedVersions: number[];
  sunsetDate?: string; // When old versions stop being published
}
```

### Version Lifecycle

```
Version 1 (active)
    │
    ├── Version 2 released (active)
    │       │
    │       ├── Version 1 marked as deprecated
    │       ├── Grace period: 30 days
    │       └── All subscribers migrated to V2
    │
    ├── Version 1 sunset
    └── No longer published
```

---

## Publishing Multiple Versions

During migration, the publisher may emit multiple versions:

```typescript
class ProductService {
  async update(id: string, data: UpdateInput): Promise<Product> {
    const product = await this.repository.update(id, data);

    // Publish V1 (current subscribers)
    EventBus.publish("product.updated.v1", this.toV1Payload(product));

    // Publish V2 (new subscribers)
    EventBus.publish("product.updated.v2", this.toV2Payload(product));

    return product;
  }
}
```

---

## Schema Registry (Future)

For automated validation and code generation, event schemas are documented using JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "dropshop:events:product.created:v1",
  "title": "Product Created Event (V1)",
  "type": "object",
  "properties": {
    "productId": { "type": "string", "pattern": "^[0-9a-f]{24}$" },
    "sku": { "type": "string", "minLength": 1 },
    "name": { "type": "string", "minLength": 1 },
    "categoryId": { "type": "string" },
    "status": { "type": "string", "enum": ["draft", "published", "archived"] }
  },
  "required": ["productId", "sku", "name", "status"]
}
```

---

## Migration Process

1. **Announce**: Update Event Registry with new version, mark old as deprecated
2. **Implement**: Update publisher to emit new version (both old and new during transition)
3. **Migrate**: Update subscribers one by one to handle the new version
4. **Verify**: Ensure all critical subscribers are migrated
5. **Sunset**: Stop publishing the old version (after grace period)

---

## Current Event Versions

| Event Type          | Current Version | Deprecated Versions | Status |
| ------------------- | --------------- | ------------------- | ------ |
| product.created     | 1               | -                   | Active |
| product.updated     | 1               | -                   | Active |
| product.deleted     | 1               | -                   | Active |
| price.created       | 1               | -                   | Active |
| price.updated       | 1               | -                   | Active |
| inventory.created   | 1               | -                   | Active |
| inventory.adjusted  | 1               | -                   | Active |
| order.created       | 1               | -                   | Active |
| customer.registered | 1               | -                   | Active |
| reseller.registered | 1               | -                   | Active |
| supplier.created    | 1               | -                   | Active |
| system.login        | 1               | -                   | Active |
