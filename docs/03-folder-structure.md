# 03 - Folder Structure

## Project Map

```
dropshop-nn/
├── docs/                      # Foundational architecture docs
├── src/
│   ├── app/                   # Next.js App Router (Layouts, Pages, Routes)
│   │   └── auth/              # Auth pages (Login, Forgot Password, Reset Password, Unauthorized)
│   ├── features/              # Feature modules (Domain-driven modules)
│   │   ├── auth/
│   │   │   ├── domain/        # Core entities (user-entity, role-entity, permission-entity)
│   │   │   ├── repositories/  # Database access layer (user-model, user-repository, role-model, etc.)
│   │   │   ├── services/      # Business logic services (auth-service, authorization-service)
│   │   │   ├── components/    # Feature specific UI components
│   │   │   ├── actions/       # Server actions
│   │   │   ├── hooks/         # Custom client state hooks
│   │   │   └── types/         # Feature type schemas (validation)
│   │   └── ... (products, orders, payments, courier, inventory, pricing, wallet, invoices)
│   ├── shared/                # Code shared across multiple feature domains
│   │   ├── components/        # Shared UI components
│   │   │   └── ui/            # Common UI elements (Button, Input, Dialog, Toast, Card, Table, Badge, Skeleton, Spinner, EmptyState, ErrorState)
│   │   ├── config/            # System config (env validation, app-config)
│   │   ├── constants/         # Global domain constants (routes, permissions, limits)
│   │   ├── errors/            # Custom AppError classes (ValidationError, NotFoundError, etc.)
│   │   ├── hooks/             # Utility React hooks (useDebounce, useLocalStorage)
│   │   ├── lib/               # Shared libraries (mongoose, redis, bullmq, auth, imagekit)
│   │   ├── types/             # Shared TypeScript typings (success, error, sort, filter)
│   │   └── utils/             # Helper functions (cn, logger, api-response, date-utils, currency-utils, number-utils, slug-utils, id-utils, validation)
```
