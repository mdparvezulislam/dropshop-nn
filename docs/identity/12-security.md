# 12 - Security

## Password Security

| Measure | Implementation |
|---------|---------------|
| Hashing | bcryptjs, 10 salt rounds |
| Minimum Length | 8 characters |
| Complexity | Uppercase, lowercase, number required |
| History | Prevent reuse of last 5 passwords (future) |
| Max Age | Force password change every 90 days (configurable) |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login attempts | 5 attempts | 15 minutes per IP |
| Registration | 3 attempts | 1 hour per IP |
| Password reset | 3 attempts | 1 hour per email |
| Verification resend | 5 attempts | 24 hours per user |
| OTP requests | 3 attempts | 10 minutes per phone |

## Account Lock

| Trigger | Action | Duration |
|---------|--------|----------|
| 5 failed login attempts | Account locked | 15 minutes |
| 10 failed login attempts | Account locked | Admin intervention |
| Suspicious activity detected | Account flagged | Manual review |

## Session Security

| Measure | Implementation |
|---------|---------------|
| Token Storage | HTTP-only cookies |
| Token Rotation | New token on privilege escalation |
| Invalidation | On password change, forced logout |
| Expiry | Configurable TTL per role |
| Device Tracking | IP + UserAgent stored per session |

## Input Sanitization

- All user inputs validated with Zod schemas
- String trimming on all text fields
- No raw HTML or script tags stored
- URLs validated with URL constructor

## Audit Trail

All identity-related actions are logged:

| Action | Fields Logged |
|--------|---------------|
| User registration | actor, userId, role, timestamp |
| Login | userId, ip, userAgent, success/fail |
| Password change | userId, timestamp |
| Profile update | userId, changed fields |
| Business approval | adminId, profileId, decision |
| Role change | adminId, userId, oldRole, newRole |
| Session revoke | userId, sessionId, actor |

## Future Security Features

| Feature | Status |
|---------|--------|
| MFA (TOTP) | ⏳ Planned |
| MFA (SMS) | ⏳ Planned |
| reCAPTCHA v3 | ⏳ Planned |
| IP Whitelisting (Admin) | 🔮 Future |
| Session Fingerprinting | 🔮 Future |
| Breached Password Detection | 🔮 Future |
