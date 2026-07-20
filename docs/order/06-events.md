# 06 - Order Domain Events

## Events Published

- `order.created`: Ingestion success.
- `order.confirmed`: Paid or manually confirmed.
- `order.packed`: Packed ready.
- `order.ready_for_dispatch`: Operational fulfillment ready.
- `order.courier_assigned`: Logistics dispatch.
- `order.shipped`: Courier tracking active.
- `order.out_for_delivery`: Last-mile delivery.
- `order.delivered`: Customer receipt.
- `order.completed`: Profit payouts finalized.
- `order.cancelled`: Stock release trigger.
- `order.returned`: Return processed.
- `order.refunded`: Refund completed.

Events are published asynchronously via the enqueued EventBus system.
