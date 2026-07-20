# 04 - Registration

## Registration Flows

### Customer Registration

```
Flow: Guest → Registration Form → Email Verification → Customer
```

**Fields**: Full Name, Email, Phone, Password
**Verification**: Email verification required before first order
**Default Role**: `customer`
**Automation**: Publish `UserRegistered` event → analytics, audit, welcome notification

### Reseller Registration

```
Flow: Guest → Application Form → Business Profile → Submit for Approval
  → [Auto/Manual Approval]
  → Workspace Created → Active Reseller
```

**Fields**: Business Name, Owner Name, Phone, Email, Password, Business Type, Address (Division, District, Upazila, Area, Postal Code)
**Documents**: NID Number (optional at registration)
**Approval**: Configurable auto or manual
**Default Role**: `reseller` (after approval)
**Automation**: Business profile created → submitted → approved → workspace created → wallet stub → welcome notification

### Wholesaler Registration

```
Flow: Guest → Application Form → Business Profile → Submit for Approval
  → [Auto/Manual Approval]
  → Workspace Created → Active Wholesaler
```

**Fields**: Same as reseller + Business Type, Trade License
**Documents**: NID, Trade License (optional at registration)
**Approval**: Configurable auto or manual
**Default Role**: `wholesaler` (after approval)
**Automation**: Same as reseller

### Supplier Invitation

```
Flow: Admin → Invite Supplier → Email → Accept Invitation
  → Complete Profile → Submit for Approval → Active Supplier
```

**Initiated By**: Admin or Super Admin
**Fields**: Business Name, Contact Info, Documents, Bank Details
**Default Role**: `supplier` (after approval)
**Automation**: Invitation email → profile complete → approval → workspace

### Admin Invitation

```
Flow: Super Admin → Invite → Email → Accept → Profile Complete → Active
```

**Initiated By**: Super Admin
**Roles Available**: Support Staff, Manager, Admin
**Fields**: Full Name, Phone, Password
**Automation**: Invitation email → onboarding

## Shared Registration Logic

### Password Rules

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Hashed with bcrypt (10 salt rounds)

### Unique Constraints

- Email must be unique across platform
- Phone must be unique across platform
- Username must be unique (if applicable)

### Verification Token

- Generated on registration
- Stored hashed in database
- 24-hour expiry
- Single use

### Duplicate Detection

All registration flows check for existing email/phone before creating:

```typescript
const [existingEmail, existingPhone] = await Promise.all([
  userRepo.findByEmail(email),
  userRepo.findByPhone(phone),
]);
if (existingEmail || existingPhone) throw ValidationError;
```
