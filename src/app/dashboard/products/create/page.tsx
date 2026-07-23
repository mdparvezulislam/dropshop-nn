"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { StudioLayout } from "@/features/product-studio/components/studio-layout";
import { StudioHeader } from "@/features/product-studio/components/studio-header";
import { StudioRightSidebar } from "@/features/product-studio/components/sidebar/studio-right-sidebar";
import { StudioQuickCreate } from "@/features/product-studio/components/studio-quick-create";
import { StudioLivePreview } from "@/features/product-studio/components/studio-live-preview";
import { useProductStudio } from "@/features/product-studio/hooks/use-product-studio";
import { useProductDraft } from "@/features/product-studio/hooks/use-product-draft";
import { checkSkuUniquenessAction, checkSlugUniquenessAction } from "@/features/catalog/actions/product-actions";

import { GeneralSection } from "@/features/product-studio/components/sections/general-section";
import { CategorySection } from "@/features/product-studio/components/sections/category-section";
import { BrandSection } from "@/features/product-studio/components/sections/brand-section";
import { VariantStudioSection } from "@/features/product-studio/components/sections/variant-studio-section";
import { SpecificationSection } from "@/features/product-studio/components/sections/specification-section";
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

// Lazy-load heavy components (Rich Text Description, Supplier, Marketing) only when Advanced Mode is activated
const LazyDescriptionSection = dynamic(
  () =>
    import("@/features/product-studio/components/sections/description-section").then(
      (m) => m.DescriptionSection
    ),
  {
    loading: () => <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs flex items-center space-x-2"><Spinner size="sm" /><span>Loading Rich Text Editor…</span></div>,
    ssr: false,
  }
);

const LazySupplierStudioSection = dynamic(
  () =>
    import("@/features/product-studio/components/sections/supplier-studio-section").then(
      (m) => m.SupplierStudioSection
    ),
  { ssr: false }
);

const LazyPublishingStudioSection = dynamic(
  () =>
    import("@/features/product-studio/components/sections/publishing-studio-section").then(
      (m) => m.PublishingStudioSection
    ),
  { ssr: false }
);

export default function CreateProductStudioPage(): React.ReactElement {
  const {
    form, update, bulkUpdate,
    handleAutoGenerateSKU, handleApplyAutoPricing, handleResetAutoPricing, handleMagicParse,
    handleSave, handlePublish, handlePreview,
    saving, saveState, healthResult,
    activeSection, setActiveSection, scrollToSection,
    sections,
  } = useProductStudio();

  const [mode, setMode] = React.useState<"quick" | "advanced">("quick");
  const [showPreview, setShowPreview] = React.useState(false);
  const [skuUniqueError, setSkuUniqueError] = React.useState<string | null>(null);
  const [slugUniqueError, setSlugUniqueError] = React.useState<string | null>(null);

  const { hasUnsavedDraft, loadDraftFromLocalStorage, clearDraft } = useProductDraft("new", form);

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

  const main = (
    <div className="space-y-6">
      {/* Draft Recovery Alert */}
      {hasUnsavedDraft && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">Unsaved Local Draft Found (খসড়া তথ্য পাওয়া গেছে)</span>
              <span className="text-slate-400">Would you like to restore your previously edited product details?</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const restored = loadDraftFromLocalStorage();
                if (restored) bulkUpdate(restored);
              }}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore Draft
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearDraft}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* Mode Switcher Banner */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              mode === "quick"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Create (6 Core Fields)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("advanced")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              mode === "advanced"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Mode (ফুল স্টুডিও)</span>
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className={`border-slate-800 text-xs font-bold ${
            showPreview ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
        </Button>
      </div>

      {/* SKU / Slug Validation Warning */}
      {(skuUniqueError || slugUniqueError) && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs font-semibold">
          {skuUniqueError && <p>• {skuUniqueError}</p>}
          {slugUniqueError && <p>• {slugUniqueError}</p>}
        </div>
      )}

      {/* Main Mode View */}
      {mode === "quick" ? (
        <StudioQuickCreate
          form={form}
          update={update}
          bulkUpdate={bulkUpdate}
          onSave={handleSave}
          onPublish={handlePublish}
          saving={saving}
          onSwitchToAdvanced={() => setMode("advanced")}
        />
      ) : (
        <>
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

          <BadgesStudioSection
            badges={form.badges}
            onChange={(b) => update("badges", b)}
          />

          <LazyDescriptionSection
            value={form.richDescription}
            onChange={(v) => update("richDescription", v)}
            onMagicParse={() => handleMagicParse()}
          />

          <CategorySection
            categoryId={form.categoryId}
            onCategoryChange={(id) => update("categoryId", id)}
            tags={form.tags}
            onTagsChange={(t) => update("tags", t)}
          />

          <BrandSection
            brandId={form.brandId}
            onBrandChange={(id) => update("brandId", id)}
          />

          <VariantStudioSection
            variants={form.variants as any}
            onChange={(vars) => update("variants", vars)}
            baseSku={form.sku}
            basePrice={parseFloat(form.sellingPrice) || 1200}
            baseCost={parseFloat(form.costPrice) || 800}
          />

          <SpecificationSection
            categoryName={form.categoryId || "Smart Watch"}
          />

          <MediaSection
            items={form.media}
            onChange={(items) => update("media", items)}
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
            campaignPrice={form.campaignPrice}
            onCampaignPriceChange={(v) => update("campaignPrice", v)}
            onApplyAutoPricing={handleApplyAutoPricing}
            showResetButton={Object.keys(form.manualPriceOverrides ?? {}).length > 0}
            onResetAutoPricing={handleResetAutoPricing}
          />

          <InventorySection
            sku={form.inventorySku || form.sku}
            onSkuChange={(v) => update("inventorySku", v)}
            barcode={form.inventoryBarcode || form.barcode}
            onBarcodeChange={(v) => update("inventoryBarcode", v)}
            stock={form.stock}
            onStockChange={(v) => update("stock", v)}
            lowStockThreshold={form.lowStockThreshold}
            onLowStockThresholdChange={(v) => update("lowStockThreshold", v)}
            reservedStock={form.reservedStock}
            onReservedStockChange={(v) => update("reservedStock", v)}
            incomingStock={form.incomingStock}
            onIncomingStockChange={(v) => update("incomingStock", v)}
            warehouseLocation={form.warehouseLocation}
            onWarehouseLocationChange={(v) => update("warehouseLocation", v)}
            weight={form.weight}
            onWeightChange={(v) => update("weight", v)}
          />

          <CollectionsChannelsSection
            visibility={form.visibility}
            onVisibilityChange={(v) => update("visibility", v)}
            selectedCollectionIds={form.selectedCollectionIds}
            onCollectionsChange={(ids) => update("selectedCollectionIds", ids)}
          />

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
        </>
      )}

      {/* Live Preview Modal / Drawer */}
      {showPreview && <StudioLivePreview form={form} className="mt-6" />}
    </div>
  );

  const sidebar = (
    <StudioRightSidebar
      status={form.status}
      visibility={form.visibility}
      onVisibilityChange={(v) => update("visibility", v)}
      onStatusChange={(v) => update("status", v)}
      onPublish={handlePublish}
      onSave={handleSave}
      onPreview={() => setShowPreview(!showPreview)}
      saving={saving}
      saveState={saveState}
      productName={form.name}
      productSku={form.sku}
      healthResult={healthResult}
      sections={sections}
      activeSection={activeSection}
      onSectionClick={scrollToSection}
    />
  );

  return <StudioLayout header={header} main={main} sidebar={sidebar} />;
}
