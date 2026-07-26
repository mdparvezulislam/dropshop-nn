"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryAdminRow,
} from "../../actions/classification-actions";
import { invalidateTaxonomy } from "../../hooks/use-taxonomy";
import { cn } from "@/lib/utils/cn";

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create. */
  category?: CategoryAdminRow | null;
  /** Hierarchy-ordered rows, used to populate the parent picker. */
  allCategories: CategoryAdminRow[];
  onSaved: () => void;
}

interface FormState {
  name: string;
  slug: string;
  parentCategoryId: string;
  description: string;
  image: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
  isFeatured: boolean;
  visibility: "public" | "hidden";
  metaTitle: string;
  metaDescription: string;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  parentCategoryId: "",
  description: "",
  image: "",
  icon: "",
  sortOrder: "0",
  isActive: true,
  isFeatured: false,
  visibility: "public",
  metaTitle: "",
  metaDescription: "",
};

/** Mirrors the server's slug rule so the live preview matches what gets saved. */
function previewSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  allCategories,
  onSaved,
}: CategoryFormDialogProps): React.ReactElement {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const isEdit = Boolean(category);

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setForm(
      category
        ? {
            name: category.name,
            slug: category.slug,
            parentCategoryId: category.parentCategoryId ?? "",
            description: category.description ?? "",
            image: category.image ?? "",
            icon: category.icon ?? "",
            sortOrder: String(category.sortOrder ?? 0),
            isActive: category.isActive,
            isFeatured: category.isFeatured,
            visibility: category.visibility,
            metaTitle: category.metaTitle ?? "",
            metaDescription: category.metaDescription ?? "",
          }
        : EMPTY,
    );
  }, [open, category]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * A category cannot parent itself, nor can any of its own descendants become its
   * parent. Filtering here mirrors the server-side cycle guard so the invalid option is
   * never offered in the first place.
   */
  const parentOptions = React.useMemo(() => {
    if (!category) return allCategories;
    const banned = new Set<string>([category.id]);
    for (const row of allCategories) {
      if (row.parentCategoryId && banned.has(row.parentCategoryId)) banned.add(row.id);
    }
    return allCategories.filter((row) => !banned.has(row.id));
  }, [allCategories, category]);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      parentCategoryId: form.parentCategoryId || null,
      description: form.description,
      image: form.image,
      icon: form.icon,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      visibility: form.visibility,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
    };

    try {
      const res = category
        ? await updateCategoryAction(category.id, payload)
        : await createCategoryAction(payload);

      if (res.success) {
        toast.success(isEdit ? "Category updated" : "Category created");
        // Product Studio's selectors read through the shared cache; drop it so the new
        // category is immediately selectable without a page reload.
        invalidateTaxonomy();
        onSaved();
        onOpenChange(false);
      } else {
        setFieldErrors(res.fieldErrors ?? {});
        toast.error(res.error || "Could not save category");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const errorFor = (field: string): string | undefined => fieldErrors[field]?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto ws-scroll">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            Categories power Product Studio, storefront navigation and catalog filters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Electronics"
                required
                aria-invalid={Boolean(errorFor("name"))}
                aria-describedby={errorFor("name") ? "cat-name-error" : undefined}
              />
              {errorFor("name") && (
                <p id="cat-name-error" className="text-xs text-destructive">
                  {errorFor("name")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">URL Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder={previewSlug(form.name) || "auto-generated"}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to generate from the name.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-parent">Parent Category</Label>
            <select
              id="cat-parent"
              value={form.parentCategoryId}
              onChange={(e) => set("parentCategoryId", e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— Top level —</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {" ".repeat(option.depth * 3)}
                  {option.depth > 0 ? "└ " : ""}
                  {option.name}
                </option>
              ))}
            </select>
            {errorFor("parentCategoryId") && (
              <p className="text-xs text-destructive">{errorFor("parentCategoryId")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Shown on the storefront category page"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input
                id="cat-image"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://ik.imagekit.io/…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-icon">Icon</Label>
              <Input
                id="cat-icon"
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                placeholder="Smartphone"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Display Order</Label>
              <Input
                id="cat-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-meta-title">Meta Title</Label>
              <Input
                id="cat-meta-title"
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-meta-desc">Meta Description</Label>
              <Input
                id="cat-meta-desc"
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                maxLength={300}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-muted/30 p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
              <span className="text-sm font-semibold">Active</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set("isFeatured", v)} />
              <span className="text-sm font-semibold">Featured</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Switch
                checked={form.visibility === "public"}
                onCheckedChange={(v) => set("visibility", v ? "public" : "hidden")}
              />
              <span className="text-sm font-semibold">
                {form.visibility === "public" ? "Public" : "Hidden"}
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || form.name.trim().length < 2}>
              <span className={cn(saving && "opacity-70")}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
