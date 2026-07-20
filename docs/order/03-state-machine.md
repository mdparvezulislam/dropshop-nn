# 03 - Order State Machine

## Allowed Status Transitions

Orders must follow the configured path:

1. `draft` -> `pending` / `cancelled`
2. `pending` -> `confirmed` / `cancelled`
3. `confirmed` -> `packed` / `cancelled`
4. `packed` -> `ready_for_dispatch` / `cancelled`
5. `ready_for_dispatch` -> `courier_assigned`
6. `courier_assigned` -> `shipped` / `failed`
7. `shipped` -> `out_for_delivery` / `failed`
8. `out_for_delivery` -> `delivered` / `failed`
9. `delivered` -> `completed` / `return_requested`
10. `return_requested` -> `return_initiated` / `delivered`
11. `return_initiated` -> `returned`
12. `returned` -> `refunded`
13. `failed` -> `cancelled`

Terminal states (`completed`, `cancelled`, `refunded`) are immutable.
All transitions enforce guards and role check permissions.
