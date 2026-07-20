# Order Module — Order Creation

## Flow

```
Checkout Module                    Order Module
┌─────────────────┐              ┌──────────────────┐
│ OrderDraft      │──event────►  │ OrderService     │
│ (checkout.      │              │ .createFromDraft │
│  order_draft_   │              │                  │
│  created)       │              └──────────────────┘
└─────────────────┘                      │
                                         ▼
                                  ┌──────────────────┐
                                  │ Validate input   │
                                  │ (Zod schema)     │
                                  └──────────────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Check duplicate  │
                                  │ (draftId unique) │
                                  └──────────────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Create Order     │
                                  │ status: draft    │
                                  │ or confirmed     │
                                  │ (autoConfirm)    │
                                  └──────────────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Timeline entry   │
                                  │ "order.created"  │
                                  └──────────────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Publish event    │
                                  │ order.created    │
                                  └──────────────────┘
```

## Input Validation
All inputs validated via `createOrderFromDraftSchema`:
- `draftId` — valid ObjectId
- `orderNumber` — unique, 1-50 chars
- `customer` — name, phone (E.164), optional email
- `shipping` — full address fields
- `pricing` — items array (min 1), all prices in integer cents
- `profitPreview` — optional, if present all fields required
- `source`, `resellerId`, `wholesaleId`, `autoConfirmed` — optional

## Creation Rules
1. Order is never created directly from frontend — only via `checkout.order_draft_created` event or admin action
2. Duplicate `draftId` check prevents double-creation
3. If `autoConfirmed` feature flag is on, order starts in `confirmed` status
4. If `autoConfirmed` is off, order starts in `draft` status awaiting admin confirmation
5. All monetary values are in integer cents — no floating-point math
6. Customer and pricing data are snapshotted immutably — never reference live entities
