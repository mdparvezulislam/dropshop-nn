# 05 — Product Studio

Route: `/dashboard/products/new`  
File: `src/app/dashboard/products/new/page.tsx`

## Flagship create experience

Uses `CreateLayout` with:

### Top header

- Product title (live)
- Autosave status indicator (UI-only)
- Save draft / Preview / Publish

### Main column

- General information
- Tiptap rich description
- Gallery (URL-based)
- Pricing preview fields (display; master pricing remains Pricing module)
- Inventory preview fields (display; stock remains Inventory module)
- Variants editor
- Attributes / specs

### Right sidebar

- Publishing & visibility
- Supplier / category / brand / tags
- Featured flags
- Shipping / warranty / return
- Quick preview card
- Jump-to section nav

### Sticky bottom bar

- Save draft · Preview · Publish

## Business boundary

Still calls existing `createProductAction` only. Pricing/inventory fields are studio UX hints, not writes to Pricing/Inventory models.
