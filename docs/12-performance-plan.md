# 12 - Performance Plan

## 1. Database Indexing

- Create indexes on frequently queried fields like `sku` in products and `userId` in orders.

## 2. Caching Strategy

- Cache heavy reads in Redis with appropriate TTL.
- Invalidate cache entries on write events (e.g. invalidate products cache when product details are updated).

## 3. Media serving

- Serve all product and banner images through ImageKit CDN, appending parameters for width/height crop adjustments.
