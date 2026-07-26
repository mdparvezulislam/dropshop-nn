"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, FolderTree, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CategoryFormDialog } from "@/features/catalog/components/taxonomy/category-form-dialog";
import {
  deleteCategoryAction,
  listCategoriesAdminAction,
  type CategoryAdminRow,
} from "@/features/catalog/actions/classification-actions";
import { invalidateTaxonomy } from "@/features/catalog/hooks/use-taxonomy";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils/cn";

export default function CategoriesAdminPage(): React.ReactElement {
  const [rows, setRows] = React.useState<CategoryAdminRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryAdminRow | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategoriesAdminAction(debouncedSearch || undefined);
      if (res.success && res.data) {
        setRows(res.data);
      } else {
        setRows([]);
        toast.error(res.error || "Failed to load categories");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = (): void => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (row: CategoryAdminRow): void => {
    setEditing(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: CategoryAdminRow): Promise<void> => {
    // The server refuses to delete a category with children or assigned products; warn
    // here so the admin is not surprised by a rejection after confirming.
    const confirmed = window.confirm(
      `Delete "${row.name}"?\n\nThis cannot be undone from this screen.`,
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      const res = await deleteCategoryAction(row.id);
      if (res.success) {
        toast.success(`Deleted "${row.name}"`);
        invalidateTaxonomy();
        load();
      } else {
        toast.error(res.error || "Could not delete category");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">ক্যাটাগরি (Categories)</h1>
          <p className="text-sm text-muted-foreground">
            One source of truth for Product Studio, filters and storefront navigation.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, slug or description…"
          className="pl-9"
          aria-label="Search categories"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading categories…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
              <FolderTree className="h-6 w-6" />
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {search ? "No categories matched your search" : "No categories yet"}
            </p>
            {!search && (
              <Button onClick={openCreate} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Create the first category
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/90 border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="p-3">নাম (Name)</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-center">Order</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      {/* Indentation conveys hierarchy; the full path is the accessible name. */}
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                        title={row.path}
                      >
                        {row.depth > 0 && (
                          <span className="text-muted-foreground/50" aria-hidden="true">
                            └
                          </span>
                        )}
                        {row.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- CDN thumbnail
                          <img
                            src={row.image}
                            alt=""
                            loading="lazy"
                            className="h-7 w-7 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/40">
                            <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                          </span>
                        )}
                        <span className="font-extrabold text-foreground">{row.name}</span>
                        {row.isFeatured && (
                          <Star
                            className="h-3.5 w-3.5 text-amber-500 fill-amber-500"
                            aria-label="Featured"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{row.slug}</td>
                    <td className="p-3 text-center tabular-nums font-bold">{row.productCount}</td>
                    <td className="p-3 text-center tabular-nums text-muted-foreground">
                      {row.sortOrder}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={row.isActive ? "success" : "outline"} size="xs">
                          {row.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {row.visibility === "hidden" && (
                          <Badge variant="outline" size="xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={`Edit ${row.name}`}
                          className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          aria-label={`Delete ${row.name}`}
                          className={cn(
                            "p-2 rounded-lg border border-destructive/20 text-destructive transition-colors",
                            "hover:bg-destructive/10 disabled:opacity-40 disabled:pointer-events-none",
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        allCategories={rows}
        onSaved={load}
      />
    </div>
  );
}
