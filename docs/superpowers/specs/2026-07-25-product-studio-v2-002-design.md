# Product Studio V2-002 — Smart Product Intelligence & Form Experience

**Date:** 2026-07-25
**Status:** Approved Design
**Phase:** V2-002 (Post-Foundation)

---

## 1. Problem Statement

The current Product Studio requires admins to manually type almost every field. The SmartParserService exists but is buried inside the Description tab as a secondary button. Sections are verbose, filled with low-value fields, and the specification editor is overly complex (groups, types, category templates, 345 lines).

**Goal:** Transform Product Studio into a parser-first workspace where the admin pastes supplier text and the system generates almost everything. The admin simply reviews and edits.

## 2. Core Philosophy

```
Old Flow:
  Admin → Types everything manually → Save

New Flow:
  Admin → Pastes product info → Parser understands → Fields populate → Admin reviews/edits → Save
```

- Parser never owns data. Everything remains editable.
- Never overwrite manually edited values automatically.
- Parser never invents data. Unknown information stays empty.
- Fewer fields = less cognitive load. Remove fields that don't provide business value.

## 3. Architecture

### 3.1 New Files

| File                                                            | Purpose                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/features/product-studio/components/parser-bar.tsx`         | Central paste zone + Magic Parse button above all tabs                         |
| `src/features/product-studio/components/inline-spec-editor.tsx` | Simple inline key-value spec editor replacing the complex SpecificationSection |
| `src/features/product-studio/components/features-editor.tsx`    | Editable bullet point list for product features                                |
| `src/features/product-studio/hooks/use-smart-parse.ts`          | Dedicated hook for parser logic + field mapping + merge strategy               |

### 3.2 Modified Files

| File                                                           | Changes                                                                                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/product-studio/utils/smart-parser.ts`            | Add extractBrand, extractModel, extractCategory, extractWarranty, extractPackageContents. Improve spec regex for Bangla. Richer ParsedProductData. |
| `src/features/product-studio/hooks/use-product-studio.ts`      | Delegate handleMagicParse to useSmartParse. Wire bulletFeatures into buildPayload.                                                                 |
| `src/features/product-studio/components/new-studio-layout.tsx` | Add ParserBar slot above tab bar. Expose onMagicParse via context.                                                                                 |
| `src/app/dashboard/products/create/page.tsx`                   | Replace SpecificationSection with InlineSpecEditor. Add FeaturesEditor to Description tab.                                                         |
| `src/app/dashboard/products/[id]/edit/page.tsx`                | Same section replacements.                                                                                                                         |
| `src/features/product-studio/components/sections/`             | Simplify each section: reduce spacing, compact layouts.                                                                                            |
| `src/app/globals.css`                                          | Add inline-spec and features-editor component styles to studio theme.                                                                              |

## 4. Component Designs

### 4.1 ParserBar

Central paste zone positioned above the tab bar in `NewStudioLayout`. Always visible on desktop, collapsible on mobile.

**States:**

- **Empty:** Large textarea with placeholder "Paste product URL, supplier text, HTML, or any product description..."
- **Parsing:** Button shows spinner, textarea disabled
- **Parsed:** Shows extraction summary (e.g., "✓ 6 specs, 4 features, 8 keywords"), button resets
- **Error:** Shows error message if parser returns nothing useful

**Behavior:**

- `onParse(text)` called with textarea value
- Parent hook runs `SmartParserService.parse(text)` and `bulkUpdate` with results
- After parse, textarea clears but summary stays for 10 seconds
- "Clear" button resets the bar

### 4.2 InlineSpecEditor

Replaces `SpecificationSection` entirely. Simple two-column key-value grid.

**Structure:**

```
Key column (left)  |  Value column (right)
──────────────────────────────────────────
Display           |  6.7"
Battery           |  5000mAh
Charging          |  65W
+ Add Row         |
```

**Behavior:**

- Each row = two inline inputs: key + value
- Empty row at bottom = "Add" row
- Delete button (trash icon) per row
- Drag handle for reorder (future, not v1)
- Parser fills rows via `specs` prop
- Outputs `SpecificationField[]` — same interface, backward compatible
- No groups, no types, no category templates

**Edge cases:**

- Duplicate keys → auto-dedup (keep last value)
- Empty key row → skip on save
- 100+ rows → virtual scroll not needed (uncommon)

### 4.3 FeaturesEditor

Editable bullet list rendered in the Description tab below the rich text editor.

**Structure:**

```
Key Features & Highlights
  • 6.7-inch AMOLED Display [x]
  • 5000mAh Battery [x]
  • IP68 Water Resistant [x]
  + Add Feature
```

**Behavior:**

- Each bullet = single text input with delete button
- Last row = add new
- Parser fills from `parsed.features`
- Stored as `form.bulletFeatures: string[]`
- On save, `buildPayload` generates `<h3>Key Features</h3><ul>...</ul>` and appends to `richDescription`

