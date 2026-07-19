# 10 — Responsive Rules

## Breakpoints (Tailwind defaults)

- Mobile: default
- `sm` 640px
- `md` 768px
- `lg` 1024px
- `xl` 1280px

## Shell

- Sidebar: drawer &lt; `lg`, fixed ≥ `lg`
- Topbar search: hidden &lt; `md` (icon trigger instead)
- Breadcrumbs: hidden &lt; `sm`

## Content

- Stats: 2-col mobile → 4-col desktop
- Tables: hide secondary columns with `hideOnMobile`
- Product Studio: stacked sections mobile; sticky right rail ≥ `lg`
- Sticky action bars account for sidebar via `--sidebar-current`
