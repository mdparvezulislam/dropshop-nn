# DropshopNN — Project Summary

## Current Status

Role-driven commerce OS with 14 engines and **one unified internal workspace shell**. Public site covers homepage through blog. CMS, Analytics, and Notification engines are live. Production build passes.

## Completed

**ENGINES → NOTIFICATION-001** — Identity through Notification, plus public commerce and content surfaces.

**WORKSPACE-001** — Single App Shell (`WorkspaceLayout`) for Admin, Reseller, Wholesale, and Supplier. Shared registry (`workspace-registry.ts`) drives nav, breadcrumbs, home path, and command palette. Role layouts are thin adapters (no duplicate shell). Command palette is nav-driven + quick actions (⌘K). Sidebar brand/`homeHref` and path-aware workspace switcher. Middleware enforces role→route access and post-login home by role. Session-aware topbar + sign-out. Reusable `WidgetGrid` / `QuickActionsWidget`. Existing module pages unchanged under `/dashboard`, `/reseller`, `/wholesale`, `/supplier`.

## Architecture

Feature-first DDD. One shell, role-driven navigation and permissions — never multiple dashboard frameworks. Engines stay the source of truth for domain logic.

## Next Planned Phase

**ADMIN-WORKSPACE-001** — Deep admin workspace modules, ops tooling, and staff-specific workflows on the unified shell.
