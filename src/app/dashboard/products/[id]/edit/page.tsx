"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import {
  NewStudioLayout,
  StudioTabPanel,
} from "@/features/product-studio/components/new-studio-layout";
import { StudioHeader } from "@/features/product-studio/components/studio-header";
import { StudioQuickCreate } from "@/features/product-studio/components/studio-quick-create";
import { StudioLivePreview } from "@/features/product-studio/components/studio-live-preview";
import { useProductStudio } from "@/features/product-studio/hooks/use-product-studio";
import {
  checkSkuUniquenessAction,
  checkSlugUniquenessAction,
} from "@/features/catalog/actions/product-actions";
import { getStudioProductAction } from "@/features/product-studio/actions/studio-actions";

import { GeneralSection } from "@/features/product-studio/components/sections/general-section";
import { BadgesStudioSection } from "@/features/product-studio/components/sections/badges-studio-section";
import { CategorySection } from "@/features/product-studio/components/sections/category-section";
import { BrandSection } from "@/features/product-studio/components/sections/brand-section";
import { VariantStudioSection } from "@/features/product-studio/components/sections/variant-studio-section";
import { InlineSpecEditor } from "@/features/product-studio/components/inline-spec-editor";
import { FeaturesEditor } from "@/features/product-studio/components/features-editor";
import { ParserBar } from "@/features/product-studio/components/parser-bar";
import { UrlImportBar } from "@/features/product-studio/components/url-import-bar";
import { MediaSection } from "@/features/product-studio/components/sections/media-section";
import { PricingSection } from "@/features/product-studio/components/sections/pricing-section";
import { CostStudioSection } from "@/features/product-studio/components/sections/cost-studio-section";
import { InventorySection } from "@/features/product-studio/components/sections/inventory-section";
import { CollectionsChannelsSection } from "@/features/product-studio/components/sections/collections-channels-section";
import { SEOAdvancedSection } from "@/features/product-studio/components/sections/seo-advanced-section";