### 4.4 useSmartParse Hook

```typescript
interface UseSmartParseResult {
  parse: (text: string) => void;
  isParsing: boolean;
  lastResult: ParsedProductData | null;
  summary: string[];
}

function useSmartParse(
  form: StudioFormState,
  bulkUpdate: (partial: Partial<StudioFormState>) => void,
): UseSmartParseResult;
```

**Merge Strategy:**

- Empty fields → fill with parsed value
- Filled fields → skip (preserve manual edits)
- Features → always replace `bulletFeatures` array (user can edit after)
- Specifications → merge (keep existing, add new unique keys)
- Tags → merge (deduplicate)

**No parser state is stored** — parsed data goes directly into form state via `bulkUpdate`.

## 5. Parser Enrichment (smart-parser.ts)

### New Extraction Methods

| Method                         | What it extracts                                       | Pattern                                                         |
| ------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------- |
| `extractBrand(text)`           | First capitalized word or known brand from keyword map | Match against `KEYWORD_BRAND_MAP` in use-auto-classification.ts |
| `extractModel(text)`           | Alphanumeric model code after brand name               | Regex: `/(\w+\s)?([A-Z0-9][A-Z0-9-]{2,10})\b/` (loose)          |
| `extractCategory(text)`        | Most relevant category from keyword map                | Match against `KEYWORD_CATEGORY_MAP`                            |
| `extractWarranty(text)`        | Warranty period text                                   | Regex: `/(\d+)\s*(month                                         | year | বছর | মাস)/i` |
| `extractPackageContents(text)` | "Includes:" or "Package:" list items                   | Lines after "Includes", "Package Contents", "Box Contains"      |

### Enhanced ParsedProductData

```typescript
interface ParsedProductData {
  title: string;
  seoDescription: string;
  features: string[];
  specifications: ParsedSpecification[];
  keywords: string[];
  cleanText: string;
  // NEW
  brand?: string;
  model?: string;
  category?: string;
  categoryCode?: string;
  warranty?: string;
  packageContents?: string[];
}
```

## 6. Section Simplification

| Tab             | Sections                                                                     | What Changed                                                                                        |
| --------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Basic**       | Name, SKU, Categories, Brand, Tags, Barcode                                  | Removed: productModel, shortDescription (moved to Description). Compact layout.                     |
| **Pricing**     | Cost → Retail → Wholesale → Reseller → Compare + Stock + Low Stock Threshold | Removed: reservedStock, incomingStock, warehouseLocation. Two-column layout.                        |
| **Description** | Short desc (compact), Rich text, Features Editor                             | Short desc added here. Magic Parse button removed (now in ParserBar). Features Editor below editor. |
| **Specs**       | InlineSpecEditor                                                             | Replaced entire SpecificationSection.                                                               |
| **Images**      | MediaSection                                                                 | Unchanged (clean already).                                                                          |
| **Variants**    | VariantStudioSection                                                         | Unchanged.                                                                                          |
| **SEO**         | Meta title, description, slug, og:image                                      | Unchanged.                                                                                          |
| **Marketing**   | Collections & Channels                                                       | Channels field hidden. Visibility select remains.                                                   |
| **Advanced**    | Supplier (compact), Publishing (compact)                                     | Removed: relationships. Compact field layout.                                                       |
| **Preview**     | StudioLivePreview                                                            | Unchanged.                                                                                          |

## 7. Backward Compatibility

- Removed fields stay in `StudioFormState` type (hidden from UI, still in `buildPayload`)
- Old `SpecificationSection` component remains in codebase (not deleted)
- `SpecificationField` interface unchanged
- `ParsedProductData` is additive only (new optional fields)
- All existing features continue working
- `buildPayload` passes through all existing fields unchanged

## 8. Edge Cases

| Case                             | Handling                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| Parser returns empty for a field | Leave field empty. No invented data.                                                      |
| Specs with duplicate keys        | Latest value wins (spec map).                                                             |
| User manually edits a spec       | Never overwritten by subsequent parses.                                                   |
| Feature bullets with duplicates  | Auto-dedup in parser.                                                                     |
| Very long paste (>100KB)         | Truncate to first 50KB before parsing.                                                    |
| No features in paste             | Features section stays empty/hidden.                                                      |
| URL pasted instead of text       | Detect URL pattern, attempt WebFetch (future phase, not v1). For v1, URL treated as text. |

## 9. Verification

1. `npx tsc --noEmit` — 0 errors
2. `npx next build` — build passes
3. Manual:
   - Paste supplier text → click Magic Parse → Title, Specs, Features, Tags, SEO populate
   - Specs render as simple key-value rows
   - Feature bullets render as editable list
   - Previously filled fields NOT overwritten
   - Save works (including features in description HTML)
   - Edit mode loads and repopulates correctly
   - Mobile: ParserBar collapses, still usable
