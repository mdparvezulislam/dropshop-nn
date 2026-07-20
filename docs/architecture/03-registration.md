# 03 - Registration Architecture

## Overview

The platform supports five registration flows. Each flow follows the same architectural pattern: Zod validation → Service orchestration → Repository persistence → Event publication → Automated follow-up actions.

---

## Registration Flows

### 1. Customer Registration

```
Flow: Guest → Registration Form → Email Verification → Customer
```

- Self-service registration
- Required: name, email, phone, password
- Optional: address, preferences
- Email verification required before first order
- Default role: `customer`
- Automation: welcome notification, analytics event, audit log

### 2. Reseller Registration

```
Flow: Guest → Reseller Application → Business Profile → Approval → Reseller
```

- Self-service application
- Required: business name, owner name, email, phone, password
- Required: business documents (NID, trade license)
- Requires admin approval (configurable: auto or manual)
- Default role: `reseller` (after approval)
- Automation: approval notification, business profile creation, analytics event, audit log

### 3. Wholesaler Registration

```
Flow: Guest → Wholesaler Application → Business Profile → Approval → Wholesaler
```

- Self-service application or admin invitation
- Required: business name, owner name, email, phone, business type
- Required: business documents, bank details
- MOQ negotiation available after approval
- Requires admin approval (configurable: auto or manual)
- Default role: `wholesaler` (after approval)
- Automation: approval notification, tier pricing setup, analytics event, audit log

### 4. Admin Invitation

```
Flow: Super Admin → Invite → Email → Form → Admin/Manager/Support
```

- Admin-initiated only
- Required: email, role selection
- System generates invitation token with expiry
- Invitee completes profile on first login
- Default role: as assigned by inviter
- Automation: invitation email, expiry reminder, audit log

### 5. Supplier Invitation

```
Flow: Admin → Invite Supplier → Email → Form → Approval → Supplier
```

- Admin-initiated or self-service
- Required: business name, contact info, documents, bank details
- Product catalog access granted after approval
- Default role: `supplier` (after approval)
- Automation: invitation email, onboarding checklist, analytics event, audit log

---

## Approval Configuration

All approval workflows are configurable in `src/shared/config/app-config.ts`:

| Setting | Options | Default |
|---------|---------|---------|
| resellerApproval | auto, manual | manual |
| wholesalerApproval | auto, manual | manual |
| supplierApproval | auto, manual | manual |
| businessVerification | auto, manual | manual |
| customerVerification | required, optional | required |

---

## Shared Registration Patterns

### Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, number
- Hashed with bcryptjs (10 salt rounds)

### Business Document Requirements
- NID (National ID) — Bangladesh format
- Trade License (if applicable)
- TIN/BIN Certificate (if applicable)
- Bank Account Details (if applicable)

### Verification Token
- Generated on registration
- Stored hashed in database
- 24-hour expiry
- Single-use

### Post-Registration Automation
```
User Created
│
├── Analytics Event: "user.registered"
├── Notification: Welcome message
├── Audit Log: User created
├── Business Profile (for reseller/wholesaler/supplier)
├── Dashboard Refresh
└── Activity Feed Update
```
