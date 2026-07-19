# 11 - Security Plan

## 1. Authentication & Sessions

- **Credentials Auth**: Authenticates against `AuthService` using secure, salted password verifications.
- **Session Strategy**: Leverages NextAuth v5 JWT session tokens containing user profile identifiers, roles, and permission list scopes.
- **Session Expiration**: Set to 24 hours to balance security and usability.
- **Protected Routing**: Implemented in edge-compatible `src/middleware.ts` to block access to `/dashboard/*` for anonymous requests.

## 2. Dynamic Authorization (Roles & Permissions)

- **RBAC Matrix**: Controlled dynamically using `Role` and `Permission` Mongoose documents.
- **Wildcard Matching**: Supports wildcard (`*`) matching for Super Admin roles to easily access any path.
- **Access Control Helpers**: The `AuthorizationService` queries role scopes with request caching to avoid database bottlenecks.

## 3. Password Security & Cryptography

- **Salting & Hashing**: Handled via `bcryptjs` using a salt work factor of 10 rounds.
- **Strict Transport Options**: Cookies are configured with standard `HttpOnly`, `Secure`, and `SameSite=Lax` parameters to mitigate CSRF and XSS threats.

## 4. Input Validation & Defense

- **Zod Schema Engine**: Form payloads are parsed using Zod rules prior to credential checks or registry writes, preventing NoSQL injection and parameter pollution.
