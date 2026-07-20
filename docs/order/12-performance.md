# 12 - Order Engine Performance Plan

## Optimizations

1. **Database Indexes**: Optimized query indexing on:
   - `{ orderNumber: 1 }` (unique)
   - `{ checkoutDraftId: 1 }`
   - `{ status: 1, type: 1 }`
   - `{ createdAt: -1 }`
2. **Atomic Transitions**: Utilizing Mongoose database transactions to guarantee safety during status updates and concurrent modifications.
3. **Cursor Pagination**: Reusable cursor page limits to query lists in under 50ms.
