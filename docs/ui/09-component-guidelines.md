# 09 — Component Guidelines

## Rules

1. Put **shared** UI in `src/shared/components/ui` or `workspace` / `forms` / `editor`.
2. Feature-specific UI stays under `src/features/<feature>/components` only if not reusable.
3. Prefer composition over prop explosion.
4. Export explicit TypeScript props interfaces.
5. No business logic inside presentational components.
6. Use design tokens — avoid hard-coded slate/indigo one-offs on new pages.

## Naming

- Components: `PascalCase.tsx`
- Workspace layout pieces: `list-layout.tsx`, `page-header.tsx`

## Status display

Use `StatusChip` + `statusToneFromValue()` for consistent status colors.
