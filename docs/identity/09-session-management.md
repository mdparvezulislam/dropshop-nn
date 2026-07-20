# 09 - Session Management

## Overview

Session management tracks all active user sessions, enables device history, and provides security controls like "logout other devices."

## Session Storage

Sessions are stored in the `UserSession` collection:

| Field          | Type    | Description               |
| -------------- | ------- | ------------------------- |
| `token`        | String  | JWT session token         |
| `userId`       | String  | Reference to User         |
| `expiresAt`    | Date    | Session expiry            |
| `ipAddress`    | String  | IP at login               |
| `userAgent`    | String  | Browser/device info       |
| `deviceName`   | String  | Derived device name       |
| `isActive`     | Boolean | Whether session is active |
| `lastActivity` | Date    | Last request timestamp    |

## Session Lifecycle

```
Login → Session Created (token issued)
  │
  ├── Active (user making requests)
  │     └── Last activity updated on each request
  │
  ├── Expired (TTL reached)
  │     └── Token invalidated, user must re-login
  │
  └── Revoked (manual logout or admin action)
        └── Token removed from active sessions
```

## Session TTLs

| Context     | TTL      | Remember Me TTL |
| ----------- | -------- | --------------- |
| Admin/Staff | 8 hours  | N/A             |
| Customer    | 24 hours | 30 days         |
| Reseller    | 24 hours | 30 days         |
| Supplier    | 24 hours | 30 days         |

## Active Sessions

Users can view their active sessions:

- Device name/type
- IP address
- Last activity timestamp
- Login timestamp

## Logout Other Devices

```
User Requests "Logout Other Devices"
  │
  ├── Revoke all sessions except current
  ├── Update revoked session records
  ├── Publish event
  └── Return success
```

## Session Management Actions

| Action               | Permission        | Description               |
| -------------------- | ----------------- | ------------------------- |
| List sessions        | Identity.Sessions | View own active sessions  |
| Revoke session       | Identity.Sessions | Revoke a specific session |
| Logout other devices | Self              | Revoke all other sessions |
| Force logout user    | Identity.Sessions | Admin force-logout a user |

## Future: MFA Ready

The session model is ready for MFA:

- `mfaVerified` field on session
- `mfaMethod` (totp, sms, email)
- MFA challenge token stored with session
- MFA-required flag on role configuration
