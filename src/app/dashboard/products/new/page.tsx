"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Cloud, CloudOff } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useProductStudio } from "@/features/product-studio/hooks/use-product-studio";
import { StudioLayout } from "@/features/product-studio/components/studio-layout";
import { GeneralSection } from "@/features/product-studio/components/sections/general-section";
import { DescriptionSection } from "@/features/product-studio/components/sections/description-section";
import { PricingSection } from "@/features/product-studio/components/sections/pricing-section";
import { InventorySection } from "@/features/product-studio/components/sections/inventory-section";
import { VariantsSection } from "@/features/product-studio/components/sections/variants-section";
import { MediaSection } from "@/features/product-studio/components/sections/media-section";
import { SEOSection } from "@/features/product-studio/components/sections/seo-section";
import { StudioRightSidebar } from "@/features/product-studio/components/sidebar/studio-right-sidebar";

export default function ProductStudioPage(): React.ReactElement {
  const {
    form, update,
    handleSave, handlePublish, handlePreview,
    saving, saveState,
    activeSection, scrollToSection,
    sections,
  } = useProductStudio();

  const saveIcon = saveState === "saving"
    ? <Cloud className="h-3 w-3 animate-pulse" />
    : saveState === "saved"
      ? <Cloud className="h-3 w-3 text-success" />
      : saveState === "error"
        ? <CloudOff className="h-3 w-3 text-destructive" />
        : <Cloud className="h-3 w-3" />;

  const saveLabel = saveState === "saving" ? "Saving…"
    : saveState === "saved" ? "Autosave ready"
    : saveState === "error" ? "Save error"
    : "Unsaved changes";

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3">
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
              {form.name.trim() || "Untitled product"}
            </h1>
            <Badge variant="muted">Studio</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            {saveIcon} {saveLabel}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" disabled={saving} onClick={handleSave}>
          Save
        </Button>
        <Button variant="outline" size="sm" disabled onClick={handlePreview}>
          Preview
        </Button>
        <Button size="sm" disabled={saving} onClick={handlePublish}>
          Publish
        </Button>
      </div>
    </div>
  );

  const main = (
    <>
      <div className="flex gap-1 overflow-x-auto ws-scroll pb-1 lg:hidden">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSection(s.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              activeSection === s.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <GeneralSection
        name={form.name}
        onNameChange={(v) => update("name", v)}
        sku={form.sku}
        onSkuChange={(v) => update("sku", v)}
        shortDescription={form.shortDescription}
        onShortDescriptionChange={(v) => update("shortDescription", v)}
        productModel={form.productModel}
        onProductModelChange={(v) => update("productModel", v)}
        barcode={form.barcode}
        onBarcodeChange={(v) => update("barcode", v)}
      />

      <DescriptionSection
        value={form.richDescription}
        onChange={(v) => update("richDescription", v)}
      />

      <PricingSection
        costPrice={form.costPrice}
        onCostPriceChange={(v) => update("costPrice", v)}
        sellingPrice={form.sellingPrice}
        onSellingPriceChange={(v) => update("sellingPrice", v)}
        wholesalePrice={form.wholesalePrice}
        onWholesalePriceChange={(v) => update("wholesalePrice", v)}
        resellerPrice={form.resellerPrice}
        onResellerPriceChange={(v) => update("resellerPrice", v)}
        comparePrice={form.comparePrice}
        onComparePriceChange={(v) => update("comparePrice", v)}
      />

      <InventorySection
        sku={form.inventorySku}
        onSkuChange={(v) => update("inventorySku", v)}
        barcode={form.inventoryBarcode}
        onBarcodeChange={(v) => update("inventoryBarcode", v)}
        stock={form.stock}
        onStockChange={(v) => update("stock", v)}
        lowStockThreshold={form.lowStockThreshold}
        onLowStockThresholdChange={(v) => update("lowStockThreshold", v)}
      />

      <VariantsSection
        variants={form.variants}
        onChange={(v) => update("variants", v)}
        baseSku={form.sku}
      />

      <MediaSection
        items={form.media}
        onChange={(v) => update("media", v)}
      />

      <SEOSection
        metaTitle={form.metaTitle}
        onMetaTitleChange={(v) => update("metaTitle", v)}
        metaDescription={form.metaDescription}
        onMetaDescriptionChange={(v) => update("metaDescription", v)}
        metaKeywords={form.metaKeywords}
        onMetaKeywordsChange={(v) => update("metaKeywords", v)}
        slug={form.slug}
        onSlugChange={(v) => update("slug", v)}
        ogImage={form.ogImage}
        onOgImageChange={(v) => update("ogImage", v)}
      />
    </>
  );

  const sidebar = (
    <StudioRightSidebar
      status={form.status}
      visibility={form.visibility}
      onVisibilityChange={(v) => update("visibility", v)}
      onStatusChange={(v) => update("status", v)}
      onPublish={handlePublish}
      onSave={handleSave}
      onPreview={handlePreview}
      saving={saving}
      saveState={saveState}
      productName={form.name}
      productSku={form.sku}
      sections={sections}
      activeSection={activeSection}
      onSectionClick={scrollToSection}
    />
  );

  return <StudioLayout header={header} main={main} sidebar={sidebar} />;
}
