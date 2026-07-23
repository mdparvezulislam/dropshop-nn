"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/workspace/page-header";

interface VariantRow {
  id: string;
  sku: string;
  label: string;
  price: string;
  stock: string;
  weight: string;
}

const NEW_VARIANT: VariantRow = { id: crypto.randomUUID(), sku: "", label: "", price: "", stock: "", weight: "" };

export default function SupplierNewProductPage(): React.ReactElement {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    sku: "",
    shortDescription: "",
    richDescription: "",
    productModel: "",
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    stock: "0",
    lowStockThreshold: "5",
  });
  const [variants, setVariants] = React.useState<VariantRow[]>([{ ...NEW_VARIANT }]);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const updateVariant = (id: string, field: keyof VariantRow, value: string) =>
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, [field]: value } : v)));

  const addVariant = () => setVariants((vs) => [...vs, { ...NEW_VARIANT, id: crypto.randomUUID() }]);
  const removeVariant = (id: string) => setVariants((vs) => (vs.length > 1 ? vs.filter((v) => v.id !== id) : vs));

  async function handleSubmit(status: "draft" | "pending_review") {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    const validVariants = variants
      .filter((v) => v.sku.trim())
      .map((v) => ({
        sku: v.sku.trim(),
        label: v.label.trim() || undefined,
        price: v.price ? Math.round(parseFloat(v.price) * 100) : undefined,
        stock: v.stock ? parseInt(v.stock, 10) : undefined,
        weight: v.weight ? parseFloat(v.weight) : undefined,
      }));

    if (validVariants.length === 0) {
      toast.error("At least one variant with SKU is required");
      return;
    }

    setSaving(true);
    try {
      const { saveStudioProductAction } = await import("@/features/product-studio/actions/studio-actions");
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        richDescription: form.richDescription.trim() || undefined,
        productModel: form.productModel.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        status,
        visibility: "supplier_only" as const,
        tags: [],
        variants: validVariants.map((v, i) => ({
          id: crypto.randomUUID(),
          sku: v.sku,
          label: v.label,
          price: v.price,
          stock: v.stock,
          weight: v.weight,
          sortOrder: i,
        })),
        media: [],
        pricing: {
          costPrice: form.costPrice ? Math.round(parseFloat(form.costPrice) * 100) : undefined,
          sellingPrice: form.sellingPrice ? Math.round(parseFloat(form.sellingPrice) * 100) : undefined,
          wholesalePrice: form.wholesalePrice ? Math.round(parseFloat(form.wholesalePrice) * 100) : undefined,
        },
        inventory: {
          stock: parseInt(form.stock || "0", 10),
          lowStockThreshold: parseInt(form.lowStockThreshold || "5", 10),
        },
      };

      const res = await saveStudioProductAction(payload);
      if (res.success) {
        toast.success(status === "draft" ? "Product saved as draft" : "Product submitted for review");
        router.push("/supplier/products");
      } else {
        toast.error(res.error ?? "Failed to save product");
      }
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/supplier/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Submit New Product" description="Add a product for review and approval." />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">General Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
                  <Input placeholder="e.g. Samsung Galaxy S24" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">SKU *</label>
                  <Input placeholder="e.g. SAMS24-BLK-128" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Model</label>
                  <Input placeholder="e.g. SM-S921B" value={form.productModel} onChange={(e) => update("productModel", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Barcode / GTIN</label>
                  <Input placeholder="e.g. 8806095350147" value={form.barcode} onChange={(e) => update("barcode", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Short Description</label>
                <Textarea placeholder="Brief product description..." value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full Description</label>
                <Textarea placeholder="Detailed product description..." value={form.richDescription} onChange={(e) => update("richDescription", e.target.value)} rows={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cost Price (৳)</label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Selling Price (৳)</label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Wholesale Price (৳)</label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.wholesalePrice} onChange={(e) => update("wholesalePrice", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Variants</CardTitle>
              <Button variant="outline" size="sm" onClick={addVariant}>+ Add Variant</Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id} className="rounded-lg border border-border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Variant {idx + 1}</span>
                    {variants.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => removeVariant(v.id)}>Remove</Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input placeholder="SKU *" value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} />
                    <Input placeholder="Label (e.g. Black 128GB)" value={v.label} onChange={(e) => updateVariant(v.id, "label", e.target.value)} />
                    <Input type="number" step="0.01" min="0" placeholder="Price (৳)" value={v.price} onChange={(e) => updateVariant(v.id, "price", e.target.value)} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input type="number" min="0" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(v.id, "stock", e.target.value)} />
                    <Input type="number" step="0.01" min="0" placeholder="Weight (kg)" value={v.weight} onChange={(e) => updateVariant(v.id, "weight", e.target.value)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Initial Stock</label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Low Stock Threshold</label>
                <Input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full gap-1.5" variant="outline" disabled={saving} onClick={() => handleSubmit("draft")}>
                {saving ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                Save as Draft
              </Button>
              <Button className="w-full gap-1.5" disabled={saving} onClick={() => handleSubmit("pending_review")}>
                {saving ? <Spinner className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                Submit for Review
              </Button>
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Submitted products will be reviewed before going live.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
