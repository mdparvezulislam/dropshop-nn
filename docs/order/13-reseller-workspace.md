# Order Module — Reseller Workspace

## Data Isolation
- Resellers see only orders where `resellerId` matches their account
- All queries filter by `resellerId` at the repository layer

## Planned Views

### My Orders (`/dashboard/reseller/orders`)
- Filtered list of own orders
- Visible fields: order number, status, items count, grand total, dates
- Hidden fields: internal notes, supplier references, cost basis, profit data

### Order Detail (`/dashboard/reseller/orders/[id]`)
- Customer snapshot (name, phone — not full PII)
- Shipping address
- Pricing snapshot (selling prices only — no cost/profit)
- Status timeline (without internal actions)
- Tracking information
- Return request button for delivered orders

## Permissions
- `Order.View` — filtered by resellerId
- No write permissions — resellers cannot transition status
- `Order.ReturnRequest` — allowed on delivered orders only

## Profit Data Visibility
- Resellers see their selling prices but NOT cost basis or profit margins
- `OrderProfitPreview` is stripped from reseller responses
- Individual item pricing shows `unitSellingPrice` but not `unitCostBasis`
