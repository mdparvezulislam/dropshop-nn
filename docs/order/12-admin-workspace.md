# Order Module — Admin Workspace

## Planned Pages

### Order List (`/dashboard/orders`)
- Paginated table with search, filter by status/type/date range
- Bulk selection for batch operations (cancel, confirm, assign courier)
- Quick-status badges with color coding
- Export to CSV

### Order Detail (`/dashboard/orders/[id]`)
- Order summary card (order number, status, type, dates)
- Customer snapshot (name, phone, email)
- Shipping snapshot (full address)
- Pricing breakdown with per-item profit preview
- Timeline feed (chronological, filterable)
- Courier/tracking section
- Notes section (public + internal)
- Status transition buttons with reason prompts
- Cancellation/return/refund action panel

### Order Create (`/dashboard/orders/new`)
- This is NOT a form — orders are created from checkout drafts
- Lists available checkout drafts for admin to convert to orders
- Allows override of autoConfirm flag

## Status Badge Colors

| Status | Color |
|---|---|
| draft | gray |
| pending | yellow |
| confirmed | blue |
| packed | indigo |
| ready_for_dispatch | purple |
| courier_assigned | teal |
| shipped | cyan |
| out_for_delivery | sky |
| delivered | green |
| completed | emerald |
| cancelled | red |
| return_requested | orange |
| return_initiated | amber |
| returned | rose |
| refunded | pink |
| failed | red/dark |
