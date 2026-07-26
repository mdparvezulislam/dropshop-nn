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
  createBrandAction,
  updateBrandAction,
  type BrandAdminRow,
} from "../../actions/classification-actions";
import { invalidateTaxonomy } from "../../hooks/use-taxonomy";

export interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create. */
  brand?: BrandAdminRow | null;
  onSaved: () => void;
}

interface FormState {
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  website: string;
  country: string;
  sortOrder: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  logo: "",
  banner: "",
  description: "",
  website: "",
  country: "",
  sortOrder: "0",
  isActive: true,
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
};

export function BrandFormDialog({
  open,
  onOpenChange,
  brand,
  onSaved,
}: BrandFormDialogProps): React.ReactElement {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const isEdit = Boolean(brand);

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setForm(
      brand
        ? {
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo ?? "",
            banner: brand.banner ?? "",
            description: brand.description ?? "",
            website: brand.website ?? "",
            country: brand.country ?? "",
            sortOrder: String(brand.sortOrder ?? 0),
            isActive: brand.isActive,
            isFeatured: brand.isFeatured,
            metaTitle: brand.metaTitle ?? "",
            metaDescription: brand.metaDescription ?? "",
          }
        : EMPTY,
    );
  }, [open, brand]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      logo: form.logo,
      banner: form.banner,
      description: form.description,
      website: form.website,
      country: form.country,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
    };

    try {
      const res = brand
        ? await updateBrandAction(brand.id, payload)
        : await createBrandAction(payload);

      if (res.success) {
        toast.success(isEdit ? "Brand updated" : "Brand created");
        invalidateTaxonomy();
        onSaved();
        onOpenChange(false);
      } else {
        setFieldErrors(res.fieldErrors ?? {});
        toast.error(res.error || "Could not save brand");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save brand");
    } finally {
      setSaving(false);
    }
  };

  const errorFor = (field: string): string | undefined => fieldErrors[field]?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto ws-scroll">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Brand" : "New Brand"}</DialogTitle>
          <DialogDescription>
            Brands are selectable in Product Studio and power storefront brand filters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Samsung"
                required
                aria-invalid={Boolean(errorFor("name"))}
                aria-describedby={errorFor("name") ? "brand-name-error" : undefined}
              />
              {errorFor("name") && (
                <p id="brand-name-error" className="text-xs text-destructive">
                  {errorFor("name")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand-slug">URL Slug</Label>
              <Input
                id="brand-slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="auto-generated"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand-website">Website</Label>
              <Input
                id="brand-website"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="samsung.com"
                aria-invalid={Boolean(errorFor("website"))}
              />
              {errorFor("website") && (
                <p className="text-xs text-destructive">{errorFor("website")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-country">Country</Label>
              <Input
                id="brand-country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="South Korea"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input
                id="brand-logo"
                value={form.logo}
                onChange={(e) => set("logo", e.target.value)}
                placeholder="https://ik.imagekit.io/…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-banner">Banner URL</Label>
              <Input
                id="brand-banner"
                value={form.banner}
                onChange={(e) => set("banner", e.target.value)}
                placeholder="https://ik.imagekit.io/…"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-description">Description</Label>
            <Textarea
              id="brand-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand-meta-title">Meta Title</Label>
              <Input
                id="brand-meta-title"
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="brand-meta-desc">Meta Description</Label>
              <Input
                id="brand-meta-desc"
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
            <div className="flex items-center gap-2.5">
              <Label htmlFor="brand-order" className="text-sm font-semibold">
                Order
              </Label>
              <Input
                id="brand-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className="h-9 w-20"
              />
            </div>
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
