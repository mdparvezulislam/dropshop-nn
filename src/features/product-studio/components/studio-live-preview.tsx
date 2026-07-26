"use client";

import * as React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Eye,
} from "lucide-react";
import type { StudioFormState } from "../hooks/use-product-studio";

interface StudioLivePreviewProps {
  form: StudioFormState;
  className?: string;
}

export function StudioLivePreview({ form, className = "" }: StudioLivePreviewProps) {
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");

  const cost = parseFloat(form.costPrice) || 0;
  const selling = parseFloat(form.sellingPrice) || 0;
  const compare = parseFloat(form.comparePrice) || 0;
  const wholesale = parseFloat(form.wholesalePrice) || 0;
  const reseller = parseFloat(form.resellerPrice) || 0;

  const discountPercent =
    compare > selling && compare > 0 ? Math.round(((compare - selling) / compare) * 100) : 0;

  const featuredImage =
    form.media && form.media.length > 0
      ? form.media.find((m) => m.isFeatured)?.url || form.media[0].url
      : "https://placehold.co/600x600/f8fafc/64748b?text=Product+Image";

  return (
    <div
      className={`flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-2xl ${className}`}
    >
      {/* Device Switcher Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 dark:bg-slate-950 border-b border-border dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-semibold text-amber-400 flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Storefront Live Preview (লাইভ প্রিভিউ)</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-muted/30 dark:bg-slate-900 p-1 rounded-lg border border-border dark:border-slate-800">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 ${
              device === "desktop"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`p-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 ${
              device === "tablet"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 ${
              device === "mobile"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* Preview Viewport Frame */}
      <div className="flex-1 bg-muted/20 dark:bg-slate-950 p-4 overflow-auto flex justify-center items-start">
        <div
          className={`bg-card text-foreground transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-border ${
            device === "desktop"
              ? "w-full max-w-4xl"
              : device === "tablet"
                ? "w-[640px]"
                : "w-[360px]"
          }`}
        >
          {/* Mock Header Navbar */}
          <div className="bg-slate-900 text-white px-4 py-2 text-xs flex justify-between items-center border-b border-slate-800">
            <span className="font-bold tracking-wide text-amber-400">DropshopNN Store</span>
            <span className="text-muted-foreground">
              bd.dropshop.com/products/{form.slug || "sample-slug"}
            </span>
          </div>

          {/* Product Details Layout */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Notice Bar */}
            {form.notice && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{form.notice}</span>
              </div>
            )}

            <div className={`grid gap-6 ${device === "desktop" ? "grid-cols-2" : "grid-cols-1"}`}>
              {/* Product Gallery */}
              <div className="space-y-3">
                <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border group">
                  <img
                    src={featuredImage}
                    alt={form.name || "Product Preview"}
                    className="w-full h-full object-cover"
                  />
                  {discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {form.badges && form.badges.length > 0 && (
                    <div className="absolute top-3 right-3 flex flex-col space-y-1">
                      {form.badges.map((badge: string) => (
                        <span
                          key={badge}
                          className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow"
                        >
                          {badge.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {form.media && form.media.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-1">
                    {form.media.map((item, idx) => (
                      <div
                        key={idx}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                          item.isFeatured ? "border-amber-500" : "border-border"
                        }`}
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                    {form.categoryName || "Category"}
                  </span>
                  <h1 className="text-xl font-black text-foreground leading-snug mt-0.5">
                    {form.name || "Product Name Title"}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    SKU: {form.sku || "DS-PROD-0000"}
                  </p>
                </div>

                {/* Pricing Box */}
                <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-2">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-2xl font-black text-amber-600">
                      ৳{selling > 0 ? selling.toLocaleString("en-BD") : "0"}
                    </span>
                    {compare > selling && (
                      <span className="text-sm font-semibold text-muted-foreground line-through">
                        ৳{compare.toLocaleString("en-BD")}
                      </span>
                    )}
                  </div>

                  {/* Reseller & Wholesale Pricing Badges */}
                  <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <span className="block text-[10px] font-bold text-blue-600 uppercase">
                        রিসেলার মূল্য (Reseller)
                      </span>
                      <span className="font-extrabold text-blue-950">
                        ৳{reseller > 0 ? reseller.toLocaleString("en-BD") : "N/A"}
                      </span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                        পাইকারি মূল্য (Wholesale)
                      </span>
                      <span className="font-extrabold text-emerald-950">
                        ৳{wholesale > 0 ? wholesale.toLocaleString("en-BD") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                {form.shortDescription && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {form.shortDescription}
                  </p>
                )}

                {/* Variants Preview */}
                {form.variants && form.variants.length > 0 && form.variants[0].sku && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground block">
                      Available Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {form.variants.map((v, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-muted border border-border rounded-md text-xs font-semibold text-foreground"
                        >
                          {(v as any).name || v.sku}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock & Delivery Info */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                  <span className="font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock ({form.stock} Units)</span>
                  </span>
                  <span className="text-muted-foreground font-medium flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cash on Delivery</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Preview */}
            {form.specifications && form.specifications.length > 0 && (
              <div className="pt-4 border-t border-border space-y-2">
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Specifications (স্পেসিফিকেশন)
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-3 rounded-lg border border-border">
                  {form.specifications.map((spec, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between py-1 border-b border-border/60 last:border-0"
                    >
                      <span className="font-semibold text-muted-foreground">
                        {spec.key || spec.label}:
                      </span>
                      <span className="font-extrabold text-foreground">{String(spec.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
