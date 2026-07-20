# 04 - Profit Release Mechanics

## Business Rules
- Profits are released only when orders transition to `completed`.
- Configurable delay (default 7 days) defines a pending hold period before the balance transitions to available.
- Refunds create reverse ledger adjustments to subtract from the user's available balance.
