"use client";

import * as React from "react";
import {
  Zap,
  ImagePlus,
  DollarSign,
  Package,
  Layers,
  Building2,
  FileText,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTaxonomy } from "@/features/catalog/hooks/use-taxonomy";
import type { StudioFormState } from "../hooks/use-product-studio";

interface StudioQuickCreateProps {
  form: StudioFormState;
  update: (field: keyof StudioFormState, value: unknown) => void;
  bulkUpdate: (partial: Partial<StudioFormState>) => void;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  saving: boolean;
  onSwitchToAdvanced: () => void;
}

export function StudioQuickCreate({
  form,
  update,
  bulkUpdate,
  onSave,
  onPublish,
  saving,
  onSwitchToAdvanced,
}: StudioQuickCreateProps) {
  const { flatCategories, brands, loading: taxonomyLoading } = useTaxonomy();
  const costNum = parseFloat(form.costPrice) || 0;
  const autoSelling = costNum > 0 ? (costNum * 1.3).toFixed(0) : "";
  const autoReseller = costNum > 0 ? (costNum * 1.2).toFixed(0) : "";
  const autoWholesale = costNum > 0 ? (costNum * 1.12).toFixed(0) : "";

  const handleQuickSubmit = async (publishImmediate = false) => {
    if (!form.name.trim()) {
      toast.error("Product Name is required (প্রোডাক্টের নাম আবশ্যক)");
      return;
    }
    if (!form.costPrice || costNum <= 0) {
      toast.error("Cost Price is required (ক্রয় মূল্য আবশ্যক)");
      return;
    }

    bulkUpdate({
      sellingPrice: form.sellingPrice || autoSelling,
      resellerPrice: form.resellerPrice || autoReseller,
      wholesalePrice: form.wholesalePrice || autoWholesale,
      status: publishImmediate ? "active" : "draft",
    });

    if (publishImmediate) {
      await onPublish();
    } else {
      await onSave();
    }
  };

  const primaryImageUrl = form.media && form.media.length > 0 ? form.media[0].url : "";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center space-x-2">
              <span>Express Quick Create Workspace</span>
              <span className="text-[10px] bg-amber-500 text-amber-950 px-2 py-0.5 rounded font-extrabold uppercase">
                High-Speed Express
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter core product details. SKU, Slug, & Tier Prices auto-calculate instantly.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onSwitchToAdvanced}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground text-xs font-bold"
        >
          <span>Advanced Mode</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Core Quick Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field 1: Product Name */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>1. Product Name (প্রোডাক্টের নাম) *</span>
            <span className="text-[10px] text-amber-400 font-semibold">
              Auto-generates SKU & Slug
            </span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. T900 Ultra Smart Watch - Gold Edition"
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground font-medium text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Field 2: Category Select */}
        <div className="space-y-2">
          <label
            htmlFor="quick-category"
            className="text-xs font-bold text-foreground flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Category (ক্যাটাগরি) *</span>
          </label>
          {/* A real picker, not free text: these fields hold ObjectId references, and
              typing a name into them wrote an unresolvable id that failed on save. */}
          <select
            id="quick-category"
            value={form.categoryId}
            onChange={(e) => {
              const selected = flatCategories.find((c) => c.id === e.target.value);
              update("categoryId", e.target.value);
              update("categoryName", selected?.name ?? "");
            }}
            disabled={taxonomyLoading}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-medium text-sm focus:outline-none focus:border-amber-500 transition disabled:opacity-60"
          >
            <option value="">
              {taxonomyLoading ? "Loading categories…" : "— Select a category —"}
            </option>
            {flatCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {"\u00A0".repeat(category.depth * 3)}
                {category.depth > 0 ? "└ " : ""}
                {category.name}
              </option>
            ))}
          </select>
          {!taxonomyLoading && flatCategories.length === 0 && (
            <Link
              href="/dashboard/catalog/categories"
              target="_blank"
              className="inline-block text-[11px] font-bold text-amber-600 dark:text-amber-500 hover:underline"
            >
              + Create your first category
            </Link>
          )}
        </div>

        {/* Field 3: Brand / Manufacturer */}
        <div className="space-y-2">
          <label
            htmlFor="quick-brand"
            className="text-xs font-bold text-foreground flex items-center space-x-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>3. Brand / Manufacturer (ব্র্যান্ড)</span>
          </label>
          <select
            id="quick-brand"
            value={form.brandId}
            onChange={(e) => {
              const selected = brands.find((b) => b.id === e.target.value);
              update("brandId", e.target.value);
              update("brandName", selected?.name ?? "");
            }}
            disabled={taxonomyLoading}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-medium text-sm focus:outline-none focus:border-amber-500 transition disabled:opacity-60"
          >
            <option value="">{taxonomyLoading ? "Loading brands…" : "— No brand —"}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {!taxonomyLoading && brands.length === 0 && (
            <Link
              href="/dashboard/catalog/brands"
              target="_blank"
              className="inline-block text-[11px] font-bold text-amber-600 dark:text-amber-500 hover:underline"
            >
              + Create your first brand
            </Link>
          )}
        </div>

        {/* Field 4: Initial Stock */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-amber-500" />
            <span>4. Initial Stock (প্রাথমিক স্টক) *</span>
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            placeholder="50"
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-medium text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Field 5: Cost Price & Auto-Calculated Tiers */}
        <div className="space-y-2 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border">
          <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4" />
            <span>5. Cost Price (ক্রয় মূল্য ৳) *</span>
          </label>
          <input
            type="number"
            value={form.costPrice}
            onChange={(e) => update("costPrice", e.target.value)}
            placeholder="800"
            className="w-full px-4 py-2.5 bg-card border border-amber-500/30 rounded-xl text-amber-400 font-extrabold text-base focus:outline-none focus:border-amber-500 transition"
          />

          {/* Auto Tier Preview */}
          {costNum > 0 && (
            <div className="pt-3 grid grid-cols-3 gap-2 text-xs border-t border-border/80">
              <div className="bg-muted p-2.5 rounded-lg border border-border text-center">
                <span className="block text-[10px] text-muted-foreground font-semibold uppercase">
                  Retail (+30%)
                </span>
                <span className="font-black text-amber-400 text-sm">৳{autoSelling}</span>
              </div>
              <div className="bg-muted p-2.5 rounded-lg border border-border text-center">
                <span className="block text-[10px] text-muted-foreground font-semibold uppercase">
                  Reseller (+20%)
                </span>
                <span className="font-black text-blue-400 text-sm">৳{autoReseller}</span>
              </div>
              <div className="bg-muted p-2.5 rounded-lg border border-border text-center">
                <span className="block text-[10px] text-muted-foreground font-semibold uppercase">
                  Wholesale (+12%)
                </span>
                <span className="font-black text-emerald-400 text-sm">৳{autoWholesale}</span>
              </div>
            </div>
          )}
        </div>

        {/* Field 6: Primary Image Upload / URL */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
            <ImagePlus className="w-4 h-4 text-amber-500" />
            <span>6. Primary Image (ছবি লিঙ্ক / আপলোড) *</span>
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={primaryImageUrl}
              onChange={(e) => {
                const url = e.target.value;
                update("media", url ? [{ url, type: "image", isFeatured: true }] : []);
              }}
              placeholder="https://ik.imagekit.io/dropshop/products/watch.jpg"
              className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-medium text-sm focus:outline-none focus:border-amber-500 transition"
            />
            {primaryImageUrl && (
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-amber-500/50 shrink-0">
                <img src={primaryImageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Field 7: Short Summary Pitch */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>7. Short Summary Pitch (সংক্ষিপ্ত বিবরণ)</span>
          </label>
          <textarea
            rows={2}
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            placeholder="Brief summary used for store cards, search snippets, and mobile catalog..."
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-medium text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Field 8: High-Visibility Promo Notice */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>8. Special Promo Notice (বিশেষ নোটিশ)</span>
          </label>
          <input
            type="text"
            value={form.notice || ""}
            onChange={(e) => update("notice", e.target.value)}
            placeholder="e.g. ৩ দিনের মধ্যে ফ্রি ডেলিভারি / ১০০% অরিজিনাল অফিশিয়াল ওয়ারেন্টি"
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-amber-300 font-medium text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Field 9: Status Toggle */}
        <div className="space-y-2 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-foreground block">
              9. Initial Status (স্ট্যাটাস) *
            </label>
            <span className="text-[11px] text-muted-foreground block">
              {form.status === "active"
                ? "Product will be live on storefront immediately"
                : "Product saved as Draft"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => update("status", form.status === "active" ? "draft" : "active")}
            className="flex items-center space-x-2 text-xs font-black uppercase px-4 py-2 rounded-xl transition border border-amber-500/40 bg-amber-500/10 text-amber-400"
          >
            {form.status === "active" ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">ACTIVE (পাবলিশড)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">DRAFT (খসড়া)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
        <Button
          type="button"
          disabled={saving}
          onClick={() => handleQuickSubmit(false)}
          className="bg-muted hover:bg-muted/80 text-foreground text-xs font-bold px-5 py-2.5 rounded-xl"
        >
          Save Draft (খসড়া)
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => handleQuickSubmit(true)}
          className="bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20"
        >
          Publish Product Now (পাবলিশ করুন)
        </Button>
      </div>
    </div>
  );
}
