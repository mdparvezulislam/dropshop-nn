# 15 - Dashboard Philosophy

## Overview

Dashboards are the primary interface for every platform role. Every dashboard displays live, actionable business information derived from real-time data — not static snapshots.

---

## Core Principles

### 1. Live by Default
All dashboard widgets pull from live data via the Analytics Engine. Cached data is acceptable only when clearly labeled and within a configurable freshness window.

### 2. Actionable, Not Informational
Every widget should lead to an action. If a metric cannot drive a decision or action, it does not belong on the dashboard.

### 3. Role-Appropriate
Each role sees a dashboard tailored to their responsibilities:

| Role | Focus |
|------|-------|
| Super Admin | System health, growth, revenue, anomalies |
| Admin | Revenue, orders, operational KPIs |
| Manager | Team performance, task queues, alerts |
| Support | Open orders, customer issues, escalation queue |
| Reseller | Personal sales, profit, product catalog |
| Wholesaler | Bulk orders, tier pricing, MOQ status |
| Supplier | Product listings, orders, stock, payouts |
| Customer | Personal orders, favorites, account |

### 4. Consistent Layout Language
Every dashboard follows the same visual language:
- **Header**: Role-aware greeting, date, notifications
- **Stat Bar**: 4-6 key metrics (KPI cards)
- **Main Area**: Charts, tables, activity feeds
- **Sidebar (desktop)**: Quick actions, recent activity

### 5. Progressive Disclosure
- Summary first, details on demand
- Click-through from any widget to the full data view
- Tooltips for metric definitions
- Expand/collapse for complex data sets

---

## Dashboard Widgets

### KPI Cards
- Large, single-value metrics with trend indicators
- Value + delta (vs previous period) + sparkline
- Click navigates to detailed view

### Charts
| Chart Type | Use Case |
|-----------|----------|
| Line Chart | Trends over time (revenue, orders) |
| Bar Chart | Comparisons (top products, categories) |
| Pie/Donut | Distribution (order status, traffic source) |
| Area Chart | Cumulative metrics (total revenue YTD) |

### Data Tables
- Sortable, filterable, paginated
- Inline actions (edit, view, delete)
- Bulk selection for mass operations
- Export to CSV

### Activity Feed
- Chronological list of recent actions
- Actor, action, timestamp, entity link
- Filterable by type and severity

### Alert Cards
- High-priority items requiring attention
- Color-coded by severity (red/yellow/blue)
- Dismissible with action button

---

## Specific Dashboards

### Admin Dashboard
```
┌─────────────────────────────────────────────┐
│  Revenue (Today) │ Orders │ Users │ Products │
│  BDT 342,000 ▲8% │ 156 ▲3% │ 12.5K │ 3.2K   │
├─────────────────────────────────────────────┤
│  Revenue Trend (30 days)              [Line] │
├─────────────────────────────────────────────┤
│  Top Products          │  Recent Orders      │
│  ┌────────────────┐    │  ┌───────────────┐  │
│  │ Product A - 45K │    │  Order #1234   │  │
│  │ Product B - 38K │    │  Order #1233   │  │
│  └────────────────┘    │  └───────────────┘  │
├─────────────────────────────────────────────┤
│  Activity Feed                               │
│  • Admin published 5 products                │
│  • New supplier registered                   │
│  • Stock alert: 12 products low              │
└─────────────────────────────────────────────┘
```

### Reseller Dashboard
```
┌─────────────────────────────────────────────┐
│  Sales (Month) │ Orders │ Profit │ Products  │
│  BDT 120,000   │ 45     │ 24,000 │ 156      │
├─────────────────────────────────────────────┤
│  Top Selling Products               [Table] │
├─────────────────────────────────────────────┤
│  Assigned Products      │  Quick Actions    │
│  • Active: 120          │  [+ Add Product]  │
│  • Draft: 20            │  [Update Pricing] │
│  • Hidden: 16           │  [View Catalog]   │
└─────────────────────────────────────────────┘
```

### Supplier Dashboard
```
┌─────────────────────────────────────────────┐
│  Listed Products │ Orders │ Pending │ Payout │
│  340             │ 23     │ 5       │ 45,000 │
├─────────────────────────────────────────────┤
│  Recent Orders                      [Table] │
├─────────────────────────────────────────────┤
│  Stock to Update   │  Quick Actions         │
│  • 12 products low │  [+ Add Product]       │
│  • 5 out of stock  │  [Update Stock]        │
└─────────────────────────────────────────────┘
```

---

## Dashboard Performance

- Widgets lazy load independently
- Data fetched via server components where possible
- Client-side caching with SWR pattern for real-time data
- Metrics with >10K data points are aggregated server-side
- Dashboard page load target: <500ms Time to Interactive

---

## Implementation Pattern

```typescript
// Server Component (default)
async function AdminDashboardPage() {
  const metrics = await AnalyticsService.getDashboardMetrics('admin')
  return <AdminDashboardWidgets metrics={metrics} />
}

// Client Component (for interactivity)
'use client'
function DashboardWidget({ metric }: { metric: Metric }) {
  // SWR-based polling for live updates
  // Click handlers for navigation
  // Responsive container for layout
}
```
