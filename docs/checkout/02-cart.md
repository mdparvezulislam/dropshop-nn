# Cart System

## Cart Entity
| Field | Type | Description |
|---|---|---|
| `type` | `CartType` | `guest`, `customer`, `reseller`, `wholesaler` |
| `status` | `CartStatus` | `active`, `abandoned`, `converted`, `expired` |
| `sessionId` | `string?` | Guest session identifier |
| `userId` | `string?` | Registered customer ID |
| `resellerId` | `string?` | Reseller ID |
| `wholesaleId` | `string?` | Wholesaler ID |
| `items` | `CartItem[]` | Cart line items |
| `itemCount` | `number` | Sum of all item quantities |
| `subtotal` | `number` | Sum of resolvedPrice × quantity per item (cents) |
| `currency` | `string` | ISO 4217 (default `USD`) |
| `expiresAt` | `Date?` | TTL for automatic cleanup |
| `lastActivityAt` | `Date` | Last modification timestamp |

## CartItem
| Field | Type | Description |
|---|---|---|
| `productId` | `string` | FK to Catalog product |
| `variantSku` | `string?` | Optional variant SKU |
| `quantity` | `number` | Positive integer |
| `resolvedPrice` | `number` | Price resolved from Pricing Engine (cents) |
| `currency` | `string` | ISO 4217 |
| `appliedRule` | `string?` | Name of applied pricing rule |
| `campaignId` | `string?` | Active campaign ID |
| `profitPreview` | `object?` | Cost basis, profit amount, margin |

## Cart Lifecycle
```
active ──> converted (checkout completed)
   │
   ├──> abandoned (inactivity timeout)
   └──> expired (TTL reached)
```

## Cart Operations
| Operation | Description |
|---|---|
| `getOrCreateCart` | Find active cart or create new one |
| `addItem` | Add product with resolved price, merge if duplicate |
| `updateItemQuantity` | Change quantity (0 removes item) |
| `removeItem` | Remove by index |
| `clearCart` | Remove all items |
| `getActiveCart` | Find by session/user/reseller |
| `markConverted` | Set status to converted after checkout |
| `markAbandoned` | Bulk mark carts inactive before threshold |

## Persistence
- Carts are stored in the `carts` MongoDB collection.
- TTL index on `expiresAt` automatically removes expired carts.
- Compound indexes on `(sessionId, status)`, `(userId, status)`, `(resellerId, status)`.
- Status + lastActivityAt index for abandoned cart queries.

## Guest Cart Behavior
- Guest carts are keyed by `sessionId` (client-generated UUID stored in cookie/localStorage).
- Guest carts persist across page refreshes within the same session.
- On login, guest carts may be merged with the user's existing cart (future feature).
