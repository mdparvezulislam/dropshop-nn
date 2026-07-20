# 11 - Admin Workspace

## Overview

The Admin Pricing Workspace provides a premium interface for managing all pricing aspects of a product.

## Workspace Sections

### 1. Cost Breakdown

- Supplier Price input
- Purchase Price input
- Landing Cost input
- Packaging Cost input
- Operating Cost input
- Additional Cost input
- Total Cost (auto-computed, read-only)
- Commission Rate input
- Tax Rate input

### 2. Selling Prices

- Minimum Selling Price
- Recommended Selling Price
- Retail Price
- Reseller Price
- Wholesale Base Price
- Campaign Price (with date picker)
- Flash Sale Price (with date picker)
- Festival Price (with date picker)

### 3. Wholesale Tier Pricing

- Tier table with add/remove/edit
- Each row: Min Qty, Price, Discount %, Description
- Auto-sort by minQty
- Bulk savings calculator

### 4. Campaign Pricing

- Campaign type selector (Campaign / Flash Sale / Festival)
- Start date picker
- End date picker
- Campaign price input
- Active campaign indicator

### 5. Profit Preview

- Real-time profit calculator
- Cost breakdown chart
- Revenue breakdown chart
- Margin gauge
- What-if analysis inputs

### 6. Margin Analysis

- Gross margin %
- Net margin %
- Markup %
- Break-even analysis
- Projected profit at volume

### 7. Media Visibility

- Media collection selector per media item
- Visibility preview showing which roles see what

### 8. Pricing Timeline

- History of all pricing changes
- Actor, timestamp, changed fields
- Before/after values
- Audit trail

## Data Flow

```
Admin saves pricing form
  │
  ├── Validate all inputs (Zod + Rule Engine)
  ├── Save to database
  ├── Recalculate profit
  ├── Publish pricing.updated event
  ├── Refresh profit preview
  └── Return success with updated data
```
