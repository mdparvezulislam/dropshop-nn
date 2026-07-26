"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Award, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { BrandFormDialog } from "@/features/catalog/components/taxonomy/brand-form-dialog";
import {
  deleteBrandAction,
  listBrandsAdminAction,
  type BrandAdminRow,
} from "@/features/catalog/actions/classification-actions";
import { invalidateTaxonomy } from "@/features/catalog/hooks/use-taxonomy";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils/cn";

export default function BrandsAdminPage(): React.ReactElement {
  const [rows, setRows] = React.useState<BrandAdminRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BrandAdminRow | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBrandsAdminAction(debouncedSearch || undefined);
      if (res.success && res.data) {
        setRows(res.data);
      } else {
        setRows([]);
        toast.error(res.error || "Failed to load brands");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load brands");
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

  const openEdit = (row: BrandAdminRow): void => {
    setEditing(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: BrandAdminRow): Promise<void> => {
    const confirmed = window.confirm(
      `Delete "${row.name}"?\n\nThis cannot be undone from this screen.`,
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      const res = await deleteBrandAction(row.id);
      if (res.success) {
        toast.success(`Deleted "${row.name}"`);
        invalidateTaxonomy();
        load();
      } else {
        toast.error(res.error || "Could not delete brand");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete brand");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">ব্র্যান্ড (Brands)</h1>
          <p className="text-sm text-muted-foreground">
            Selectable in Product Studio and used by storefront brand filters.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Brand
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, slug or website…"
          className="pl-9"
          aria-label="Search brands"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading brands…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {search ? "No brands matched your search" : "No brands yet"}
            </p>
            {!search && (
              <Button onClick={openCreate} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Create the first brand
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/90 border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="p-3">নাম (Name)</th>
                  <th className="p-3">Website</th>
                  <th className="p-3">Country</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {row.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- CDN thumbnail
                          <img
                            src={row.logo}
                            alt=""
                            loading="lazy"
                            className="h-8 w-8 rounded-lg object-contain border border-border bg-card p-0.5"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40">
                            <Award className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-foreground truncate">{row.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{row.slug}</p>
                        </div>
                        {row.isFeatured && (
                          <Star
                            className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0"
                            aria-label="Featured"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {row.website ? (
                        <a
                          href={row.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {row.website.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{row.country || "—"}</td>
                    <td className="p-3 text-center tabular-nums font-bold">{row.productCount}</td>
                    <td className="p-3">
                      <Badge variant={row.isActive ? "success" : "outline"} size="xs">
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
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

      <BrandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brand={editing}
        onSaved={load}
      />
    </div>
  );
}
