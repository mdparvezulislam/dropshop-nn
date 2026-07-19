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

## 5. Pricing & Inventory Permissions (Phase 6)

| Permission         | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `Inventory.View`   | Read inventory, history, dashboard, export               |
| `Inventory.Update` | Create/update inventory & supplier mappings, bulk stock  |
| `Inventory.Adjust` | Execute stock operations (in/out/adjust/reserve/release) |
| `Pricing.View`     | Read pricing records and export                          |
| `Pricing.Update`   | Create/update pricing, bulk price updates                |
| `Pricing.Override` | Force fixed price override bypassing rule engine         |

Default role grants (see `AuthorizationService`):

- **Admin**: full Inventory + Pricing set
- **Manager**: View/Update/Adjust inventory; View/Update pricing
- **Staff**: Inventory View/Update; Pricing View
- **Supplier**: Inventory View/Update; Pricing View
- **Accountant**: Pricing View

## 6. Reseller Permissions (Phase 7)

| Permission         | Description                                   |
| ------------------ | --------------------------------------------- |
| `Reseller.Create`  | Onboard new resellers                         |
| `Reseller.View`    | List, detail, product search, dashboard       |
| `Reseller.Update`  | Edit profile, assign/remove products, pricing |
| `Reseller.Suspend` | Suspend or block resellers                    |

Default grants: Admin & Manager full set; Staff View; Reseller role gets View + Update on own catalog path.