import { Zap, Sliders, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Lazy load heavy rich text and supplier sections
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

export default function EditProductStudioPage(): React.ReactElement {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;

  const {
    form,
    update,
    bulkUpdate,
    hydrate,
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
  } = useProductStudio(id);

  const [loadingProduct, setLoadingProduct] = React.useState(true);
  const [mode, setMode] = React.useState<"quick" | "advanced">("advanced");
  const [showPreview, setShowPreview] = React.useState(false);
  const [skuUniqueError, setSkuUniqueError] = React.useState<string | null>(null);
  const [slugUniqueError, setSlugUniqueError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      if (!id) {
        setLoadingProduct(false);
        return;
      }
      try {
        const res = await getStudioProductAction(id);
        if (!res.success || !res.data?.product) {
          toast.error(res.error || "Product not found");
          return;
        }

        const { product: p, pricing: pr, inventory: inv } = res.data;
        const toMajor = (minor?: number): string => (minor && minor > 0 ? String(minor / 100) : "");

        // Every field the studio can edit is hydrated here. Anything left out is sent
        // back empty on the next save and silently erases the stored value — that is how
        // tags, warranty and the return policy were being wiped on edit.
        hydrate({
          name: p.name || "",
          productType: p.productType || "simple",
          sku: p.sku || "",
          shortDescription: p.shortDescription || "",
          richDescription: p.description || "",
          notice: p.notice || "",
          productModel: p.productModel || "",
          barcode: p.barcode || "",
          brandId: p.brandId ? String(p.brandId) : "",
          categoryId: p.categoryId ? String(p.categoryId) : "",
          supplierId: p.supplierId ? String(p.supplierId) : "",
          status: p.status || "draft",
          visibility: p.visibility || "public",
          badges: p.badges || [],
          tags: p.tags || [],
          featured: Boolean(p.featured),
          trending: Boolean(p.trending),
          flashSale: Boolean(p.flashSale),
          newArrival: Boolean(p.newArrival),
          warranty: p.content?.warrantyInformation || "",
          returnPolicy: p.content?.returnPolicy || "",
          bulletFeatures: p.content?.features || [],
          specifications: (p.specifications || []).map((s, i) => ({
            key: s.key || `spec_${i + 1}`,
            label: s.key || "",
            type: "text" as const,
            value: s.value ?? "",
            group: s.group || "General",
          })),
          costPrice: toMajor(pr?.baseCostPrice),
          sellingPrice: toMajor(pr?.sellingPrice),
          wholesalePrice: toMajor(pr?.wholesalePrice),
          resellerPrice: toMajor(pr?.resellerPrice),
          comparePrice: toMajor(pr?.comparePrice),
          // Loaded prices are the stored truth, not manual overrides — leaving these set
          // would freeze the tier prices against later cost changes.
          manualPriceOverrides: {},
          stock: String(inv?.availableStock ?? 0),
          reservedStock: String(inv?.reservedStock ?? 0),
          incomingStock: String(inv?.incomingStock ?? 0),
          lowStockThreshold: String(inv?.lowStockThreshold ?? 5),
          inventorySku: p.sku || "",
          inventoryBarcode: p.barcode || "",
          variants: (p.variants || []).map((v, i) => ({
            id: v.id || `v-${i}`,
            name: v.name || "",
            attributes: v.attributes,
            sku: v.sku || `${p.sku}-v${i + 1}`,
            priceAdjustment: v.priceAdjustment ?? 0,
            stock: v.stock ?? 0,
            image: v.image,
            status: v.status || "active",
            isActive: v.isActive ?? true,
            color: v.color || "",
            size: v.size || "",
            storage: v.storage || "",
            ram: v.ram || "",
            capacity: v.capacity || "",
            material: v.material || "",
          })),
          media: (p.media || []).map((m, i) => ({
            id: `m-${i}`,
            url: m.url,
            type: m.type || "image",
            isFeatured: m.isFeatured ?? i === 0,
            altText: m.altText,
          })),
          slug: p.slug || "",
          metaTitle: p.metaTitle || p.seo?.metaTitle || p.name || "",
          metaDescription: p.metaDescription || p.seo?.metaDescription || p.shortDescription || "",
          metaKeywords: p.seo?.metaKeywords || [],
          ogImage: p.seo?.ogImage || "",
        });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load product for edit");
      } finally {
        setLoadingProduct(false);
      }
    }
    load();
  }, [id, hydrate]);

  // Background Uniqueness Check for SKU
  React.useEffect(() => {
    if (!form.sku.trim() || !id) return;
    const timer = setTimeout(async () => {
      const res = await checkSkuUniquenessAction(form.sku, id);
      if (res.success && res.data && !res.data.isUnique) {
        setSkuUniqueError("SKU is already in use by another product");
      } else {
        setSkuUniqueError(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.sku, id]);

  // Background Uniqueness Check for Slug
  React.useEffect(() => {
    if (!form.slug.trim() || !id) return;
    const timer = setTimeout(async () => {
      const res = await checkSlugUniquenessAction(form.slug, id);
      if (res.success && res.data && !res.data.isUnique) {
        setSlugUniqueError("URL Slug is already in use");
      } else {
        setSlugUniqueError(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.slug, id]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 bg-background text-muted-foreground">
        <Spinner size="sm" /> Loading Product Studio V2…
      </div>
    );
  }

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
      isEditing={true}
    />
  );

  // Alert banner for uniqueness warnings
  const alert =
    skuUniqueError || slugUniqueError ? (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
        {skuUniqueError && <p>• {skuUniqueError}</p>}
        {slugUniqueError && <p>• {slugUniqueError}</p>}
      </div>
    ) : undefined;

  // ── Quick Mode ──
  if (mode === "quick") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {header}
        <div className="flex-1 mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5 p-3 bg-muted border border-border rounded-xl">
            <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setMode("quick")}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 bg-amber-500 text-amber-950 shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Edit</span>
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

  // ── Advanced Mode (Tab-based) ──
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header}

      <div className="mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 pt-5">
        <div className="flex items-center justify-between mb-5 p-3 bg-muted border border-border rounded-xl">
          <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Edit</span>
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
        {/* ── Tab 1: Product Details (Required All-In-One Form) ── */}
        <StudioTabPanel value="basic">
          <div className="space-y-6">
            <GeneralSection
              name={form.name}
              onNameChange={(v) => update("name", v)}
              sku={form.sku}
              onSkuChange={(v) => update("sku", v)}
              stock={form.stock}
              onStockChange={(v) => update("stock", v)}
              shortDescription={form.shortDescription}
              onShortDescriptionChange={(v) => update("shortDescription", v)}
              productModel={form.productModel}
              onProductModelChange={(v) => update("productModel", v)}
              barcode={form.barcode}
              onBarcodeChange={(v) => update("barcode", v)}
              onAutoGenerateSKU={handleAutoGenerateSKU}
            />
            <LazyDescriptionSection
              value={form.richDescription}
              onChange={(v) => update("richDescription", v)}
            />
            <FeaturesEditor
              features={form.bulletFeatures}
              onChange={(features) => update("bulletFeatures", features)}
            />
            <CategorySection
              categoryId={form.categoryId}
              onCategoryChange={(id) => update("categoryId", id)}
              tags={form.tags}
              onTagsChange={(t) => update("tags", t)}
            />
            <BrandSection brandId={form.brandId} onBrandChange={(id) => update("brandId", id)} />
            <BadgesStudioSection badges={form.badges} onChange={(b) => update("badges", b)} />
            <InlineSpecEditor
              specs={form.specifications}
              onChange={(specs) => update("specifications", specs)}
            />
          </div>
        </StudioTabPanel>

        {/* ── Tab 2: Pricing & Stock (Financials & Inventory Engine) ── */}
        <StudioTabPanel value="pricing">
          <div className="space-y-6">
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
            <CostStudioSection productId={id ?? ""} />
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
          </div>
        </StudioTabPanel>

        {/* ── Tab 3: Media & Video Studio (Gallery & YouTube Embed) ── */}
        <StudioTabPanel value="media">
          <div className="space-y-6">
            <MediaSection
              items={form.media}
              onChange={(items) => update("media", items)}
              youtubeUrl={form.videoUrl}
              onYoutubeUrlChange={(url) => update("videoUrl", url)}
            />
          </div>
        </StudioTabPanel>

        {/* ── Tab 4: Variant Studio Matrix ── */}
        <StudioTabPanel value="variants">
          <VariantStudioSection
            variants={form.variants as any}
            onChange={(vars) => update("variants", vars)}
            baseSku={form.sku}
            basePrice={parseFloat(form.sellingPrice) || 0}
            baseCost={parseFloat(form.costPrice) || 0}
          />
        </StudioTabPanel>

        {/* ── Tab: SEO & Publishing (Search & Visibility) ── */}
        <StudioTabPanel value="seo">
          <div className="space-y-6">
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
            <CollectionsChannelsSection
              visibility={form.visibility}
              onVisibilityChange={(v) => update("visibility", v)}
              selectedCollectionIds={form.selectedCollectionIds}
              onCollectionsChange={(ids) => update("selectedCollectionIds", ids)}
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
          </div>
        </StudioTabPanel>

        {/* ── Tab: Live Preview ── */}
        <StudioTabPanel value="preview">
          <StudioLivePreview form={form} />
        </StudioTabPanel>
      </NewStudioLayout>
    </div>
  );
}
