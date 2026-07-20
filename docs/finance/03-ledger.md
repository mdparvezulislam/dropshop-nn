# 03 - Ledger System

## Purpose
The ledger contains immutable, double-entry audit records. Balance calculations are dynamically derived from this collection.

## Entry Schema
- `walletId`: ObjectId/String
- `amount`: Number (cents, positive for inflow, negative for outflow)
- `type`: LedgerEntryType enum
- `status`: LedgerEntryStatus (pending, cleared, locked, cancelled)
- `clearsAt`: Date (holding clearances)
