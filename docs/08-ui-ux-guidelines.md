# 08 - UI/UX Guidelines

> Full design system docs live in **`docs/ui/`** (UI-001).

## Typography

- Font Family: Geist Sans, Geist Mono.
- Page title: `text-xl sm:text-2xl font-semibold tracking-tight`
- Section: `text-sm font-semibold`
- Body: `text-sm`
- Meta/labels: `text-xs` / `text-[11px]`

## Color (Commerce OS)

- Dark-first workspace via CSS tokens in `globals.css`
- Primary: electric indigo (`--primary`)
- Surfaces: `--background`, `--card`, `--sidebar`
- Semantic: success / warning / info / destructive

## Shell

- App shell: sidebar + topbar + command palette (`⌘K`)
- List pages: `ListLayout` + `DataTable` + `Toolbar`
- Create flows: `CreateLayout` (Product Studio)

## Motion

- Hover: `transition-colors duration-150`
- Page enter: subtle fade-in
- See `docs/ui/12-animation-guidelines.md`

## Components

Reuse `src/shared/components/ui/*` and `workspace/*`. Do not invent parallel button/table systems per page.
