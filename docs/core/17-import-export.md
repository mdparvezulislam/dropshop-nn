# 17 - Import / Export Foundation

## Overview

The import/export foundation provides reusable utilities for CSV and JSON operations. Every engine that supports bulk operations uses the same contracts.

---

## Export Contract

```typescript
interface ExportEngineContract {
  export<T>(data: T[], options: ExportOptions): Promise<Blob | string>
  exportCsv<T>(data: T[], columns?: string[]): Promise<string>
  exportJson<T>(data: T[]): Promise<string>
}
```

---

## Import Contract

```typescript
interface ImportEngineContract {
  import<T>(
    file: File | Buffer,
    format: "csv" | "json",
    validateRow: (row: Record<string, unknown>, index: number) => string | null,
  ): Promise<ImportResult>

  importCsv<T>(
    content: string,
    validateRow: (row: Record<string, unknown>, index: number) => string | null,
  ): Promise<ImportResult>

  importJson<T>(
    content: string,
    validateRow: (item: Record<string, unknown>, index: number) => string | null,
  ): Promise<ImportResult>

  validateTemplate(
    file: File | Buffer,
    expectedColumns: string[],
  ): Promise<{ valid: boolean; errors: string[] }>
}
```

---

## Import Result

```typescript
interface ImportResult {
  totalRows: number
  successCount: number
  failureCount: number
  errors: { row: number; message: string }[]
}
```

---

## CSV Utilities

The `import-export.ts` module provides:

| Function | Description |
|----------|-------------|
| `generateCsv(data, columns)` | Convert array of objects to CSV string |
| `parseCsv(content)` | Parse CSV string to array of objects |
| `escapeCsvField(value)` | Escape a field for CSV (handles commas, quotes, newlines) |

---

## Export Options

```typescript
interface ExportOptions {
  format: "csv" | "json"
  filename?: string
  columns?: string[]
  filters?: Record<string, unknown>
}
```

---

## Usage Pattern

### Export
```typescript
import { generateCsv } from "@/shared/core"

const csv = generateCsv(products, ["id", "name", "sku", "price"])
// Returns CSV string with header row
```

### Import
```typescript
import { parseCsv } from "@/shared/core"

const rows = parseCsv(csvContent)
// Returns array of { id: "...", name: "...", ... }
```

---

## Future Formats

| Format | Status |
|--------|--------|
| CSV | ✅ Ready |
| JSON | ✅ Ready |
| Excel (.xlsx) | ⏳ Planned |
| PDF | ⏳ Planned |
