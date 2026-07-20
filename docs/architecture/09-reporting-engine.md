# 09 - Reporting Engine Architecture

## Overview

The Reporting Engine provides centralized, automated report generation. Every report derives from live business data. Reports are generated on-demand or on a schedule.

---

## Report Types

### Sales Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Daily Sales Summary | Total sales, orders, items sold | Daily |
| Weekly Sales Report | Week-over-week comparison | Weekly |
| Monthly Sales Report | Month-over-month trends | Monthly |
| Sales by Product | Top/bottom performing products | On-demand |
| Sales by Category | Category performance | On-demand |
| Sales by Region | Geographic distribution | On-demand |
| Sales by Channel | Platform vs reseller vs wholesale | On-demand |

### Profit Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Profit & Loss | Revenue, costs, margins | Monthly |
| Product Profitability | Per-product profit analysis | On-demand |
| Reseller Profitability | Per-reseller profit analysis | On-demand |
| Category Profitability | Per-category margin analysis | On-demand |

### Inventory Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Stock Status | Current stock levels | Daily |
| Low Stock Alert | Items below threshold | Real-time |
| Inventory Valuation | Total inventory value | On-demand |
| Stock Movement | In/out/adjustment history | On-demand |
| Dead Stock | Items with no movement | Weekly |

### Supplier Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Supplier Performance | Lead time, fill rate, quality | Monthly |
| Supplier Cost Analysis | Cost trends by supplier | On-demand |
| Supplier Order History | Orders placed by supplier | On-demand |
| Settlement Report | Pending/completed payments | Weekly |

### Reseller Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Reseller Performance | Sales, profit, order count | Monthly |
| Top Resellers | Ranked by volume/revenue | On-demand |
| Reseller Product Report | Per-reseller product performance | On-demand |

### Financial Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Revenue Summary | All revenue sources | Daily |
| Expense Report | Platform expenses | Monthly |
| Tax Report | Tax collected/paid | Monthly |
| Commission Report | Commissions earned/paid | Monthly |
| Payout Report | Supplier/reseller payouts | Weekly |

### Business Reports
| Report | Description | Frequency |
|--------|-------------|-----------|
| Growth Report | Month-over-month growth metrics | Monthly |
| Platform Analytics | Users, products, orders growth | Weekly |
| Operations Report | Order fulfillment, returns, issues | Weekly |

---

## Report Generation Architecture

```
Report Request (Scheduled / On-Demand)
    │
    ▼
ReportService.generate(reportType, params)
    │
    ├── Load Data Sources
    │   ├── OrderService.getFilteredOrders(params)
    │   ├── PricingService.getPricingData(params)
    │   ├── InventoryService.getInventoryData(params)
    │   ├── ResellerService.getResellerData(params)
    │   └── SupplierService.getSupplierData(params)
    │
    ├── Transform & Aggregate
    │   └── ReportTransformer.transform(rawData, reportType)
    │
    ├── Format Output
    │   ├── JSON (API response)
    │   ├── CSV (export)
    │   └── PDF (scheduled / print)
    │
    └── Store Results
        ├── Cache (for repeated views)
        └── ReportHistory (for audit)
```

---

## Report Engine Components

### ReportService
- `generate(reportType, params)` — Orchestrates report generation
- `schedule(reportType, cronExpression, params)` — Schedule automated reports
- `getHistory(reportType)` — View previously generated reports
- `export(reportId, format)` — Export in CSV/PDF/JSON

### ReportTransformer
- Transforms raw data into report format
- Applies aggregations, calculations, groupings
- Handles currency conversion, date formatting

### ReportScheduler (BullMQ)
- Manages cron-based report generation
- Handles queue backpressure for large reports
- Retries on failure with exponential backoff
- Notifies on completion

### ReportCache (Redis)
- Caches frequently viewed reports
- Invalidates on relevant data changes
- Configurable TTL per report type

---

## Report Permissions

| Report Type | Admin | Manager | Accountant | Support |
|------------|:-----:|:-------:|:----------:|:-------:|
| Sales Reports | ✓ | ✓ | ✓ | - |
| Profit Reports | ✓ | ✓ | ✓ | - |
| Inventory Reports | ✓ | ✓ | ✓ | ✓ |
| Supplier Reports | ✓ | ✓ | - | - |
| Reseller Reports | ✓ | ✓ | - | - |
| Financial Reports | ✓ | - | ✓ | - |
| Business Reports | ✓ | ✓ | - | - |
