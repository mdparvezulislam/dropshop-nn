# 01 — Design System

DropshopNN Commerce OS UI foundation. **UI-only** — no business logic changes.

## Aesthetic

Refined industrial dark workspace inspired by Linear, Stripe Dashboard, and Vercel — not a generic admin panel.

## Principles

1. **One language** — every page uses tokens, layouts, and shared components.
2. **Business workspace** — workflows over raw CRUD.
3. **Density with clarity** — compact tables, clear hierarchy.
4. **Subtle motion** — 150–250ms transitions only.
5. **Accessible** — focus rings, ARIA labels, contrast.

## Stack

- Tailwind CSS v4 + CSS custom properties
- Radix primitives (dialog, select, dropdown, checkbox, switch, tooltip, avatar)
- Lucide icons
- Tiptap rich text
- Framer Motion available for optional micro-interactions
- Geist Sans / Geist Mono

## Source map

| Area             | Path                               |
| ---------------- | ---------------------------------- |
| Tokens           | `src/app/globals.css`              |
| UI primitives    | `src/shared/components/ui/`        |
| Workspace chrome | `src/shared/components/workspace/` |
| Forms            | `src/shared/components/forms/`     |
| Editor           | `src/shared/components/editor/`    |
