# Checkout Security

## Critical Rules
> NEVER trust the frontend for price, stock, or availability data.

### Rule 1: Server-Side Price Resolution
- All prices are resolved server-side by `PriceResolutionService` calling the Pricing Engine.
- The client NEVER sends a price value.
- Cart items store `resolvedPrice` only after server-side resolution.

### Rule 2: Server-Side Inventory Validation
- All stock checks are performed server-side by `InventoryValidationService` calling the Inventory Engine.
- The client NEVER reports stock levels.
- Every checkout validates stock before proceeding to reservation.

### Rule 3: Atomic Validation
- Checkout will not proceed past `inventory_validated` unless every item passes stock validation.
- Checkout will not proceed past `inventory_reserved` unless every reservation succeeds.
- Failed validation or reservation sets checkout status to `failed`.

### Rule 4: Session Integrity
- Checkout sessions are identified by server-generated IDs.
- Cart ownership is verified by sessionId/userId/resellerId matching.
- Expired sessions cannot be resumed.

### Rule 5: Permission Enforcement
| Action | Required Permission |
|---|---|
| Submit checkout | `Checkout.Create` |
| View checkout sessions | `Checkout.View` |
| Manage abandoned carts | `Checkout.Manage` |

## Data Protection
- No PII stored in event payloads (use entity IDs)
- Shipping info stored only on checkout session and order draft
- No payment instruments collected by checkout
