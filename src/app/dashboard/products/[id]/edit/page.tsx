"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { StudioLayout } from "@/features/product-studio/components/studio-layout";
import { StudioHeader } from "@/features/product-studio/components/studio-header";
import { StudioMobileNav } from "@/features/product-studio/components/studio-mobile-nav";
import { StudioRightSidebar } from "@/features/product-studio/components/sidebar/studio-right-sidebar";
import { VariantStudioSection } from "@/features/product-studio/components/sections/variant-studio-section";
import { CollectionsChannelsSection } from "@/features/product-studio/components/sections/collections-channels-section";
import { SEOAdvancedSection } from "@/features/product-studio/components/sections/seo-advanced-section";
import { MarketingStudioSection } from "@/features/product-studio/components/sections/marketing-studio-section";
import { RelationshipsSection } from "@/features/product-studio/components/sections/relationships-section";
import { SupplierStudioSection } from "@/features/product-studio/components/sections/supplier-studio-section";
import { PublishingStudioSection } from "@/features/product-studio/components/sections/publishing-studio-section";

import { useProductStudio } from "@/features/product-studio/hooks/use-product-studio";
import { GeneralSection } from "@/features/product-studio/components/sections/general-section";
import { DescriptionSection } from "@/features/product-studio/components/sections/description-section";
import { CategorySection } from "@/features/product-studio/components/sections/category-section";
import { BrandSection } from "@/features/product-studio/components/sections/brand-section";
import { SpecificationSection } from "@/features/product-studio/components/sections/specification-section";
import { MediaSection } from "@/features/product-studio/components/sections/media-section";
import { PricingSection } from "@/features/product-studio/components/sections/pricing-section";
import { CostStudioSection } from "@/features/product-studio/components/sections/cost-studio-section";
import { InventorySection } from "@/features/product-studio/components/sections/inventory-section";
import { SEOSection } from "@/features/product-studio/components/sections/seo-section";
import { getProductAction } from "@/features/catalog/actions/product-actions";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function EditProductStudioPage(): React.ReactElement {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;

  const {
    form, update, bulkUpdate,
    handleAutoGenerateSKU, handleApplyAutoPricing, handleResetAutoPricing,
    handleSave, handlePublish, handlePreview,
    saving, saveState, healthResult,
    activeSection, setActiveSection, scrollToSection,
    sections,
  } = useProductStudio(id);

  const [loadingProduct, setLoadingProduct] = React.useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      if (!id) {
        setLoadingProduct(false);
        return;
      }
      try {
        const res = await getProductAction(id);
        if (res.success && res.data) {
          const p = res.data as any;
          bulkUpdate({
            name: p.title ?? p.name ?? "",
            productType: p.productType ?? "simple",
            sku: p.sku ?? "",
            shortDescription: p.shortDescription ?? "",
            richDescription: p.richDescription ?? p.description ?? "",
            productModel: p.productModel ?? "",
            barcode: p.barcode ?? "",
            brandId: p.brandId ?? p.brand?.id ?? "",
            categoryId: p.categoryId ?? p.category?.id ?? "",
            supplierId: p.supplierId ?? "",
            status: p.status ?? "draft",
            visibility: p.visibility ?? "public",
            costPrice: String(p.costPrice ?? p.pricing?.costPrice ?? 0),
            sellingPrice: String(p.retailPrice ?? p.price ?? p.pricing?.sellingPrice ?? 0),
            wholesalePrice: String(p.wholesalePrice ?? p.pricing?.wholesalePrice ?? 0),
            resellerPrice: String(p.resellerPrice ?? p.pricing?.resellerPrice ?? 0),
            comparePrice: String(p.comparePrice ?? p.pricing?.comparePrice ?? 0),
            stock: String(p.stockQuantity ?? p.inventory?.stock ?? 0),
            lowStockThreshold: String(p.inventory?.lowStockThreshold ?? 5),
            media: (p.images ?? p.media ?? []).map((img: any, i: number) => ({
              id: img.id || `m-${i}`,
              url: typeof img === "string" ? img : img.url,
              type: "image",
              isFeatured: i === 0,
              altText: img.altText || undefined,
            })),
            slug: p.slug ?? p.seo?.slug ?? "",
            metaTitle: p.seo?.metaTitle ?? p.title ?? "",
            metaDescription: p.seo?.metaDescription ?? p.shortDescription ?? "",
            metaKeywords: p.seo?.metaKeywords ?? [],
          });
        }
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoadingProduct(false);
      }
    }
    load();
  }, [id, bulkUpdate]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground gap-2">
        <Spinner size="sm" /> Loading Product Studio…
      </div>
    );
  }

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      const prevIdx = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIdx);
      scrollToSection(sections[prevIdx].id);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      const nextIdx = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIdx);
      scrollToSection(sections[nextIdx].id);
    }
  };

  const header = (
    <StudioHeader
      productName={form.name}
      onNameChange={(val) => update("name", val)}
      status={form.status}
      saveState={saveState}
      saving={saving}
      onSave={handleSave}
      onPublish={handlePublish}
      onPreview={handlePreview}
      isEditing={true}
    />
  );

  const main = (
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

      <DescriptionSection
        value={form.richDescription}
        onChange={(v) => update("richDescription", v)}
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

      <MarketingStudioSection
        productName={form.name}
        tags={form.tags}
        onTagsChange={(t) => update("tags", t)}
        bulletFeatures={form.bulletFeatures}
        onBulletFeaturesChange={(b) => update("bulletFeatures", b)}
      />

      <RelationshipsSection
        relationships={form.relationships}
        onRelationshipsChange={(rels) => update("relationships", rels)}
      />

      <SupplierStudioSection
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

      <PublishingStudioSection
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
      healthResult={healthResult}
      sections={sections}
      activeSection={activeSection}
      onSectionClick={scrollToSection}
    />
  );

  const mobileFooter = (
    <StudioMobileNav
      currentSectionIndex={currentSectionIndex}
      totalSections={sections.length}
      onPrevSection={handlePrevSection}
      onNextSection={handleNextSection}
      onSave={handleSave}
      onPublish={handlePublish}
      saving={saving}
      status={form.status}
    />
  );

  return <StudioLayout header={header} main={main} sidebar={sidebar} mobileFooter={mobileFooter} />;
}
