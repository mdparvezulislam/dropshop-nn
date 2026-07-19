# 07 — Table System

`src/shared/components/ui/data-table.tsx`

## Enterprise DataTable

Supports:

- Search/filter via parent Toolbar (composition)
- Column definitions with `cell` renderers
- Sortable headers (callback)
- Sticky header
- Row selection + bulk actions bar
- Pagination
- Loading skeletons
- Empty state
- Mobile column hiding (`hideOnMobile`)
- Row click navigation

## Usage

```tsx
<DataTable
  columns={columns}
  data={rows}
  selectable
  selectedIds={selected}
  onSelectionChange={setSelected}
  page={page}
  pageSize={10}
  totalCount={total}
  onPageChange={setPage}
  onRowClick={(row) => router.push(`/.../${row.id}`)}
/>
```

All list pages should reuse this component.
