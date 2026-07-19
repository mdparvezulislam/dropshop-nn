# 02 — Workspace Layout

## App shell

`src/app/dashboard/layout.tsx`

- Collapsible **Sidebar** (desktop fixed, mobile drawer)
- **Topbar** (breadcrumb, search, notifications, user menu)
- **Command palette** (`⌘K` / `Ctrl+K`)
- Content max width: `--content-max` (90rem)
- Content padding: responsive `px-4 sm:px-6 lg:px-8`

## Shared layouts

| Layout        | File                           | Use                                  |
| ------------- | ------------------------------ | ------------------------------------ |
| ListLayout    | `workspace/list-layout.tsx`    | List pages + stats + toolbar + table |
| DetailsLayout | `workspace/details-layout.tsx` | Detail with optional sticky sidebar  |
| CreateLayout  | `workspace/create-layout.tsx`  | Studio create/edit + sticky footer   |

## Page building blocks

- `PageHeader` — title, description, actions
- `SectionHeader` — section titles
- `Toolbar` — filters/search row
- `StatCard` — metric tiles
- `SearchBox` — consistent search field
- `StatusChip` — status pills

## CSS variables

- `--sidebar-width` / `--sidebar-collapsed` / `--sidebar-current`
- `--topbar-height`
- `--content-max`
