# 03 — Sidebar

`src/shared/components/workspace/sidebar.tsx`  
Config: `nav-config.ts`

## Features

- Collapse / expand (desktop)
- Nested navigation sections
- Active route indicator
- In-sidebar search
- Favorites & Recent placeholders
- Mobile full-height drawer
- Tooltips when collapsed

## Sections (workflow order)

1. Workspace
2. Catalog (Products, Pricing)
3. Partners (Suppliers, Resellers)
4. Operations (Inventory, Orders*, Customers*, Courier*)
5. Finance (Wallet*, Reports*)
6. System (Settings*)

\* Coming soon placeholders.

## Breadcrumbs

`getBreadcrumbs(pathname)` in `nav-config.ts` powers the topbar trail.
