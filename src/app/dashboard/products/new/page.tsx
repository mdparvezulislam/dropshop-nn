"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createProductAction } from "@/features/product/actions/product-actions";
import { CreateLayout } from "@/shared/components/workspace/create-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { FormField } from "@/shared/components/forms/form-field";
import { TagsInput } from "@/shared/components/forms/tags-input";
import { CurrencyInput } from "@/shared/components/forms/currency-input";
import { NumberInput } from "@/shared/components/forms/number-input";
import { RichTextEditor } from "@/shared/components/editor/rich-text-editor";
import { StatusChip } from "@/shared/components/workspace/status-chip";
import { cn } from "@/shared/utils/cn";

type VariantRow = {
  id: string;
  color: string;
  size: string;
  sku: string;
};

type AttrRow = { id: string; key: string; value: string; group: string };

export default function ProductStudioPage(): React.ReactElement {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeSection, setActiveSection] = React.useState("general");

  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [fullDescription, setFullDescription] = React.useState("");
  const [productModel, setProductModel] = React.useState("");
  const [barcode, setBarcode] = React.useState("");
  const [supplierId, setSupplierId] = React.useState("");
  const [brandId, setBrandId] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [visibility, setVisibility] = React.useState("public");
  const [tags, setTags] = React.useState<string[]>([]);
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isTrending, setIsTrending] = React.useState(false);
  const [isNewArrival, setIsNewArrival] = React.useState(true);
  const [isBestSeller, setIsBestSeller] = React.useState(false);
  const [sellingPrice, setSellingPrice] = React.useState("");
  const [comparePrice, setComparePrice] = React.useState("");
  const [costPrice, setCostPrice] = React.useState("");
  const [stock, setStock] = React.useState("0");
  const [reorderLevel, setReorderLevel] = React.useState("5");
  const [warranty, setWarranty] = React.useState("12 months");
  const [returnPolicy, setReturnPolicy] = React.useState("7-day return");
  const [shippingNote, setShippingNote] = React.useState("Ships in 2–4 business days");
  const [mediaUrls, setMediaUrls] = React.useState<string[]>([]);
  const [mediaDraft, setMediaDraft] = React.useState("");
  const [variants, setVariants] = React.useState<VariantRow[]>([
    { id: "v1", color: "", size: "", sku: "" },
  ]);
  const [attributes, setAttributes] = React.useState<AttrRow[]>([
    { id: "a1", key: "", value: "", group: "specification" },
  ]);

  // Simulated autosave indicator (UI only — no business logic change)
  React.useEffect(() => {
    if (!name && !sku) return;
    setSaveState("saving");
    const t = window.setTimeout(() => setSaveState("saved"), 800);
    return () => window.clearTimeout(t);
  }, [name, sku, shortDescription, fullDescription]);

  const sections = [
    { id: "general", label: "General" },
    { id: "description", label: "Description" },
    { id: "gallery", label: "Gallery" },
    { id: "pricing", label: "Pricing" },
    { id: "inventory", label: "Inventory" },
    { id: "variants", label: "Variants" },
    { id: "attributes", label: "Specs" },
  ];

  const scrollTo = (id: string): void => {
    setActiveSection(id);
    document.getElementById(`studio-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buildPayload = () => {
    const variantList = variants
      .filter((v) => v.sku.trim())
      .map((v) => ({
        color: v.color || undefined,
        size: v.size || undefined,
        sku: v.sku.trim(),
      }));

    return {
      name: name.trim(),
      sku: sku.trim() || variantList[0]?.sku || `SKU-${Date.now()}`,
      shortDescription: shortDescription || undefined,
      fullDescription: fullDescription || undefined,
      productModel: productModel || undefined,
      barcode: barcode || undefined,
      supplierId: supplierId.trim(),
      brandId: brandId || undefined,
      categoryId: categoryId || undefined,
      visibility: visibility as "public" | "private" | "hidden" | "supplier_only",
      variants: variantList.length > 0 ? variantList : [{ sku: sku.trim() || `SKU-${Date.now()}` }],
      media: mediaUrls.map((url, i) => ({
        url,
        type: "image" as const,
        isFeatured: i === 0,
        sortOrder: i,
      })),
      attributes: attributes
        .filter((a) => a.key && a.value)
        .map((a) => ({
          key: a.key,
          value: a.value,
          group: (a.group || "general") as "specification" | "technical" | "general",
        })),
      tags,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
    };
  };

  const handleSave = async (mode: "draft" | "publish"): Promise<void> => {
    if (!name.trim()) {
      toast.error("Product title is required");
      scrollTo("general");
      return;
    }
    if (!supplierId.trim()) {
      toast.error("Supplier ID is required");
      return;
    }
    setSaving(true);
    try {
      const res = await createProductAction(buildPayload());
      if (res.success && res.data) {
        toast.success(mode === "publish" ? "Product created" : "Draft saved");
        router.push(`/dashboard/products/${res.data.id}`);
      } else {
        toast.error("Save failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-0">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard/products"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Back to products"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight truncate">
              {name.trim() || "Untitled product"}
            </h1>
            <Badge variant="muted">Studio</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            {saveState === "saving" ? (
              <>
                <Cloud className="h-3 w-3 animate-pulse" /> Saving…
              </>
            ) : saveState === "saved" ? (
              <>
                <Cloud className="h-3 w-3 text-success" /> Autosave ready
              </>
            ) : saveState === "error" ? (
              <>
                <CloudOff className="h-3 w-3 text-destructive" /> Save error
              </>
            ) : (
              <>
                <Cloud className="h-3 w-3" /> Unsaved changes track locally
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" disabled={saving} onClick={() => handleSave("draft")}>
          <Save className="h-3.5 w-3.5" /> Save draft
        </Button>
        <Button variant="outline" size="sm" type="button" disabled>
          <Eye className="h-3.5 w-3.5" /> Preview
        </Button>
        <Button size="sm" disabled={saving} onClick={() => handleSave("publish")}>
          <Send className="h-3.5 w-3.5" /> Publish
        </Button>
      </div>
    </div>
  );

  const main = (
    <>
      {/* Section nav (mobile) */}
      <div className="flex gap-1 overflow-x-auto ws-scroll pb-1 lg:hidden">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              activeSection === s.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card id="studio-general">
        <CardHeader>
          <CardTitle>General information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Product title" required className="sm:col-span-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. iPhone 16 Pro Max 256GB"
              className="h-11 text-base font-medium"
            />
          </FormField>
          <FormField label="Base SKU" required>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="APL-IPH16PM-256"
              className="font-mono"
            />
          </FormField>
          <FormField label="Model">
            <Input
              value={productModel}
              onChange={(e) => setProductModel(e.target.value)}
              placeholder="A3296"
            />
          </FormField>
          <FormField label="Barcode / GTIN">
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          </FormField>
          <FormField label="Short description" className="sm:col-span-2">
            <Textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-line pitch for listings and cards"
              rows={2}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card id="studio-description">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={fullDescription}
            onChange={setFullDescription}
            placeholder="Write a rich product story — features, specs narrative, care…"
            minHeight="16rem"
          />
        </CardContent>
      </Card>

      <Card id="studio-gallery">
        <CardHeader>
          <CardTitle>Product gallery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mediaUrls.map((url, i) => (
              <div
                key={url + i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 ? (
                  <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMediaUrls((m) => m.filter((_, j) => j !== i))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
              <span className="text-[11px]">Add image URL</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={mediaDraft}
              onChange={(e) => setMediaDraft(e.target.value)}
              placeholder="https://…"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!mediaDraft.trim()) return;
                setMediaUrls((m) => [...m, mediaDraft.trim()]);
                setMediaDraft("");
              }}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card id="studio-pricing">
          <CardHeader>
            <CardTitle>Pricing preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Display fields for studio UX. Master pricing is managed in Pricing module.
            </p>
            <FormField label="Selling price">
              <CurrencyInput value={sellingPrice} onChange={setSellingPrice} />
            </FormField>
            <FormField label="Compare-at">
              <CurrencyInput value={comparePrice} onChange={setComparePrice} />
            </FormField>
            <FormField label="Cost (reference)">
              <CurrencyInput value={costPrice} onChange={setCostPrice} />
            </FormField>
          </CardContent>
        </Card>

        <Card id="studio-inventory">
          <CardHeader>
            <CardTitle>Inventory preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Stock is owned by Inventory module after product exists.
            </p>
            <FormField label="Opening stock">
              <NumberInput value={stock} onChange={setStock} min={0} />
            </FormField>
            <FormField label="Reorder level">
              <NumberInput value={reorderLevel} onChange={setReorderLevel} min={0} />
            </FormField>
          </CardContent>
        </Card>
      </div>

      <Card id="studio-variants">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Variants</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((v) => [...v, { id: `v${Date.now()}`, color: "", size: "", sku: "" }])
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={v.id}
              className="grid gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto] items-end rounded-lg border border-border p-3"
            >
              <FormField label="Color">
                <Input
                  value={v.color}
                  onChange={(e) =>
                    setVariants((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, color: e.target.value } : r)),
                    )
                  }
                />
              </FormField>
              <FormField label="Size">
                <Input
                  value={v.size}
                  onChange={(e) =>
                    setVariants((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r)),
                    )
                  }
                />
              </FormField>
              <FormField label="Variant SKU" required>
                <Input
                  value={v.sku}
                  onChange={(e) =>
                    setVariants((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, sku: e.target.value } : r)),
                    )
                  }
                  className="font-mono"
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={variants.length <= 1}
                onClick={() => setVariants((rows) => rows.filter((_, i) => i !== idx))}
                aria-label="Remove variant"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="studio-attributes">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Attributes & specifications</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setAttributes((a) => [
                ...a,
                { id: `a${Date.now()}`, key: "", value: "", group: "specification" },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add row
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {attributes.map((a, idx) => (
            <div key={a.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]">
              <Input
                placeholder="Key"
                value={a.key}
                onChange={(e) =>
                  setAttributes((rows) =>
                    rows.map((r, i) => (i === idx ? { ...r, key: e.target.value } : r)),
                  )
                }
              />
              <Input
                placeholder="Value"
                value={a.value}
                onChange={(e) =>
                  setAttributes((rows) =>
                    rows.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r)),
                  )
                }
              />
              <select
                value={a.group}
                onChange={(e) =>
                  setAttributes((rows) =>
                    rows.map((r, i) => (i === idx ? { ...r, group: e.target.value } : r)),
                  )
                }
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
              >
                <option value="specification">Spec</option>
                <option value="technical">Technical</option>
                <option value="general">General</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAttributes((rows) => rows.filter((_, i) => i !== idx))}
                aria-label="Remove attribute"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  const sidebar = (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <StatusChip label="draft" tone="warning" />
          </div>
          <FormField label="Visibility">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="hidden">Hidden</option>
              <option value="supplier_only">Supplier only</option>
            </select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FormField label="Supplier ID" required>
            <Input
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="24-char ObjectId"
              className="font-mono text-xs"
            />
          </FormField>
          <FormField label="Category ID">
            <Input
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="font-mono text-xs"
            />
          </FormField>
          <FormField label="Brand ID">
            <Input
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="font-mono text-xs"
            />
          </FormField>
          <FormField label="Tags">
            <TagsInput value={tags} onChange={setTags} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Featured flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ["Featured", isFeatured, setIsFeatured],
              ["Trending", isTrending, setIsTrending],
              ["New arrival", isNewArrival, setIsNewArrival],
              ["Best seller", isBestSeller, setIsBestSeller],
            ] as const
          ).map(([label, val, set]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch checked={val} onCheckedChange={set} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Shipping & policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FormField label="Shipping">
            <Input value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} />
          </FormField>
          <FormField label="Warranty">
            <Input value={warranty} onChange={(e) => setWarranty(e.target.value)} />
          </FormField>
          <FormField label="Return policy">
            <Input value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground text-xs">
              {mediaUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrls[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                "No cover image"
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold line-clamp-2">{name || "Product title"}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{sku || "SKU"}</p>
              {sellingPrice ? (
                <p className="text-sm font-semibold text-primary">${sellingPrice}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="hidden lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Jump to
        </p>
        <div className="space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={cn(
                "w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                activeSection === s.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Catalog only · Pricing & stock live in dedicated modules after create
      </p>
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" disabled={saving} onClick={() => handleSave("draft")}>
          Save draft
        </Button>
        <Button variant="outline" size="sm" disabled>
          Preview
        </Button>
        <Button size="sm" disabled={saving} onClick={() => handleSave("publish")}>
          {saving ? "Saving…" : "Publish"}
        </Button>
      </div>
    </div>
  );

  return <CreateLayout header={header} main={main} sidebar={sidebar} footer={footer} />;
}
