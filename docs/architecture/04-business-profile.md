# 04 - Business Profile Architecture

## Overview

Every reseller, wholesaler, and supplier owns a business profile. The business profile is a first-class entity separate from the user account, enabling one user to manage multiple businesses.

---

## Business Profile Structure

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `businessName` | String | Yes | Registered business name |
| `ownerName` | String | Yes | Legal owner name |
| `phone` | String | Yes | Primary contact number (BD format) |
| `email` | String | Yes | Business email address |
| `logo` | String | No | Business logo URL (ImageKit) |
| `banner` | String | No | Business banner URL (ImageKit) |
| `description` | String | No | Business description |
| `website` | String | No | Business website URL |
| `businessType` | Enum | Yes | sole_proprietorship / partnership / limited_company / individual |

### Bangladesh Address

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `division` | String | Yes | Division (e.g., Dhaka, Chittagong) |
| `district` | String | Yes | District |
| `upazila` | String | Yes | Upazila/Thana |
| `area` | String | No | Area/Locality |
| `postalCode` | String | No | Postal code |
| `fullAddress` | String | Yes | Full street address |
| `country` | String | Yes | Default: "Bangladesh" |

### Social Presence

| Field | Type | Description |
|-------|------|-------------|
| `facebook` | String | Facebook page URL |
| `instagram` | String | Instagram profile URL |
| `youtube` | String | YouTube channel URL |
| `whatsapp` | String | WhatsApp business number |
| `telegram` | String | Telegram username/group |

### Business Documents

| Document | Required For | Description |
|----------|-------------|-------------|
| `nidNumber` | Reseller, Wholesaler | National ID number |
| `nidVerified` | - | NID verification status |
| `tradeLicenseNumber` | Reseller, Wholesaler | Trade license number |
| `tradeLicenseVerified` | - | License verification status |
| `tinNumber` | Supplier | TIN/BIN number |
| `bankAccountName` | Supplier | Bank account holder name |
| `bankAccountNumber` | Supplier | Bank account number |
| `bankName` | Supplier | Bank name |
| `bankBranch` | Supplier | Bank branch |
| `bkashNumber` | Optional | bKash merchant number |
| `nagadNumber` | Optional | Nagad merchant number |

### Verification & Status

| Field | Type | Description |
|-------|------|-------------|
| `verificationStatus` | Enum | unverified / pending / verified / rejected |
| `verificationNotes` | String | Admin notes on verification |
| `verifiedAt` | Date | When verification completed |
| `verifiedBy` | ObjectId | Who verified |
| `status` | Enum | pending / active / suspended / blocked / archived |
| `statusReason` | String | Reason for current status |
| `suspendedAt` | Date | When suspended |

---

## Business Profile Relations

```
User (1) ──── (0..N) Business Profile (1) ──── (1) Reseller
                                               ──── (1) Wholesaler
                                               ──── (1) Supplier
```

A user can have multiple business profiles. Each business profile links to exactly one role entity (reseller, wholesaler, or supplier).

---

## Verification Workflow

```
Business Profile Created (pending)
    │
    ├── Auto Verification (if enabled)
    │       └── Status → verified
    │
    └── Manual Verification (if enabled)
            ├── Admin Reviews Documents
            ├── Admin Verifies or Rejects
            └── Status → verified | rejected
```

---

## Automation on Profile Changes

```
Business Profile Updated
│
├── Analytics Event
├── Audit Log Entry
├── Dashboard Refresh
├── Activity Timeline Update
└── Notification (if status changed)
```
