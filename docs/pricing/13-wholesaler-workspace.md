# 13 - Wholesaler Workspace

## Overview

The Wholesaler Pricing Workspace shows wholesale pricing tiers and bulk savings information.

## Display Sections

### 1. Wholesale Pricing Table

- Full tier table: Min Qty, Unit Price, Discount %, Savings
- Current tier highlighted based on cart quantity
- Next tier incentive ("Add {N} more to save {X}%")
- MOQ clearly displayed

### 2. Bulk Savings Calculator

- Enter quantity → see applicable tier
- Total cost at tier price
- Savings vs base price
- Savings percentage

### 3. Marketing Kit

- Download wholesale catalog
- Download product images
- Download branding assets
- Download marketing materials

### 4. Wholesale Documents

- Bulk pricing sheets
- Product specification sheets
- Wholesale terms

## Data NEVER Displayed

- ❌ Reseller prices
- ❌ Retail cost breakdown
- ❌ Platform commission
- ❌ Other wholesalers' prices

## Access Control

The Wholesaler Workspace is only accessible to users with role `wholesaler`. Unauthorized access:

- Return 403 Forbidden
- Log security event
