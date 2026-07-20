# Order Module — Events

## Published Events

| Event | Trigger | Key Payload |
|---|---|---|
| `order.created` | Order creation | orderId, orderNumber, type, grandTotal, itemCount |
| `order.confirmed` | Order confirmed | orderId, orderNumber, confirmedBy |
| `order.packed` | Items packed | orderId, orderNumber |
| `order.ready_for_dispatch` | Ready for pickup | orderId, orderNumber |
| `order.courier_assigned` | Courier assigned | orderId, orderNumber, courierId, courierName |
| `order.shipped` | Shipped | orderId, orderNumber, trackingNumber, trackingUrl |
| `order.out_for_delivery` | Last mile | orderId, orderNumber |
| `order.delivered` | Delivered | orderId, orderNumber, deliveredAt |
| `order.completed` | Completed | orderId, orderNumber, totalCostBasis, totalRevenue, totalProfit |
| `order.cancelled` | Cancelled | orderId, orderNumber, reason, cancelledBy, inventoryReleased |
| `order.return_requested` | Return requested | orderId, orderNumber, reason |
| `order.return_initiated` | Return initiated | orderId, orderNumber, initiatedBy |
| `order.returned` | Items returned | orderId, orderNumber |
| `order.refunded` | Refunded | orderId, orderNumber, refundAmount, refundedBy |
| `order.failed` | Failed | orderId, orderNumber, reason, failedStep |
| `order.inventory_reserved` | Inventory release/commit | orderId, orderNumber, action |
| `order.timeline_entry_added` | Timeline update | orderId, action, summary |

## Event Standards
- All events use standard `BusinessEvent` envelope: eventId (UUID v7), timestamp (ISO 8601), correlationId, causationId, actor
- Events are registered via `EventRegistry` in `init.ts`
- All events are `handlerType: "async"` with retry config

## Event Consumers
| Engine | Subscribes To |
|---|---|
| Finance Engine | `order.completed`, `order.refunded`, `order.cancelled` |
| Courier Engine | `order.ready_for_dispatch`, `order.courier_assigned` |
| Analytics Engine | All order events |
| Notification Engine | `order.confirmed`, `order.shipped`, `order.delivered`, `order.cancelled` |
| Audit Engine | All order events |
| Automation Engine | `order.created`, `order.return_requested`, `order.failed` |

## Subscribed Events
| Source Event | Handler |
|---|---|
| `checkout.order_draft_created` | Creates new order from draft |
