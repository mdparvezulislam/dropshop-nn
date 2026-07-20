# 01 - Identity Engine Overview

## Purpose

The Identity Engine is the complete business identity system for DropshopNN. It manages every identity concern across the platform — authentication, registration, business profiles, store profiles, approval workflows, verification, RBAC, session management, and workspace creation.

## Scope

This engine covers:

- **Authentication**: Email+Password, Phone+Password, Remember Me, Forgot Password, Reset Password, Email/Phone Verification
- **Registration**: Customer, Reseller, Wholesaler, Supplier (invitation), Admin (invitation)
- **Business Profiles**: Reseller, Wholesaler, Supplier business information
- **Store Profiles**: Reseller store fronts with themes and social links
- **Approval System**: Configurable auto/manual approval per user type
- **Verification**: Pending → Verified → Rejected → Suspended lifecycle
- **Business Workspace**: Auto-created on approval with wallet stub, settings, preferences
- **RBAC**: Role-based access control with resource-action permissions
- **Session Management**: Active sessions, device history, logout other devices

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Identity Engine                           │
├──────────────────────────────────────────────────────────────────┤
│  Actions Layer                                                   │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Registration │ Business     │ Verification │ Session        │ │
│  │ Actions      │ Profile      │ Actions      │ Actions        │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘ │
│         │              │              │               │          │
├─────────┴──────────────┴──────────────┴───────────────┴──────────┤
│  Services Layer                                                  │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Identity     │ Business     │ Approval     │ Workspace      │ │
│  │ Service      │ Profile      │ Service      │ Service        │ │
│  │              │ Service      │              │                │ │
│  ├──────────────┼──────────────┼──────────────┼────────────────┤ │
│  │ Verification │ Session     │              │                │ │
│  │ Service      │ Service      │              │                │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘ │
│         │              │              │               │          │
├─────────┴──────────────┴──────────────┴───────────────┴──────────┤
│  Repository Layer                                                │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Business     │ Store        │ Business     │                │ │
│  │ Profile Repo │ Profile Repo │ Workspace    │                │ │
│  │              │              │ Repo         │                │ │
│  └──────────────┴──────────────┴──────────────┴────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  Domain Layer                                                    │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Business     │ Store        │ Business     │ Identity       │ │
│  │ Profile      │ Profile      │ Workspace    │ Events         │ │
│  │ Entity       │ Entity       │ Entity       │                │ │
│  └──────────────┴──────────────┴──────────────┴────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Dependencies

| Dependency | Purpose |
|-----------|---------|
| `auth` feature | User, Role, Permission entities and repositories |
| `@/shared/lib/event-bus` | Event publishing for identity events |
| `@/shared/core/base-service` | Service lifecycle hooks |
| `@/shared/core/permissions` | Permission definitions |
| `@/shared/core/feature-flags` | Feature flag checks |
| `@/shared/utils` | Logger, hashing, validation utilities |
| `@/shared/errors` | Error hierarchy |

## Automation Triggers

```
Business Approved
  → Create Workspace
  → Create Wallet (stub)
  → Create Default Settings
  → Create Notification Preferences
  → Create Analytics Profile
  → Create Audit Record
  → Send Welcome Notification
```
