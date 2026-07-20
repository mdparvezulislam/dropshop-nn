# 14 - Finance API Boundaries

## Entrypoints
- `WalletService.createWallet(workspaceId, role)`
- `WalletService.getBalances(walletId)`
- `FinanceService.releaseProfit(order)`
- `FinanceService.reverseProfit(order)`
- `WithdrawalService.requestWithdrawal(...)`
- `WithdrawalService.payWithdrawal(...)`
- `InvoiceService.generateInvoice(order)`
