# 07 - Invoicing Engine

## Mechanism
Invoices are automatically generated when orders transition to `completed`. They store customer snapshots, line items, and VAT/discount totals.
Invoices support PDF exports and are linked directly to order entities.
