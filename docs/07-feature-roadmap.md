# 07 - Feature Roadmap & Flows

## Core Flows

### 1. Order Checkout (future)

```mermaid
sequenceDiagram
    Client->>Actions: Submit Order Form (Zod valid)
    Actions->>Service: CreateOrder(orderPayload)
    Service->>InventoryService: Reserve stock
    InventoryService->>Repository: Check inventory availability
    Repository-->>InventoryService: Return Stock Level
    Service->>PricingService: Resolve sell price
    Service->>Repository: Create Order document
    Service->>BullMQ: Enqueue Payment Timeout Job
    Service-->>Actions: Return Created Order Details
```

### 2. Stock Adjustment (Phase 6)

```mermaid
sequenceDiagram
    Client->>Actions: adjustStockAction (Zod + Inventory.Adjust)
    Actions->>InventoryService: adjustStock
    InventoryService->>StockCalculationService: applyOperation
    InventoryService->>InventoryRepository: update (transaction)
    InventoryService->>HistoryRepository: create history row
    InventoryService-->>Actions: inventory + history
```

### 3. Pricing Update (Phase 6)

```mermaid
sequenceDiagram
    Client->>Actions: updatePricingAction (Zod + Pricing.Update)
    Actions->>PricingService: updatePricing
    PricingService->>ProfitCalculationService: derive metrics
    PricingService->>PricingRepository: update
    PricingService-->>Actions: ProductPricing
```

### 4. Courier Dispatcher (future)

- Real-time courier dispatch job runs via BullMQ.
- If courier dispatch API fails, BullMQ automatically schedules a retry with exponential backoff.

### 5. Merchant Digital Wallet Ledger (future)

- Credit/Debit transaction ledger entries are processed inside MongoDB multi-document transactions to guarantee database consistency.

### 6. Reseller Product Assignment (Phase 7)

```mermaid
sequenceDiagram
    Client->>Actions: assignProductAction (Zod + Reseller.Update)
    Actions->>ProductAssignmentService: assignProduct
    ProductAssignmentService->>ResellerRepository: verify reseller
    ProductAssignmentService->>PricingService: read recommended (optional)
    ProductAssignmentService->>ResellerProductRepository: create (never touches Product)
    ProductAssignmentService-->>Actions: ResellerProduct
```
