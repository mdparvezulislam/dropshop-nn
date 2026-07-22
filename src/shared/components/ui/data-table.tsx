"use client";

import * as React from "react";
import { cn } from "@/shared/utils/cn";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  bulkActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

function getCellValue<T>(row: T, column: DataTableColumn<T>): React.ReactNode {
  if (column.cell) return column.cell(row);
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor) return String(row[column.accessor] ?? "");
  return null;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  selectable,
  selectedIds = [],
  onSelectionChange,
  sortBy,
  sortOrder = "asc",
  onSortChange,
  page = 1,
  pageSize = 10,
  totalCount,
  onPageChange,
  bulkActions,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search terms or filters.",
  onRowClick,
  className,
}: DataTableProps<T>): React.ReactElement {
  const total = totalCount ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = data.length > 0 && data.every((r) => selectedIds.includes(r.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = (): void => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !data.some((r) => r.id === id)));
    } else {
      const merged = new Set([...selectedIds, ...data.map((r) => r.id)]);
      onSelectionChange(Array.from(merged));
    }
  };

  const toggleOne = (id: string): void => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSort = (colId: string): void => {
    if (!onSortChange) return;
    if (sortBy === colId) {
      onSortChange(colId, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(colId, "asc");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden transition-all duration-200",
        className,
      )}
    >
      {selectable && selectedIds.length > 0 && bulkActions ? (
        <div className="flex items-center justify-between border-b border-border/80 bg-primary/5 px-4 py-2.5 backdrop-blur-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-foreground">
              item{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      ) : null}

      <div className="overflow-x-auto ws-scroll">
        <table className="w-full caption-bottom text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/70 backdrop-blur-md">
            <tr className="border-b border-border/80">
              {selectable ? (
                <th className="h-10 w-10 px-3 text-left align-middle">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
              ) : null}
              {columns.map((col) => {
                const isSorted = sortBy === col.id;
                return (
                  <th
                    key={col.id}
                    className={cn(
                      "h-10 px-3 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors select-none",
                      col.hideOnMobile && "hidden md:table-cell",
                      col.headerClassName,
                    )}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1 -mx-1",
                          isSorted && "text-primary font-bold",
                        )}
                      >
                        {col.header}
                        {isSorted ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {selectable ? (
                    <td className="p-3">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn("p-3.5", col.hideOnMobile && "hidden md:table-cell")}
                    >
                      <Skeleton className="h-4 w-3/4 max-w-[12rem] rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    className="border-0 rounded-none bg-transparent"
                  />
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const selected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors duration-150 group",
                      onRowClick && "cursor-pointer",
                      selected
                        ? "bg-primary/8 hover:bg-primary/12"
                        : "hover:bg-muted/50 focus-within:bg-muted/30",
                    )}
                  >
                    {selectable ? (
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleOne(row.id)}
                          aria-label={`Select row ${row.id}`}
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "p-3.5 align-middle text-foreground/90 font-normal text-xs sm:text-sm",
                          col.hideOnMobile && "hidden md:table-cell",
                          col.className,
                        )}
                      >
                        {getCellValue(row, col)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {onPageChange ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/80 bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>
            –<span className="font-semibold text-foreground">{Math.min(page * pageSize, total)}</span>{" "}
            of <span className="font-semibold text-foreground">{total}</span> items
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
              aria-label="First page"
              className="h-7 w-7 rounded-md"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
              className="h-7 w-7 rounded-md"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-3 py-1 rounded-md bg-card border border-border/70 text-xs font-semibold tabular-nums text-foreground shadow-xs">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
              className="h-7 w-7 rounded-md"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
              className="h-7 w-7 rounded-md"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DataTable;
