# Supplier Status Workflow

## States
1. **pending** — initial state on creation; awaiting admin review
2. **active** — approved and operational; can receive orders
3. **inactive** — temporarily disabled (manual or by auto-suspend threshold)
4. **suspended** — suspended due to violations or dispute
5. **blocked** — permanently blocked; no further transactions possible
6. **archived** — soft-deleted; hidden from active lists

## Allowed Transitions
| From | To |
|---|---|
| `pending` | `active`, `blocked`, `archived` |
| `active` | `inactive`, `suspended`, `archived` |
| `inactive` | `active`, `suspended`, `blocked`, `archived` |
| `suspended` | `active`, `blocked`, `archived` |
| `blocked` | *(none — terminal)* |
| `archived` | *(none — terminal)* |

## Side Effects
- Changing to `suspended` or `blocked` triggers the `supplier.status_changed` event.
- Downstream services (Catalog, Pricing, Inventory) should react to the event to disable the supplier on their side.
- The `updateSupplierStatusAction` requires `Supplier.Suspend` permission for suspend/block transitions.
