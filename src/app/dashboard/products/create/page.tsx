"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  NewStudioLayout,
  StudioTabPanel,
} from "@/features/product-studio/components/new-studio-layout";
import { StudioHeader } from "@/features/product-studio/components/studio-header";
import { StudioQuickCreate } from "@/features/product-studio/components/studio-quick-create";
import { StudioLivePreview } from "@/features/product-studio/components/studio-live-preview";
import { useProductStudio } from "@/features/product-studio/hooks/use-product-studio";
import { useProductDraft } from "@/features/product-studio/hooks/use-product-draft";
import {
  checkSkuUniquenessAction,
  checkSlugUniquenessAction,
} from "@/features/catalog/actions/product-actions";

import { GeneralSection } from "@/features/product-studio/components/sections/general-section";
import { CategorySection } from "@/features/product-studio/components/sections/category-section";
import { BrandSection } from "@/features/product-studio/components/sections/brand-section";
import { VariantStudioSection } from "@/features/product-studio/components/sections/variant-studio-section";
import { InlineSpecEditor } from "@/features/product-studio/components/inline-spec-editor";
import { FeaturesEditor } from "@/features/product-studio/components/features-editor";
import { ParserBar } from "@/features/product-studio/components/parser-bar";
import { UrlImportBar } from "@/features/product-studio/components/url-import-bar";
import { MediaSection } from "@/features/product-studio/components/sections/media-section";
import { PricingSection } from "@/features/product-studio/components/sections/pricing-section";
import { InventorySection } from "@/features/product-studio/components/sections/inventory-section";
import { CollectionsChannelsSection } from "@/features/product-studio/components/sections/collections-channels-section";
import { BadgesStudioSection } from "@/features/product-studio/components/sections/badges-studio-section";
import { SEOAdvancedSection } from "@/features/product-studio/components/sections/seo-advanced-section";

