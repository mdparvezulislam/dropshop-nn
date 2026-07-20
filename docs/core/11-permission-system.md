# 11 - Permission System

## Overview

The permission system implements Role-Based Access Control (RBAC). Every engine uses the same permission model — permissions are defined as `Domain.Action` strings (e.g., `Product.Create`, `Inventory.Adjust`).

---

## Permission Structure

```typescript
interface PermissionDefinition {
  domain: string         // e.g., "Product", "Inventory", "Order"
  action: string         // e.g., "Create", "View", "Update"
  description: string    // Human-readable description
}
```

Permissions are combined as strings: `"Product.Create"`.

---

## Wildcard

The `"*"` permission grants access to everything. Used for Super Admin role.

---

## Role Definitions

Roles are defined in `src/shared/core/permissions.ts`:

| Role | Description | Permission Count |
|------|-------------|-----------------|
| Super Admin | Full system access | `*` (wildcard) |
| Admin | Full platform operational control | 28+ permissions |
| Manager | Operational control | 15+ permissions |
| Reseller | Private catalog access | 4+ permissions |
| Supplier | Own product & inventory | 5+ permissions |
| Customer | Basic buyer | 2 permissions |

---

## RBAC Architecture

```
Action/Request
    │
    ▼
AuthorizationService.hasPermission(role, requiredPermission)
    │
    ├── Role lookup (cached in Redis/In-Memory)
    ├── Check for wildcard "*"
    ├── Check for exact match
    └── Return boolean
```

---

## Permission Domains

| Domain | Actions |
|--------|---------|
| Product | Create, View, Update, Delete, Publish, Archive |
| Pricing | View, Update, Override |
| Inventory | View, Update, Adjust, Transfer |
| Order | Create, View, Update, Delete |
| Reseller | Create, View, Update, Suspend |
| Supplier | Create, View, Update, Suspend |
| User | Create, View, Update |
| Report | View, Export |
| Analytics | View |
| Settings | View, Update |
| Notification | View |

---

## Future Policy Engine

The RBAC foundation supports future extension to ABAC (Attribute-Based Access Control):

```typescript
interface PolicyRule {
  effect: "allow" | "deny"
  subject: string           // Role or user
  resource: string          // Domain + resource pattern
  action: string
  condition?: PolicyCondition  // Attribute-based conditions
}
```
