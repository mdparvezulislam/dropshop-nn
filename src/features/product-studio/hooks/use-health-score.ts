import * as React from "react";
import type { StudioFormState } from "./use-product-studio";
import type { HealthScoreItem, HealthScoreResult } from "../types/studio-types";

export function useHealthScore(form: StudioFormState): HealthScoreResult {
  const items: HealthScoreItem[] = React.useMemo(() => {
    const hasName = Boolean(form.name.trim().length >= 3);
    const hasShortDesc = Boolean(form.shortDescription && form.shortDescription.length >= 10);
    const hasRichDesc = Boolean(form.richDescription && form.richDescription.length >= 20);
    const hasPrimaryImage = Boolean(form.media && form.media.length > 0);
    const hasGalleryImages = Boolean(form.media && form.media.length >= 2);
    const hasCategory = Boolean(form.categoryId);
    const hasBrand = Boolean(form.brandId);
    const hasPricing = Boolean(parseFloat(form.sellingPrice) > 0);
    const hasCostPricing = Boolean(parseFloat(form.costPrice) > 0);
    const hasStock = Boolean(parseInt(form.stock) >= 0 && (form.sku || form.inventorySku));
    const hasSEO = Boolean(form.metaTitle || form.slug);

    return [
      { id: "name", label: "Product Title (min 3 chars)", weight: 10, completed: hasName, sectionId: "general" },
      { id: "shortDesc", label: "Short Description", weight: 5, completed: hasShortDesc, sectionId: "general" },
      { id: "richDesc", label: "Rich Description & Details", weight: 10, completed: hasRichDesc, sectionId: "description" },
      { id: "primaryImage", label: "Primary Image Uploaded", weight: 12, completed: hasPrimaryImage, sectionId: "media" },
      { id: "gallery", label: "2+ Gallery Images Uploaded", weight: 8, completed: hasGalleryImages, sectionId: "media" },
      { id: "category", label: "Category Assigned", weight: 10, completed: hasCategory, sectionId: "category" },
      { id: "brand", label: "Brand Assigned", weight: 5, completed: hasBrand, sectionId: "brand" },
      { id: "sellingPrice", label: "Retail Selling Price Set", weight: 12, completed: hasPricing, sectionId: "pricing" },
      { id: "costPrice", label: "Cost Price Set (Profit Tracking)", weight: 8, completed: hasCostPricing, sectionId: "pricing" },
      { id: "inventory", label: "Stock Quantity & SKU Defined", weight: 10, completed: hasStock, sectionId: "inventory" },
      { id: "seo", label: "SEO Meta & Slug Set", weight: 10, completed: hasSEO, sectionId: "seo" },
    ];
  }, [form]);

  const score = React.useMemo(() => {
    return items.reduce((acc, item) => (item.completed ? acc + item.weight : acc), 0);
  }, [items]);

  const completedCount = items.filter((i) => i.completed).length;
  const missingItems = items.filter((i) => !i.completed);

  return {
    score,
    completedCount,
    totalCount: items.length,
    missingItems,
    items,
  };
}
