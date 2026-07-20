# 09 - Order Security Plan

## Protection Mechanisms

1. **Role Access Check**: Every server action validates session token roles against specific RBAC scopes (`Order.Update`, `Order.Cancel`, `Order.Refund`, `Order.AssignCourier`).
2. **Immutable Snapshots**: Prevents tampering with order prices or quantities once drafts convert.
3. **Audit Logger**: Every state transition registers actor user identities (internal/system/admin/reseller) to prevent unauthenticated database modifications.
