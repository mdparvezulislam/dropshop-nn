# 06 - Database Plan

## MongoDB Connections & Pools

- Connections are managed by `DatabaseConnectionManager` in `src/shared/lib/database/connection-manager.ts` (connection pooling, retry loop, and graceful process shutdown SIGINT/SIGTERM handlers).
- Max pool size: 10.
- Min pool size: 2.
- ReadyState status endpoints are monitored by `DatabaseConnectionManager.getHealthStatus()`.

## Base Mongoose Schema Infrastructure

All Mongoose schemas automatically extend the custom Mongoose foundation features:

- **Base Fields**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, `isDeleted`, `status`, `metadata`.
- **Soft Delete**: Query hooks automatically strip soft-deleted records (`isDeleted: { $ne: true }`) across `find`, `findOne`, and count queries. Use `.isDeleted(true)` to include deleted records.
- **Output transform**: Virtual `id` is mapped to string from `_id`, while `__v` and `_id` are removed on JSON serialization.

## MongoDB Indexing Guidelines

1. **Single Fields**: Add index attributes to unique fields and lookup fields (e.g., `sku` in products, `email` in users).
2. **Compound Indexes**: Construct indexes for combined filter queries (e.g., `{ userId: 1, status: 1 }` for order listings).
3. **Text Search**: Add text indexing configurations for text searches.
4. **TTL Indexes**: Leverage TTL indexes on temp entries (e.g., email verification codes, temporary queues).

---

## MongoDB Collections Schema

### Users (`users`)

- `_id`: ObjectId
- `name`: String
- `email`: String (indexed, unique)
- `passwordHash`: String
- `role`: Enum ("admin", "user", "courier")
- Base schema audit and tracking parameters...

### Products (`products`)

- `_id`: ObjectId
- `sku`: String (indexed, unique)
- `name`: String
- `price`: Number
- `imagekitUrl`: String
- Base schema audit and tracking parameters...

### Orders (`orders`)

- `_id`: ObjectId
- `userId`: ObjectId (indexed)
- `items`: Array of items (sku, quantity, price)
- `totalAmount`: Number
- `status`: Enum ("pending", "processing", "shipped", "delivered", "cancelled")
- Base schema audit and tracking parameters...

### Payments (`payments`)

- `_id`: ObjectId
- `orderId`: ObjectId (indexed)
- `transactionId`: String (indexed, unique)
- `amount`: Number
- `gateway`: String (e.g., "stripe")
- `status`: Enum ("pending", "completed", "failed", "refunded")
- Base schema audit and tracking parameters...

---

## Redis Caching Schema

- Cache Keys structure: `dropshop:cache:<domain>:<identifier>` (e.g., `dropshop:cache:products:sku123`).
- Cache expiry: TTL configurations of 15 minutes default for database payloads.
- BullMQ Redis prefix: `dropshop:queue:<queue-name>` to isolate job lists.
