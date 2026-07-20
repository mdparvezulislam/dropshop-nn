# Order Module — Cancellation, Return & Refund

## Cancellation Flow

```
Any cancellable status ──► cancelled
                              │
                              ├── Inventory release requested
                              ├── Publish order.cancelled
                              └── Timeline: "order.cancelled"
```

**Cancellable statuses:** `draft`, `pending`, `confirmed`, `packed`, `failed`

**Non-cancellable statuses:** All delivery/return/completed/terminal states

## Return Flow

```
delivered ──► return_requested ──► return_initiated ──► returned ──► refunded
                                                           │
                                                           └── Timeline + events
```

**Return requested:** Customer initiates return via `requestReturn` action
- Publishes `order.return_requested` for Notification Engine to alert admin

**Return initiated:** Admin processes the return
- Publishes `order.return_initiated` for warehouse to receive items

**Returned:** Warehouse confirms physical return receipt
- Publishes `order.returned` for Finance Engine to prepare refund

**Return rejected:** Admin can reject return → status goes back to `delivered`

## Refund Flow

```
returned ──► refunded
```

- Refund amount is in integer cents
- Publishes `order.refunded` for Finance Engine to process actual payment reversal
- Refund requires `Order.Refund` permission

## Data Safety
- Cancelled/returned/refunded dates are tracked separately
- Timeline records all reasons and actor information
- Inventory release only occurs for orders that had inventory committed
