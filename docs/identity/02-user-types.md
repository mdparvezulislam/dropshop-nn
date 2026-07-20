# 02 - User Types

## Supported User Types

| Type          | Code          | Registration | Profile  | Requires Approval  |
| ------------- | ------------- | ------------ | -------- | ------------------ |
| Guest         | `guest`       | None         | None     | No                 |
| Customer      | `customer`    | Self-service | Personal | No                 |
| Reseller      | `reseller`    | Self-service | Business | Yes (configurable) |
| Wholesaler    | `wholesaler`  | Self-service | Business | Yes (configurable) |
| Supplier      | `supplier`    | Invitation   | Business | Yes                |
| Support Staff | `support`     | Invitation   | Staff    | No                 |
| Manager       | `manager`     | Invitation   | Staff    | No                 |
| Admin         | `admin`       | Invitation   | Staff    | No                 |
| Super Admin   | `super_admin` | Seeded       | Staff    | No                 |

## Role Hierarchy

```
Super Admin
  └── Admin
        ├── Manager
        │     ├── Support Staff
        │     └── Accountant (future)
        ├── Supplier
        ├── Reseller
        ├── Wholesaler
        └── Customer
              └── Guest
```

## User Type Lifecycle

### Guest → Registered

```
Guest → Registration → Email/Phone Verification → Active User
```

### Reseller / Wholesaler

```
Guest → Application → Business Profile Created → Submitted for Approval
  → [Auto or Manual Approval]
  → Verified → Workspace Created → Active
```

### Supplier (Invited)

```
Admin → Invite → Supplier Accepts → Business Profile → Verified → Active
```

### Staff (Invited)

```
Admin → Invite → User Accepts → Profile Complete → Active
```

## Identity Entity Relationships

```
User (1) ──── (0..1) Business Profile
User (1) ──── (0..1) Store Profile
User (1) ──── (0..1) Business Workspace
User (1) ──── (0..N) Sessions

Business Profile (1) ──── (0..1) Store Profile
Business Profile (1) ──── (0..1) Business Workspace
```

## Future Extensibility

New user types can be added without code changes:

1. Add a `Role` document in the database
2. Assign a permission set
3. Configure approval behavior in settings
