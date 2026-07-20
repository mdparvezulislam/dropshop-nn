# Order Module — Performance

## Database Indexes

| Collection | Index | Purpose |
|---|---|---|
| `orders` | `{ orderNumber: 1 }` (unique) | Lookup by order number |
| `orders` | `{ checkoutDraftId: 1 }` | Prevent duplicate creation |
| `orders` | `{ status: 1, type: 1 }` | Filtered listing |
| `orders` | `{ createdAt: -1 }` | Default sort for listings |
| `orders` | `{ customer.phone: 1 }` | Customer lookup |
| `orders` | `{ shipping.division: 1, shipping.district: 1 }` | Regional grouping |
| `orders` | `{ tags: 1 }` | Tag-based filtering |
| `orders` | `{ resellerId: 1 }` | Reseller workspace queries |
| `orders` | `{ "status": 1, "completedAt": 1 }` | Auto-completion queries |
| `order_timeline` | `{ entityType: 1, entityId: 1, createdAt: -1 }` | Timeline queries |
| `order_timeline` | `{ action: 1, createdAt: -1 }` | Action-based queries |
| `order_timeline` | `{ correlationId: 1 }` | Cross-module tracing |

## Performance Patterns

### Embedded Timeline
- Last 20 timeline entries are embedded in the Order document for fast reads
- Full history is in the separate `order_timeline` collection
- Serves 95% of read requests from the embedded array

### Pagination
- All list queries use cursor-based or skip/limit pagination
- Default page size: 20, max: 100
- Aggregation pipelines limited to status counts only

### Data Sizing
- Timeline entries capped at 500 per order in embedded array (oldest trimmed)
- Notes capped at 2000 characters
- Tags limited to 10 per order

### Caching Strategy
- Order detail pages cached for 30 seconds (revalidated on status change)
- Order lists cached for 10 seconds
- Status summary counts cached for 60 seconds
- Cache invalidated server-side on write operations via `revalidatePath`
