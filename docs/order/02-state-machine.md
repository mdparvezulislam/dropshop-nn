# Order Module — State Machine

## States (16)

| # | Status | Category | Description |
|---|---|---|---|
| 1 | `draft` | draft | Initial state after order is created from checkout draft |
| 2 | `pending` | active | Order is pending for processing / approval |
| 3 | `confirmed` | active | Order is confirmed by admin or auto-confirm |
| 4 | `packed` | fulfillment | Items are packed by warehouse |
| 5 | `ready_for_dispatch` | fulfillment | Order is ready for courier pickup |
| 6 | `courier_assigned` | delivery | Courier assigned, awaiting pickup |
| 7 | `shipped` | delivery | In transit with courier |
| 8 | `out_for_delivery` | delivery | Last-mile delivery in progress |
| 9 | `delivered` | delivery | Successfully delivered to customer |
| 10 | `completed` | completed | Fully completed (post-delivery settlement) |
| 11 | `cancelled` | cancelled | Order cancelled before or during fulfillment |
| 12 | `return_requested` | return | Customer requested a return |
| 13 | `return_initiated` | return | Return process initiated by admin |
| 14 | `returned` | return | Items physically returned |
| 15 | `refunded` | return | Payment refunded to customer |
| 16 | `failed` | failed | Processing failed (courier, system error) |

## Valid Transitions

```
draft ──────────────► pending ──────► confirmed ──────► packed ──────► ready_for_dispatch
  │                     │               │                 │
  └──► cancelled ◄─────┘               └──► cancelled ◄──┘

ready_for_dispatch ──► courier_assigned ──► shipped ──► out_for_delivery ──► delivered
                                                    │                       │
                                                    └──► failed ────────────┘

delivered ──► completed
delivered ──► return_requested ──► return_initiated ──► returned ──► refunded
return_requested ──► delivered (rejected)

failed ──► cancelled
```

## Terminal States
- `completed` — final success
- `cancelled` — final cancelled
- `refunded` — final returned + refunded

## Enforcement
- Every transition is validated by `canTransition()` which checks `VALID_TRANSITIONS` map
- Terminal states reject all transitions
- Permission checks happen at the Server Action layer
- Status is immutable once in a terminal state
