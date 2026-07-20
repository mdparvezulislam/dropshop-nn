# 11 - Dashboard

## Overview

Each user type has a dedicated dashboard showing only relevant identity information. Dashboards are role-aware and scoped to the user's permissions.

## Admin Dashboard (Identity Section)

| Widget               | Data Source               | Description                        |
| -------------------- | ------------------------- | ---------------------------------- |
| Users Overview       | UserRepository            | Total users by role                |
| Pending Approvals    | BusinessProfileRepository | Count of pending business profiles |
| Recent Registrations | Identity Events           | New users in last 24 hours         |
| Verification Queue   | BusinessProfileRepository | Unverified business profiles       |
| Session Overview     | Session Service           | Active sessions count              |

## Reseller Dashboard (Identity Section)

| Widget             | Data Source       | Description                       |
| ------------------ | ----------------- | --------------------------------- |
| Business Status    | BusinessProfile   | Current verification/status       |
| Store Status       | StoreProfile      | Store profile completion          |
| Workspace Stats    | Workspace Service | Wallet balance (future), settings |
| Profile Completion | Form Progress     | % of profile fields filled        |

## Wholesaler Dashboard (Identity Section)

| Widget             | Data Source     | Description                     |
| ------------------ | --------------- | ------------------------------- |
| Business Status    | BusinessProfile | Current verification/status     |
| Profile Completion | Form Progress   | % of profile fields filled      |
| Document Status    | Documents       | Uploaded/verified document list |

## Supplier Dashboard (Identity Section)

| Widget              | Data Source     | Description                     |
| ------------------- | --------------- | ------------------------------- |
| Business Status     | BusinessProfile | Current verification/status     |
| Document Status     | Documents       | Uploaded/verified document list |
| Bank Details Status | Banking Info    | Bank account setup status       |

## Customer Dashboard (Identity Section)

| Widget         | Data Source           | Description                     |
| -------------- | --------------------- | ------------------------------- |
| Profile Status | User                  | Account status, verified badges |
| Security       | Sessions              | Active sessions, last login     |
| Preferences    | Notification Settings | Communication preferences       |

## Dashboard Data Flow

```
Page Load
  │
  ├── auth() → Get Current User & Role
  ├── DashboardService.getIdentityData(role, userId)
  │     ├── UserRepository.findUser()
  │     ├── BusinessProfileRepository.findByUserId()
  │     ├── StoreProfileRepository.findByBusinessProfileId()
  │     ├── SessionService.getActiveSessions()
  │     └── Aggregate Dashboard Metrics
  │
  └── Render Role-Appropriate Widgets
```

## Widget Loading Strategy

- Server-side render dashboard data
- Use React Server Components for initial data
- Client components for interactive widgets (session management, profile editing)
- Cache dashboard aggregates in Redis (30s TTL)
