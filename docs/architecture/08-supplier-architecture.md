# 08 - Supplier Architecture

## Overview

Suppliers provide products to the platform. Products belong to the platform catalog; suppliers own supply information. One product may have multiple suppliers, enabling future supplier comparison and best-price selection.

---

## Supplier Model

### Core Profile

| Field           | Type   | Description               |
| --------------- | ------ | ------------------------- |
| `code`          | String | Auto-generated SUP-XXXX   |
| `businessName`  | String | Registered business name  |
| `ownerName`     | String | Legal owner name          |
| `contactPerson` | String | Day-to-day contact        |
| `email`         | String | Business email            |
| `phone`         | String | Primary phone (BD format) |
| `logo`          | String | Logo URL                  |
| `coverImage`    | String | Banner URL                |

### Address (Bangladesh)

Division → District → Upazila → Area → Postal Code → Full Address

### Business Details

| Field                                         | Description                                           |
| --------------------------------------------- | ----------------------------------------------------- |
| `businessType`                                | Sole proprietorship / Partnership / Limited company   |
| `nidNumber` / `nidVerified`                   | NID verification                                      |
| `tradeLicenseNumber` / `tradeLicenseVerified` | Trade license                                         |
| `tinNumber`                                   | Tax identification                                    |
| `bankDetails`                                 | Embedded: account name, number, bank, branch, routing |

### Payment Settlement

| Field              | Description                          |
| ------------------ | ------------------------------------ |
| `settlementTerms`  | Net 7 / Net 15 / Net 30 / Net 60     |
| `settlementMethod` | Bank Transfer / bKash / Nagad / Cash |
| `minimumPayout`    | Minimum amount for payout            |
| `commissionRate`   | Platform commission %                |
| `commissionType`   | percentage / fixed_per_order         |

### Supply Configuration

| Field                | Description                             |
| -------------------- | --------------------------------------- |
| `leadTimeDays`       | Default lead time                       |
| `minimumOrderAmount` | Minimum order value                     |
| `shippingCost`       | Default shipping cost                   |
| `freeShippingAbove`  | Free shipping threshold                 |
| `returnPolicy`       | Return window (days)                    |
| `status`             | pending / active / suspended / inactive |

---

## Supplier Product Mapping

```
Supplier (1) ──── (M) SupplierInventory (M) ──── (1) Product
```

Each `SupplierInventory` record maps:

- Supplier's SKU → Platform Product
- Supplier's cost → Platform cost reference
- Supplier's stock → Platform incoming inventory
- Supplier's lead time → Order routing decision

### Supplier Comparison (Future)

```
Product
    │
    ├── Supplier A → cost: 500, leadTime: 3d, stock: 100
    ├── Supplier B → cost: 450, leadTime: 5d, stock: 200
    ├── Supplier C → cost: 520, leadTime: 2d, stock: 50
    │
    ▼
Best Supplier Selection Algorithm
    ├── Lowest cost
    ├── Fastest delivery
    ├── Highest stock
    └── Preferred supplier (manual)
```

---

## Supplier Portal (Future)

Suppliers will have a dedicated portal to:

- View their product listings
- Update stock levels
- Update pricing
- View order history
- Track payments
- Upload product media
- Communicate with platform admins

---

## Supplier Onboarding Flow

```
Admin Invites / Supplier Self-Registers
    │
    ▼
Business Profile Creation
    │
    ▼
Document Upload (NID, License, Bank)
    │
    ▼
Verification (Auto or Manual)
    │
    ▼
Onboarding Checklist
    ├── Add Products
    ├── Set Pricing
    ├── Configure Shipping
    └── Complete Profile
    │
    ▼
Supplier Active
```

---

## Automation

```
Supplier Created / Updated
│
├── Analytics Event
├── Audit Log Entry
├── Dashboard Refresh
├── Activity Timeline Update
└── Notification to Assigned Manager
```
