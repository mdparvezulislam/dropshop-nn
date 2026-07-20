# 14 - Workspace

## Overview

The Business Workspace is automatically created after a business profile is approved. It provides the reseller, wholesaler, or supplier with everything needed to operate on the platform.

## Workspace Components

```
Business Workspace
  │
  ├── Business Profile (core information)
  ├── Store Profile (public-facing store)
  ├── Wallet (future: balance, transactions)
  ├── Settings (preferences, config)
  ├── Notification Preferences
  ├── Analytics Profile
  ├── Dashboard (role-specific)
  └── Audit Trail
```

## Automation Flow

```
Business Approved
  │
  ├── 1. Create Workspace Record
  │     ├── Link to Business Profile
  │     ├── Link to User
  │     ├── Set Workspace Status → active
  │     └── Set Created Timestamp
  │
  ├── 2. Initialize Wallet (stub)
  │     ├── Create Zero-Balance Wallet
  │     └── Link to Workspace
  │
  ├── 3. Create Default Settings
  │     ├── Load Setting Definitions
  │     ├── Apply Default Values
  │     └── Save to Workspace Settings
  │
  ├── 4. Create Notification Preferences
  │     ├── Enable All Channels (default)
  │     └── Save Preferences
  │
  ├── 5. Create Analytics Profile
  │     ├── Initialize Event Tracking
  │     └── Link to Workspace
  │
  ├── 6. Create Audit Record
  │     └── Log "workspace.created"
  │
  └── 7. Send Welcome Notification
        ├── In-App Notification
        ├── Email Notification
        └── SMS (if enabled)
```

## Workspace Entity

| Field | Type | Description |
|-------|------|-------------|
| `businessProfileId` | String | Linked business profile |
| `userId` | String | Owning user |
| `walletId` | String (nullable) | Future: wallet reference |
| `settings` | Object | Workspace settings |
| `notificationPreferences` | Object | Notification channel prefs |
| `analyticsProfileId` | String (nullable) | Analytics tracking profile |
| `status` | Enum | active, suspended, archived |

## Workspace Status

| Status | Description |
|--------|-------------|
| `active` | Workspace fully operational |
| `suspended` | Workspace disabled (business suspended) |
| `archived` | Workspace closed (business archived) |

## Future Workspace Extensions

- Multi-user workspace access
- Sub-accounts with roles
- API keys and webhooks
- Custom domain for store
- Workspace-specific analytics
