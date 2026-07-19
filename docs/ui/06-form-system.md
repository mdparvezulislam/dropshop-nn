# 06 — Form System

## Primitives (`src/shared/components/ui/`)

- Input, Textarea, Label
- Select (Radix)
- Checkbox, Switch
- Button variants

## Composites (`src/shared/components/forms/`)

| Component     | Purpose                      |
| ------------- | ---------------------------- |
| FormField     | Label + control + hint/error |
| CurrencyInput | Prefixed currency number     |
| NumberInput   | Tabular number input         |
| TagsInput     | Chip tags with Enter/comma   |

## Patterns

- Labels: `text-xs font-medium text-muted-foreground`
- Controls: `h-9`, `rounded-md`, focus ring via `--ring`
- Errors: `role="alert"` + destructive color
