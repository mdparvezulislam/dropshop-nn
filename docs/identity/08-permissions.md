# 08 - Permissions

## RBAC Model

The platform uses Role-Based Access Control (RBAC). Permissions follow the `Domain.Action` naming convention.

## Identity-Specific Permissions

| Permission | Description |
|-----------|-------------|
| `Identity.View` | View user and profile details |
| `Identity.Update` | Update user profiles |
| `Identity.Create` | Create new users |
| `Identity.Delete` | Delete/archive users |
| `Identity.Approve` | Approve business profiles |
| `Identity.Reject` | Reject business profiles |
| `Identity.Suspend` | Suspend users or businesses |
| `Identity.Roles` | Manage roles and permissions |
| `Identity.Sessions` | View and manage sessions |

## Permission Matrix

| Permission | Super Admin | Admin | Manager | Support |
|-----------|:-----------:|:-----:|:-------:|:-------:|
| Identity.View | * | ✓ | ✓ | ✓ |
| Identity.Update | * | ✓ | ✓ | - |
| Identity.Create | * | ✓ | - | - |
| Identity.Delete | * | ✓ | - | - |
| Identity.Approve | * | ✓ | ✓ | - |
| Identity.Reject | * | ✓ | ✓ | - |
| Identity.Suspend | * | ✓ | ✓ | - |
| Identity.Roles | * | ✓ | - | - |
| Identity.Sessions | * | ✓ | - | - |

## Resource-Based Permissions

Resources that identity permissions apply to:

| Resource | Description |
|----------|-------------|
| `user` | User accounts (all types) |
| `business_profile` | Business profiles |
| `store_profile` | Store profiles |
| `workspace` | Business workspaces |
| `session` | User sessions |
| `role` | Role definitions |
| `permission` | Permission assignments |

## Permission Check Pattern

```typescript
const allowed = await authorizationService.hasPermission(userRole, "Identity.Approve")
if (!allowed) throw new ForbiddenError("Missing permission: Identity.Approve")
```

## Future: Policy Engine

A full policy engine can be layered on top of RBAC:
- Attribute-based conditions (time, location, resource state)
- Dynamic permission evaluation
- Policy inheritance chains
- Deny-override semantics
