# Checkout Performance

## Design Decisions

### Redis-Ready Architecture
- Cart caching can be layered on Redis without changing domain logic
- Checkout sessions are independent documents — easy to cache
- Price resolution results are cacheable by productId+variantSku+role

### Session Recovery
- Active carts survive page refreshes (persisted in MongoDB)
- Checkout sessions survive server restarts
- Incomplete checkouts can be resumed via `findActiveByCart`

### Atomic Validation
- All validation steps are atomic — no partial checkout state
- `reserveInventory` reserves all or none (individual failures are tracked but checkout fails as a whole)
- Order draft creation runs inside `runInTransaction`

### Optimistic Locking
- Cart updates use MongoDB atomic `$set` operations
- Stock reservations are atomic via Inventory Engine's transactional `adjustStock`

### Indexes
| Collection | Index | Purpose |
|---|---|---|
| `carts` | `(userId, status)` | Active cart lookup |
| `carts` | `(sessionId, status)` | Guest cart lookup |
| `carts` | `(status, lastActivityAt)` | Abandoned cart queries |
| `checkout_sessions` | `(cartId, status)` | Resume checkout lookup |
| `checkout_sessions` | `(status, createdAt)` | Admin listing |
| `checkout_sessions` | `expiresAt` (TTL) | Auto-cleanup expired sessions |

### High Concurrency
- Cart operations are single-document writes (no cross-document locks)
- Checkout sessions are independent from each other
- Price resolution is read-only from Pricing Engine (no write locks)
- Inventory reservation uses the Inventory Engine's existing transactional path

### Large Cart Support
- Max 50 items per cart (configurable via setting)
- Max quantity 100 per item (configurable via setting)
- Paginated admin listing for checkout sessions
