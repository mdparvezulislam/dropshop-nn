# 07 - Approval System

## Overview

The approval system controls how business profiles transition from pending to active. Each user type (reseller, wholesaler, supplier) has configurable approval rules.

## Approval Configuration

Settings in `@/shared/core/feature-flags`:

| Setting Key                        | Type    | Default | Description                           |
| ---------------------------------- | ------- | ------- | ------------------------------------- |
| `identity.auto-approve-reseller`   | boolean | false   | Auto-approve reseller registrations   |
| `identity.auto-approve-wholesaler` | boolean | false   | Auto-approve wholesaler registrations |
| `identity.auto-approve-supplier`   | boolean | false   | Auto-approve supplier registrations   |

## Approval Flows

### Manual Approval (Default)

```
Business Profile Submitted (status: pending, verificationStatus: pending)
  │
  ├── Admin Reviews Profile
  │     ├── Verifies Documents
  │     └── Checks Business Information
  │
  ├── Admin Approves
  │     ├── status → active
  │     ├── verificationStatus → verified
  │     ├── verifiedAt → now
  │     ├── verifiedBy → adminId
  │     ├── Publish BusinessApproved event
  │     └── Automation: Create Workspace, Wallet, etc.
  │
  └── Admin Rejects
        ├── verificationStatus → rejected
        ├── verificationNotes → reason
        ├── Publish BusinessRejected event
        └── Notification to applicant
```

### Auto Approval

```
Business Profile Submitted
  │
  ├── Auto-Approval Check
  │     ├── Is this user type set to auto-approve?
  │     ├── Yes → Automatically approve
  │     └── No  → Manual approval required
  │
  └── If Auto-Approved
        ├── Same flow as manual approval
        ├── verifiedBy → "system"
        └── Automation triggers immediately
```

## Approval Validation

Before any approval action, the service validates:

1. Business profile exists and is in pending/submitted state
2. Required documents are uploaded (if applicable)
3. Business information is complete
4. User account is active

## Rejection Reasons

| Reason                        | Description                          |
| ----------------------------- | ------------------------------------ |
| `incomplete_information`      | Missing required fields or documents |
| `invalid_documents`           | Documents failed verification        |
| `business_type_not_supported` | Business type not supported          |
| `duplicate_application`       | User already has an active profile   |
| `policy_violation`            | Violates platform policies           |
| `other`                       | Custom reason in verificationNotes   |

## Approval Hierarchy

| User Type  | Approver Role      | Auto-Approvable    |
| ---------- | ------------------ | ------------------ |
| Reseller   | Admin, Manager     | Yes                |
| Wholesaler | Admin, Manager     | Yes                |
| Supplier   | Admin              | Yes                |
| Staff      | Admin, Super Admin | No (always manual) |

## Events

- `identity.business_approved` — Published on approval
- `identity.business_rejected` — Published on rejection with reason
