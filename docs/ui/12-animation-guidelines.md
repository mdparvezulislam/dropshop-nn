# 12 — Animation Guidelines

## Philosophy

Subtle only. No flashy effects.

## Allowed

- `transition-colors` / `transition-all` ~150ms
- Page enter: `animate-[fade-in_0.2s_ease-out]`
- Command palette / sheets: short fade + slide
- Active scale on buttons: `active:scale-[0.98]`
- Sidebar width: 200ms ease-out

## Avoid

- Large bounce/spring loops
- Parallax noise
- Auto-playing decorative motion that distracts operators

## Keyframes (globals.css)

- `fade-in`
- `slide-up`
- `slide-in-left`
