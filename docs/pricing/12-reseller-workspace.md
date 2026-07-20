# 12 - Reseller Workspace

## Overview

The Reseller Pricing Workspace shows resellers their pricing information while hiding sensitive cost data.

## Display Sections

### 1. Your Pricing
- **Reseller Price**: The base price for this reseller
- **Minimum Selling Price**: Floor price (cannot go below)
- **Recommended Selling Price**: Suggested selling price
- **Your Current Selling Price**: Currently set price (if custom)

### 2. Profit Preview
- **Estimated Profit**: Profit per unit at current selling price
- **Estimated Margin**: Profit margin percentage
- **Projected Profit**: Estimated profit at volume

### 3. Marketing Kit
- Download HD images
- Download Facebook posters
- Download product videos
- Download product descriptions
- Download marketing assets

### 4. Price History
- Recent price changes
- Campaign price history

## Data NEVER Displayed

The following are NEVER exposed to resellers:
- ❌ Supplier Price
- ❌ Purchase Price
- ❌ Landing Cost
- ❌ Packaging Cost
- ❌ Operating Cost
- ❌ Total Cost
- ❌ Platform Commission
- ❌ Other Resellers' Prices

## Access Control

The Reseller Workspace is only accessible to users with role `reseller`. Unauthorized access attempts:
- Return 403 Forbidden
- Log security event
- Notify admin
