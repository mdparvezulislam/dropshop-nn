# 08 - UI/UX Guidelines

## Typography

- Font Family: Geist Sans, Geist Mono.
- Font Sizes:
  - Header 1: `text-4xl` (bold, tracking-tight)
  - Header 2: `text-2xl` (semibold)
  - Body: `text-sm` (regular)

## Color Palette (Sleek Slate Design)

- **Primary**: Slate Blue (`hsl(var(--primary))`)
- **Background**: White (`#ffffff`) for light mode, Slate Black (`#0a0a0a`) for dark mode.
- **Card**: Clean boundaries, soft borders (`hsl(var(--border))`), subtle shadow depths.

## Motion & Transitions

- Hover states must incorporate transitions: `transition-colors duration-200`.
- Complex page transitions or modal animations should use Framer Motion wrappers for fluid entrance/exits.
