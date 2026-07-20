# 10 - Identity Events

## Event Types

| Event                               | Payload                                   | Trigger                         |
| ----------------------------------- | ----------------------------------------- | ------------------------------- |
| `identity.user_registered`          | userId, email, role, timestamp            | User completes registration     |
| `identity.business_profile_created` | businessProfileId, businessName, userType | Business profile created        |
| `identity.business_submitted`       | businessProfileId, userType               | Business submitted for approval |
| `identity.business_approved`        | businessProfileId, userType, approvedBy   | Admin approves business         |
| `identity.business_rejected`        | businessProfileId, userType, reason       | Admin rejects business          |
| `identity.role_assigned`            | userId, newRole, assignedBy               | Role changed by admin           |
| `identity.profile_updated`          | userId, changedFields                     | User updates profile            |
| `identity.password_changed`         | userId                                    | Password changed                |
| `identity.login_success`            | userId, role, ip, userAgent               | Successful login                |
| `identity.logout`                   | userId, sessionId                         | User logs out                   |
| `identity.email_verified`           | userId, email                             | Email address verified          |
| `identity.phone_verified`           | userId, phone                             | Phone number verified           |
| `identity.store_created`            | storeProfileId, storeName                 | Store profile created           |
| `identity.store_updated`            | storeProfileId, changedFields             | Store profile updated           |
| `identity.workspace_created`        | workspaceId, businessProfileId            | Workspace auto-created          |

## Event Payloads

### BusinessApproved Payload

```typescript
{
  businessProfileId: string,
  userId: string,
  businessName: string,
  userType: "reseller" | "wholesaler" | "supplier",
  approvedBy: string,
  approvedAt: string,  // ISO timestamp
}
```

### UserRegistered Payload

```typescript
{
  userId: string,
  email: string,
  role: string,
  userType: "customer" | "reseller" | "wholesaler" | "supplier",
  registeredAt: string,
}
```

## Subscribers

| Event                        | Subscribers                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `identity.user_registered`   | Analytics Engine, Audit Engine, Notification Engine             |
| `identity.business_approved` | Workspace Service, Wallet Service (future), Notification Engine |
| `identity.business_rejected` | Notification Engine, Audit Engine                               |
| `identity.login_success`     | Analytics Engine, Audit Engine                                  |
| `identity.password_changed`  | Audit Engine, Session Service                                   |
| `identity.profile_updated`   | Audit Engine                                                    |

## Event Publication Pattern

```typescript
await EventBus.publish(
  "identity.business_approved",
  {
    businessProfileId: profile.id,
    userId: profile.userId,
    businessName: profile.businessName,
    userType: "reseller",
    approvedBy: actor.id,
    approvedAt: new Date().toISOString(),
  },
  {
    actor: { id: actor.id, name: actor.name, role: actor.role },
    source: "identity-approval-service",
  },
);
```
