# Order Module — Status Transitions

## Transition Service

`OrderService.transitionStatus()` is the single entry point for all status changes. It enforces:

1. **State machine validation** — `canTransition(from, to)` checked before any change
2. **Terminal state guard** — completed/cancelled/refunded orders cannot be changed
3. **Duplicate guard** — no-op if toStatus equals current status
4. **Timestamp tracking** — sets completedAt/cancelledAt/returnedAt/refundedAt/failedAt automatically
5. **Timeline recording** — entry added with before/after values
6. **Event publishing** — domain event published for downstream engines
7. **Inventory management** — requests inventory release when cancelling confirmed orders

## Permission Checks

| Transition | Required Permission |
|---|---|
| draft → pending | Order.Update |
| pending → confirmed | Order.Confirm |
| confirmed → packed | Order.Pack |
| packed → ready_for_dispatch | Order.Update |
| ready_for_dispatch → courier_assigned | Order.AssignCourier |
| courier_assigned → shipped | System (courier webhook) |
| shipped → out_for_delivery | System (courier webhook) |
| out_for_delivery → delivered | System (courier webhook) |
| delivered → completed | Order.Update (or auto) |
| any → cancelled | Order.Cancel |
| delivered → return_requested | Order.Update (customer) |
| return_requested → return_initiated | Order.ProcessReturn |
| return_initiated → returned | Order.ProcessReturn |
| returned → refunded | Order.Refund |
| any → failed | System |
| failed → cancelled | Order.Cancel |

## Auto-Completion
After delivery, orders can be auto-completed after `order.auto_complete_days` setting (default 7 days) via a scheduled job.
