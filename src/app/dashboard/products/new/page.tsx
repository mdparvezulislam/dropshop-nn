"use client";

import * as React from "react";
import { StudioLayout } from "@/features/product-studio/components/studio-layout";
import { StudioHeader } from "@/features/product-studio/components/studio-header";
import { StudioMobileNav } from "@/features/product-studio/components/studio-mobile-nav";
import { StudioRightSidebar } from "@/features/product-studio/components/sidebar/studio-right-sidebar";
import { StudioTemplateSelector } from "@/features/product-studio/components/templates/studio-template-selector";

import { useProductStudio } from "@/features/product-studio/hooks/use-product-studio";
import { GeneralSection } from "@/features/product-studio/components/sections/general-section";
import { DescriptionSection } from "@/features/product-studio/components/sections/description-section";
import { CategorySection } from "@/features/product-studio/components/sections/category-section";
import { BrandSection } from "@/features/product-studio/components/sections/brand-section";
import { VariantStudioSection } from "@/features/product-studio/components/sections/variant-studio-section";
import { SpecificationSection } from "@/features/product-studio/components/sections/specification-section";
import { MediaSection } from "@/features/product-studio/components/sections/media-section";
import { PricingSection } from "@/features/product-studio/components/sections/pricing-section";
import { InventorySection } from "@/features/product-studio/components/sections/inventory-section";
import { CollectionsChannelsSection } from "@/features/product-studio/components/sections/collections-channels-section";
import { SEOAdvancedSection } from "@/features/product-studio/components/sections/seo-advanced-section";
import { MarketingStudioSection } from "@/features/product-studio/components/sections/marketing-studio-section";
import { RelationshipsSection } from "@/features/product-studio/components/sections/relationships-section";
import { SupplierStudioSection } from "@/features/product-studio/components/sections/supplier-studio-section";
import { PublishingStudioSection } from "@/features/product-studio/components/sections/publishing-studio-section";
import type { ProductTemplate } from "@/features/product-studio/data/product-templates-data";

export default function NewProductStudioPage(): React.ReactElement {
  const {
    form, update, bulkUpdate,
    handleAutoGenerateSKU, handleApplyAutoPricing,
    handleSave, handlePublish, handlePreview,
    saving, saveState, healthResult,
    activeSection, setActiveSection, scrollToSection,
    sections,
  } = useProductStudio();

  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);

  const handleApplyTemplate = React.useCallback((template: ProductTemplate) => {
    const costNum = parseFloat(template.costPrice) || 1000;
    const retail = (costNum * 1.40).toFixed(0);
    const wholesale = (costNum * 1.30).toFixed(0);
    const reseller = (costNum * 1.22).toFixed(0);
    const campaign = (costNum * 1.15).toFixed(0);

    bulkUpdate({
      name: template.name,
      shortDescription: template.shortDescription,
      tags: template.tags,
      costPrice: template.costPrice,
      sellingPrice: retail,
      wholesalePrice: wholesale,
      resellerPrice: reseller,
      campaignPrice: campaign,
      weight: template.weight,
    });
  }, [bulkUpdate]);

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
      isEditing={false}
    />
  );

  const main = (
    <>
      <StudioTemplateSelector onApplyTemplate={handleApplyTemplate} />

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
      />

      <RelationshipsSection />

      <SupplierStudioSection />

      <PublishingStudioSection
        status={form.status}
        onStatusChange={(s) => update("status", s)}
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
