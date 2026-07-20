# 05 - Business Profile

## Overview

Every reseller, wholesaler, and supplier owns a business profile. The business profile is a first-class entity separate from the user account, enabling one user to manage multiple businesses in the future.

## Fields

### Core Information

| Field            | Type   | Required | Description                                                   |
| ---------------- | ------ | -------- | ------------------------------------------------------------- |
| `businessName`   | String | Yes      | Registered business name                                      |
| `ownerName`      | String | Yes      | Legal owner name                                              |
| `primaryPhone`   | String | Yes      | Primary contact (BD format)                                   |
| `secondaryPhone` | String | No       | Secondary contact                                             |
| `email`          | String | Yes      | Business email                                                |
| `businessType`   | Enum   | Yes      | sole_proprietorship, partnership, limited_company, individual |
| `description`    | String | No       | Business description                                          |
| `logo`           | String | No       | Logo URL (ImageKit)                                           |
| `banner`         | String | No       | Banner URL (ImageKit)                                         |

### Address

| Field         | Required | Description                        |
| ------------- | -------- | ---------------------------------- |
| `division`    | Yes      | Division (e.g., Dhaka, Chittagong) |
| `district`    | Yes      | District                           |
| `upazila`     | Yes      | Upazila/Thana                      |
| `area`        | No       | Area/Locality                      |
| `postalCode`  | No       | Postal code                        |
| `fullAddress` | Yes      | Full street address                |

### Social Links

| Field          | Description              |
| -------------- | ------------------------ |
| `website`      | Business website URL     |
| `facebookPage` | Facebook page URL        |
| `instagram`    | Instagram profile URL    |
| `youtube`      | YouTube channel URL      |
| `whatsapp`     | WhatsApp business number |
| `telegram`     | Telegram username/group  |

### Documents

| Field                | Type   | Description              |
| -------------------- | ------ | ------------------------ |
| `nidNumber`          | String | National ID number       |
| `tradeLicenseNumber` | String | Trade license number     |
| `tinNumber`          | String | TIN/BIN number           |
| `bankAccountName`    | String | Bank account holder name |
| `bankAccountNumber`  | String | Bank account number      |
| `bankName`           | String | Bank name                |
| `bankBranch`         | String | Bank branch              |

### Verification

| Field                | Type   | Default    | Description                             |
| -------------------- | ------ | ---------- | --------------------------------------- |
| `verificationStatus` | Enum   | unverified | unverified, pending, verified, rejected |
| `verificationNotes`  | String | null       | Admin notes                             |
| `verifiedAt`         | Date   | null       | Verification timestamp                  |
| `verifiedBy`         | String | null       | Admin user ID who verified              |

### Status

| Field          | Type   | Default | Description                                   |
| -------------- | ------ | ------- | --------------------------------------------- |
| `status`       | Enum   | pending | pending, active, suspended, blocked, archived |
| `statusReason` | String | null    | Reason for current status                     |
| `suspendedAt`  | Date   | null    | Suspension timestamp                          |

## Status Lifecycle

```
Created (pending)
  │
  ├── Auto-Approval Enabled
  │     └── status → active, verificationStatus → verified
  │
  └── Manual Approval
        ├── Admin Approves → status: active, verificationStatus: verified
        ├── Admin Rejects  → verificationStatus: rejected
        └── Pending Review → verificationStatus: pending
```

## Events

All profile mutations publish events:

- `identity.business_profile_created`
- `identity.business_submitted`
- `identity.business_approved`
- `identity.business_rejected`
- `identity.profile_updated`