import { Zap, Sliders, Eye, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Lazy-load heavy components
const LazyDescriptionSection = dynamic(
  () =>
    import("@/features/product-studio/components/sections/description-section").then(
      (m) => m.DescriptionSection,
    ),
  {
    loading: () => (
      <div className="p-4 rounded-xl border border-border bg-card text-muted-foreground text-xs flex items-center gap-2">
        <Spinner size="sm" />
        <span>Loading Rich Text Editor…</span>
      </div>
    ),
    ssr: false,
  },
);

const LazySupplierStudioSection = dynamic(
  () =>
    import("@/features/product-studio/components/sections/supplier-studio-section").then(
      (m) => m.SupplierStudioSection,
    ),
  { ssr: false },
);

const LazyPublishingStudioSection = dynamic(
  () =>
    import("@/features/product-studio/components/sections/publishing-studio-section").then(
      (m) => m.PublishingStudioSection,
    ),
  { ssr: false },
);

export default function CreateProductStudioPage(): React.ReactElement {
  const {
    form,
    update,
    bulkUpdate,
    handleAutoGenerateSKU,
    handleApplyAutoPricing,
    handleResetAutoPricing,
    handleMagicParse,
    isParsing,
    parseSummary,
    handleSave,
    handlePublish,
    handlePreview,
    saving,
    saveState,
    healthResult,
    activeSection,
    setActiveSection,
    scrollToSection,
    sections,
  } = useProductStudio();

  const [mode, setMode] = React.useState<"quick" | "advanced">("quick");
  const [showPreview, setShowPreview] = React.useState(false);
  const [skuUniqueError, setSkuUniqueError] = React.useState<string | null>(null);
  const [slugUniqueError, setSlugUniqueError] = React.useState<string | null>(null);

  const { hasUnsavedDraft, loadDraftFromLocalStorage, clearDraft } = useProductDraft("new");

  // Background Uniqueness Check for SKU
  React.useEffect(() => {
    if (!form.sku.trim()) return;
    const timer = setTimeout(async () => {
      const res = await checkSkuUniquenessAction(form.sku);
      if (res.success && res.data && !res.data.isUnique) {
        setSkuUniqueError("SKU is already in use by another product");
      } else {
        setSkuUniqueError(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.sku]);

  // Background Uniqueness Check for Slug
  React.useEffect(() => {
    if (!form.slug.trim()) return;
    const timer = setTimeout(async () => {
      const res = await checkSlugUniquenessAction(form.slug);
      if (res.success && res.data && !res.data.isUnique) {
        setSlugUniqueError("URL Slug is already in use");
      } else {
        setSlugUniqueError(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.slug]);

  const header = (
    <StudioHeader
      productName={form.name}
      onNameChange={(val) => update("name", val)}
      status={form.status}
      saveState={saveState}
      saving={saving}
      onSave={handleSave}
      onPublish={handlePublish}
      onPreview={() => setShowPreview(!showPreview)}
      isEditing={false}
    />
  );

  // Alert banner (draft recovery + uniqueness warnings)
  const alert = (
    <>
      {hasUnsavedDraft && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">
                Unsaved Local Draft Found (খসড়া তথ্য পাওয়া গেছে)
              </span>
              <span className="text-amber-600 dark:text-amber-300/80">
                Would you like to restore your previously edited product details?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const restored = loadDraftFromLocalStorage();
                if (restored) bulkUpdate(restored);
              }}
              className="border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore Draft
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearDraft}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {(skuUniqueError || slugUniqueError) && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
          {skuUniqueError && <p>• {skuUniqueError}</p>}
          {slugUniqueError && <p>• {slugUniqueError}</p>}
        </div>
      )}
    </>
  );

  // ── Quick Create Mode ──
  if (mode === "quick") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {header}
        <div className="flex-1 mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 py-5">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between mb-5 p-3 bg-muted border border-border rounded-xl">
            <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setMode("quick")}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 bg-amber-500 text-amber-950 shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Create (6 Core Fields)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("advanced")}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Advanced Mode (ফুল স্টুডিও)</span>
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="border-border text-xs font-bold"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
            </Button>
          </div>

          {alert}
          <StudioQuickCreate
            form={form}
            update={update}
            bulkUpdate={bulkUpdate}
            onSave={handleSave}
            onPublish={handlePublish}
            saving={saving}
            onSwitchToAdvanced={() => setMode("advanced")}
          />
          {showPreview && <StudioLivePreview form={form} className="mt-6" />}
        </div>
      </div>
    );
  }

  // ── Advanced Mode (Tab-based Layout) ──
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header}

      <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 pt-5">
        {/* Mode Switcher + Preview */}
        <div className="flex items-center justify-between mb-5 p-3 bg-muted border border-border rounded-xl">
          <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Create</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("advanced")}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 bg-amber-500 text-amber-950 shadow-md"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Mode (ফুল স্টুডিও)</span>
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-border text-xs font-bold"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
          </Button>
        </div>
      </div>

      <NewStudioLayout
        status={form.status}
        visibility={form.visibility}
        onVisibilityChange={(v) => update("visibility", v)}
        onStatusChange={(v) => update("status", v)}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => setShowPreview(!showPreview)}
        saving={saving}
        saveState={saveState}
        productName={form.name}
        productSku={form.sku}
        healthResult={healthResult}
        sections={sections}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        alert={alert}
        urlImportBar={<UrlImportBar bulkUpdate={bulkUpdate} />}
        parserBar={
          <ParserBar onParse={handleMagicParse} isParsing={isParsing} summary={parseSummary} />
        }
      >
        {/* ── Tab: Basic ── */}
        <StudioTabPanel value="basic">
          <div className="space-y-5">
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
              onAutoGenerateSKU={handleAutoGenerateSKU}
            />
            <CategorySection
              categoryId={form.categoryId}
              onCategoryChange={(id) => update("categoryId", id)}
              tags={form.tags}
              onTagsChange={(t) => update("tags", t)}
            />
            <BrandSection brandId={form.brandId} onBrandChange={(id) => update("brandId", id)} />
            <BadgesStudioSection badges={form.badges} onChange={(b) => update("badges", b)} />
          </div>
        </StudioTabPanel>

        {/* ── Tab: Pricing ── */}
        <StudioTabPanel value="pricing">
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
            campaignPrice={form.campaignPrice}
            onCampaignPriceChange={(v) => update("campaignPrice", v)}
            onApplyAutoPricing={handleApplyAutoPricing}
            showResetButton={Object.keys(form.manualPriceOverrides ?? {}).length > 0}
            onResetAutoPricing={handleResetAutoPricing}
          />
        </StudioTabPanel>

        {/* ── Tab: Images ── */}
        <StudioTabPanel value="images">
          <MediaSection items={form.media} onChange={(items) => update("media", items)} />
        </StudioTabPanel>

        {/* ── Tab: Description ── */}
        <StudioTabPanel value="description">
          <div className="space-y-5">
            <LazyDescriptionSection
              value={form.richDescription}
              onChange={(v) => update("richDescription", v)}
            />
            <FeaturesEditor
              features={form.bulletFeatures}
              onChange={(features) => update("bulletFeatures", features)}
            />
          </div>
        </StudioTabPanel>

        {/* ── Tab: Specifications ── */}
        <StudioTabPanel value="specs">
          <InlineSpecEditor
            specs={form.specifications}
            onChange={(specs) => update("specifications", specs)}
          />
        </StudioTabPanel>

        {/* ── Tab: Variants ── */}
        <StudioTabPanel value="variants">
          <VariantStudioSection
            variants={form.variants as any}
            onChange={(vars) => update("variants", vars)}
            baseSku={form.sku}
            basePrice={parseFloat(form.sellingPrice) || 0}
            baseCost={parseFloat(form.costPrice) || 0}
          />
        </StudioTabPanel>

        {/* ── Tab: SEO ── */}
        <StudioTabPanel value="seo">
          <SEOAdvancedSection
            name={form.name}
            sku={form.sku}
            barcode={form.barcode}
            metaTitle={form.metaTitle}
            onMetaTitleChange={(v) => update("metaTitle", v)}
            metaDescription={form.metaDescription}
            onMetaDescriptionChange={(v) => update("metaDescription", v)}
            slug={form.slug}
            onSlugChange={(v) => update("slug", v)}
            ogImage={form.ogImage}
            onOgImageChange={(v) => update("ogImage", v)}
          />
        </StudioTabPanel>

        {/* ── Tab: Marketing ── */}
        <StudioTabPanel value="marketing">
          <div className="space-y-5">
            <CollectionsChannelsSection
              visibility={form.visibility}
              onVisibilityChange={(v) => update("visibility", v)}
              selectedCollectionIds={form.selectedCollectionIds}
              onCollectionsChange={(ids) => update("selectedCollectionIds", ids)}
            />
          </div>
        </StudioTabPanel>

        {/* ── Tab: Advanced ── */}
        <StudioTabPanel value="advanced">
          <div className="space-y-5">
            <LazySupplierStudioSection
              supplierId={form.supplierId}
              onSupplierIdChange={(v) => update("supplierId", v)}
              supplierSku={form.supplierSku}
              onSupplierSkuChange={(v) => update("supplierSku", v)}
              supplierCost={form.supplierCost}
              onSupplierCostChange={(v) => update("supplierCost", v)}
              leadTimeDays={form.leadTimeDays}
              onLeadTimeDaysChange={(v) => update("leadTimeDays", v)}
              purchaseLink={form.purchaseLink}
              onPurchaseLinkChange={(v) => update("purchaseLink", v)}
              supplierNotes={form.supplierNotes}
              onSupplierNotesChange={(v) => update("supplierNotes", v)}
            />
            <LazyPublishingStudioSection
              status={form.status}
              onStatusChange={(s) => update("status", s)}
              scheduledDate={form.scheduledPublishDate}
              onScheduledDateChange={(v) => update("scheduledPublishDate", v)}
              scheduledTime={form.scheduledPublishTime}
              onScheduledTimeChange={(v) => update("scheduledPublishTime", v)}
              timezone={form.timezone}
              onTimezoneChange={(v) => update("timezone", v)}
              scheduledUnpublishDate={form.scheduledUnpublishDate}
              onScheduledUnpublishDateChange={(v) => update("scheduledUnpublishDate", v)}
              healthResult={healthResult}
            />
          </div>
        </StudioTabPanel>

        {/* ── Tab: Preview ── */}
        <StudioTabPanel value="preview">
          <StudioLivePreview form={form} />
        </StudioTabPanel>
      </NewStudioLayout>
    </div>
  );
}
