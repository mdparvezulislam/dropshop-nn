# 11 — Accessibility

## Requirements

- Visible `:focus-visible` rings using `--ring`
- Icon-only buttons have `aria-label`
- Dialogs/sheets use Radix focus trap
- Command palette keyboard: ↑↓ Enter Esc
- Tables: select checkboxes labeled
- Status not conveyed by color alone (text labels on chips)
- `sr-only` close labels on overlays

## Contrast

Dark theme tokens tuned for WCAG-oriented contrast on body and muted text. Prefer `text-foreground` / `text-muted-foreground` over low-contrast custom grays.
