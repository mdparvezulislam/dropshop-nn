# Order Module — Security

## Permission Model

All Server Actions check permissions via `auth()` and `checkPermission()`:

| Action | Permission Required |
|---|---|
| Create order from draft | Order.Create |
| View order | Order.View |
| List orders | Order.View |
| Update order status | Order.Update |
| Confirm order | Order.Confirm |
| Cancel order | Order.Cancel |
| Assign courier | Order.AssignCourier |
| Update tracking | Order.UpdateTracking |
| Process return | Order.ProcessReturn |
| Refund order | Order.Refund |
| Add note | Order.Update |

## Access Control

### Admin Workspace
- Full access to all orders across all types and statuses
- Ability to transition, cancel, return, refund, and add internal notes

### Reseller Workspace
- Can only view their own orders (`resellerId` matches)
- Cannot see internal notes or supplier references
- Cannot transition order status (view-only)

### Customer Portal (future)
- Can view own orders
- Can request returns on delivered orders
- Cannot cancel confirmed orders

## Data Protection
- Customer PII is stored in the immutable `CustomerSnapshot` — never references live user documents
- Internal notes are excluded from customer-facing views
- Phone numbers are stored in E.164 format
- All monetary values are integer cents — no floating-point
