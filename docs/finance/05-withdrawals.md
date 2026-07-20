# 05 - Withdrawal Workflow

## State Transitions
1. **Pending**: Withdrawal request is created. Ledger locks the amount.
2. **Under Review**: Administrator reviews the payout request.
3. **Approved**: Approved for transfer.
4. **Paid/Completed**: Payout reference transaction added, ledger status transitions to cleared.
5. **Rejected/Cancelled**: Ledger entry is cancelled, returning locked funds to Available.
