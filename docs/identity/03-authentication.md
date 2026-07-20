# 03 - Authentication

## Supported Methods

| Method | Status | Description |
|--------|--------|-------------|
| Email + Password | ✅ Current | Primary auth method |
| Phone + Password | ✅ Current | Secondary auth method |
| OTP Login | ⏳ Future | One-time password via SMS |
| Social Login | ⏳ Future | Google, Facebook login |

## Authentication Flow

```
Login Request (email/phone + password)
  │
  ├── Resolve User (by email or phone)
  ├── Check Account Status (active/suspended)
  ├── Verify Password (bcrypt compare)
  ├── Create Session (JWT)
  ├── Update Login History
  ├── Publish LoginSuccess Event
  └── Return Session Token
```

## Remember Me

When "Remember Me" is enabled:
- Session TTL extends to 30 days (default: 24 hours)
- Refresh token is stored
- User is not prompted for re-auth on browser restart

## Forgot Password

```
Forgot Password Request
  │
  ├── Validate Email/Phone
  ├── Generate Reset Token (crypto, 1-hour expiry)
  ├── Send Reset Link/Code (email or SMS)
  └── Store Hashed Token
```

## Password Reset

```
Reset Token Submission
  │
  ├── Verify Token (not expired, valid hash)
  ├── Validate New Password (min 8 chars, complexity)
  ├── Hash New Password (bcrypt, 10 rounds)
  ├── Update Password in Database
  ├── Invalidate All Sessions (except current)
  ├── Publish PasswordChanged Event
  └── Return Success
```

## Email Verification

```
Registration → Send Verification Email
  │
  ├── Generate Verification Token (crypto, 24-hour expiry)
  ├── Store Hashed Token
  └── Email with Verification Link
```

## Phone Verification

```
Phone Update → Send Verification SMS
  │
  ├── Generate 6-digit OTP
  ├── Store Hashed OTP (5-minute expiry)
  └── SMS with OTP Code
```

## Auth Endpoints (Future API)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/login | Email/phone + password login |
| POST | /api/auth/register | Customer self-registration |
| POST | /api/auth/forgot-password | Request reset link |
| POST | /api/auth/reset-password | Submit reset token |
| POST | /api/auth/verify-email | Verify email address |
| POST | /api/auth/verify-phone | Verify phone number |
| POST | /api/auth/logout | End session |
| GET | /api/auth/sessions | List active sessions |
| DELETE | /api/auth/sessions/:id | Revoke specific session |

## Event Publications

All auth actions publish events:
- `identity.login_success` — on successful login
- `identity.logout` — on logout
- `identity.password_changed` — on password change
- `identity.email_verified` — on email verification
- `identity.phone_verified` — on phone verification
