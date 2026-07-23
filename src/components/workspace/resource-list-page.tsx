"use client";

import * as React from "react";
import { ListLayout } from "@/components/workspace/list-layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { SearchBox } from "@/components/workspace/search-box";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";

export interface ResourceListPageProps<T extends { id: string }> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: React.ReactNode;
  children?: React.ReactNode;
}

export function ResourceListPage<T extends { id: string }>({
  title,
  description,
  actions,
  stats,
  toolbarLeft,
  toolbarRight,
  search,
  columns,
  data,
  loading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onRowClick,
  emptyTitle,
  emptyDescription,
  selectable,
  selectedIds,
  onSelectionChange,
  bulkActions,
  children,
}: ResourceListPageProps<T>): React.ReactElement {
  const left = (
    <>
      {search ? (
        <SearchBox
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder ?? "Search…"}
          className="w-full sm:w-72"
        />
      ) : null}
      {toolbarLeft}
    </>
  );

  return (
    <ListLayout
      header={{ title, description, actions }}
      stats={
        loading && !stats ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          stats
        )
      }
      toolbar={<Toolbar left={left} right={toolbarRight} />}
    >
      {children}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onRowClick={onRowClick}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        selectable={selectable}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        bulkActions={bulkActions}
      />
    </ListLayout>
  );
}

export default ResourceListPage;
