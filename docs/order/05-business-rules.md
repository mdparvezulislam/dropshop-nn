# 05 - Order Business Rules

## Rules Definition

1. **Checkout Validation**: Only successfully validated checkout drafts can be ingested to generate orders. Direct order creation bypassing checkout drafts is strictly forbidden.
2. **State Machine Strictness**: Orders cannot bypass state machine progression. Any invalid state jump triggers a validation error.
3. **Immutable Completed Orders**: Once an order status becomes `completed`, it cannot be modified or edited in any way.
4. **Cancellation Release**: When transitioning to the `cancelled` status, the Order Service must trigger stock release messages to the Inventory Engine.
5. **Delivery Signal**: When an order transitions to `delivered`, it publishes a finance-ready event.
6. **Completion Profit Share**: When an order is completed, it publishes a profit-release event for wallet ledger accounting.
