"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveStudioProductAction, publishStudioProductAction } from "../actions/studio-actions";
import { useAutosave, type SaveState } from "./use-autosave";
import { useHealthScore } from "./use-health-score";
import { useAutoClassification } from "./use-auto-classification";
import { useAutoGeneration } from "./use-auto-generation";
import type { HealthScoreResult } from "../types/studio-types";
import type { VariantRow } from "../components/sections/variants-section";
import type { MediaItem } from "../components/sections/media-section";
import type { ProductType } from "@/features/catalog/domain/product-entity";

export interface StudioFormState {
  name: string;
  productType: ProductType;
  templateId: string;
  sku: string;
  shortDescription: string;
  richDescription: string;
  productModel: string;
  barcode: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  tags: string[];
  visibility: string;
  status: string;
  featured: boolean;
  trending: boolean;
  flashSale: boolean;
  newArrival: boolean;
  warranty: string;
  returnPolicy: string;

  /* Pricing */
  costPrice: string;
  sellingPrice: string;
  wholesalePrice: string;
  resellerPrice: string;
  comparePrice: string;
  campaignPrice: string;
  manualPriceOverrides: Record<string, boolean>;

  /* Inventory */
  inventorySku: string;
  inventoryBarcode: string;
  stock: string;
  reservedStock: string;
  incomingStock: string;
  lowStockThreshold: string;
  warehouseLocation: string;
  weight: string;

  /* Collections & Media */
  variants: VariantRow[];
  media: MediaItem[];
  bulletFeatures: string[];
  selectedCollectionIds: string[];
  channels: string[];
  supplierSku: string;
  supplierCost: string;
  leadTimeDays: string;
  purchaseLink: string;
  supplierNotes: string;
  relationships: any[];
  scheduledPublishDate: string;
  scheduledPublishTime: string;
  scheduledUnpublishDate: string;
  timezone: string;

  /* SEO */
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  slug: string;
  ogImage: string;
}

const INITIAL_STATE: StudioFormState = {
  name: "", productType: "simple" as ProductType, templateId: "",
  sku: "", shortDescription: "", richDescription: "",
  productModel: "", barcode: "", brandId: "", brandName: "", categoryId: "", categoryName: "", supplierId: "",
  tags: [], visibility: "public", status: "draft",
  featured: false, trending: false, flashSale: false, newArrival: true,
  warranty: "", returnPolicy: "",
  costPrice: "", sellingPrice: "", wholesalePrice: "", resellerPrice: "", comparePrice: "", campaignPrice: "", manualPriceOverrides: {},
  inventorySku: "", inventoryBarcode: "", stock: "0", reservedStock: "0", incomingStock: "0", lowStockThreshold: "5",
  warehouseLocation: "DHAKA-CENTRAL-WH1", weight: "0.5",
  variants: [{ id: "v1", color: "", size: "", storage: "", ram: "", capacity: "", material: "", sku: "" }],
  media: [],
  metaTitle: "", metaDescription: "", metaKeywords: [], slug: "", ogImage: "",
  bulletFeatures: [],
  selectedCollectionIds: [],
  channels: [],
  supplierSku: "",
  supplierCost: "",
  leadTimeDays: "",
  purchaseLink: "",
  supplierNotes: "",
  relationships: [],
  scheduledPublishDate: "",
  scheduledPublishTime: "",
  scheduledUnpublishDate: "",
  timezone: "Asia/Dhaka (GMT+6)",
};

export function useProductStudio(existingId?: string): {
  form: StudioFormState;
  update: (field: keyof StudioFormState, value: unknown) => void;
  bulkUpdate: (partial: Partial<StudioFormState>) => void;
  handleAutoGenerateSKU: () => void;
  handleApplyAutoPricing: (pricing: Partial<StudioFormState>) => void;
  handleResetAutoPricing: () => void;
  handleSave: () => Promise<void>;
  handlePublish: () => Promise<void>;
  handlePreview: () => void;
  saving: boolean;
  saveState: SaveState;
  healthResult: HealthScoreResult;
  activeSection: string;
  setActiveSection: (id: string) => void;
  scrollToSection: (id: string) => void;
  sections: { id: string; label: string }[];
} {
  const router = useRouter();
  const [form, setForm] = React.useState<StudioFormState>(INITIAL_STATE);
  const [saving, setSaving] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("general");
  const productIdRef = React.useRef(existingId);

  const healthResult = useHealthScore(form);
  const { classifyFromName } = useAutoClassification();
  const { generate: autoGenerate } = useAutoGeneration();

  const doSave = React.useCallback(async () => {
    setSaving(true);
    try {
      const payload = buildPayload(form);
      const res = await saveStudioProductAction(payload, productIdRef.current);
      if (res.success && res.data?.id) {
        productIdRef.current = res.data.id;
        if (!existingId) {
          router.replace(`/dashboard/products/${res.data.id}/edit`);
        }
      }
      return res;
    } finally {
      setSaving(false);
    }
  }, [form, existingId, router]);

  const { saveState, triggerSave } = useAutosave({
    delay: 3000,
    onSave: doSave,
    enabled: true,
  });

  const update = React.useCallback((field: keyof StudioFormState, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Track manual price overrides
      if (["sellingPrice", "wholesalePrice", "resellerPrice"].includes(field)) {
        next.manualPriceOverrides = { ...prev.manualPriceOverrides, [field]: true };
      }

      // Auto-calculate prices when cost changes (unless manually overridden)
      if (field === "costPrice" && typeof value === "string") {
        const cost = parseFloat(value) || 0;
        if (cost > 0) {
          if (!prev.manualPriceOverrides?.sellingPrice) {
            next.sellingPrice = (cost * 1.30).toFixed(0);
          }
          if (!prev.manualPriceOverrides?.wholesalePrice) {
            next.wholesalePrice = (cost * 1.12).toFixed(0);
          }
          if (!prev.manualPriceOverrides?.resellerPrice) {
            next.resellerPrice = (cost * 1.20).toFixed(0);
          }
        }
      }

      // Auto-classification + auto-generation on name change
      if (field === "name" && typeof value === "string" && value.trim().length >= 3) {
        const classification = classifyFromName(value);
        const generated = autoGenerate(value, prev.sku);

        if (!prev.slug || prev.slug === autoGenerate(prev.name).slug) {
          next.slug = generated.slug;
        }
        if (!prev.metaTitle) {
          next.metaTitle = generated.metaTitle;
        }
        if (!prev.metaDescription) {
          next.metaDescription = generated.metaDescription;
        }
        if (classification.categoryName && !prev.categoryId) {
          next.categoryName = classification.categoryName;
        }
        if (classification.brandName && !prev.brandId) {
          next.brandName = classification.brandName;
        }
        if (classification.suggestedTags.length > 0 && prev.tags.length === 0) {
          next.tags = classification.suggestedTags;
        }
      }

      return next;
    });
    triggerSave();
  }, [triggerSave, classifyFromName, autoGenerate]);

  const bulkUpdate = React.useCallback((partial: Partial<StudioFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    triggerSave();
  }, [triggerSave]);

  const handleAutoGenerateSKU = React.useCallback(() => {
    const prefix = form.name.trim() ? form.name.trim().substring(0, 3).toUpperCase() : "PROD";
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newSku = `DS-${prefix}-${rand}`;
    update("sku", newSku);
    if (!form.inventorySku) update("inventorySku", newSku);
    toast.success(`Generated SKU: ${newSku}`);
  }, [form.name, form.inventorySku, update]);

  const handleApplyAutoPricing = React.useCallback((pricingPartial: Partial<StudioFormState>) => {
    bulkUpdate({ ...pricingPartial, manualPriceOverrides: {} });
    toast.success("Applied automated multi-tier pricing rules (+30%/+20%/+12%)");
  }, [bulkUpdate]);

  const handleResetAutoPricing = React.useCallback(() => {
    const cost = parseFloat(form.costPrice) || 0;
    if (cost <= 0) return;
    bulkUpdate({
      sellingPrice: (cost * 1.30).toFixed(0),
      wholesalePrice: (cost * 1.12).toFixed(0),
      resellerPrice: (cost * 1.20).toFixed(0),
      manualPriceOverrides: {},
    });
  }, [form.costPrice, bulkUpdate]);

  const handleSave = React.useCallback(async () => {
    if (!form.name.trim()) {
      toast.error("Product title is required");
      scrollToSection("general");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      const res = await saveStudioProductAction(payload, productIdRef.current);
      if (res.success && res.data?.id) {
        productIdRef.current = res.data.id;
        toast.success("Product saved as draft");
        if (!existingId) {
          router.replace(`/dashboard/products/${res.data.id}/edit`);
        }
      } else {
        toast.error(res.error || "Save failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [form, existingId, router]);

  const handlePublish = React.useCallback(async () => {
    if (!productIdRef.current) {
      await handleSave();
    }
    if (!productIdRef.current) return;
    setSaving(true);
    try {
      const res = await publishStudioProductAction(productIdRef.current);
      if (res.success) {
        toast.success("Product published to channels!");
        update("status", "active");
      } else {
        toast.error(res.error || "Publish failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }, [handleSave, update]);

  const handlePreview = React.useCallback(() => {
    if (productIdRef.current) {
      window.open(`/products/${form.slug || productIdRef.current}`, "_blank");
    } else {
      toast.info("Save product draft first to preview");
    }
  }, [form.slug]);

  const scrollToSection = React.useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(`studio-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const sections = React.useMemo(() => [
    { id: "general", label: "General" },
    { id: "description", label: "Description" },
    { id: "category", label: "Category" },
    { id: "brand", label: "Brand" },
    { id: "variants", label: "Variant Studio" },
    { id: "specifications", label: "Specifications" },
    { id: "media", label: "Media Studio" },
    { id: "pricing", label: "Pricing Engine" },
    { id: "inventory", label: "Inventory" },
    { id: "collections", label: "Collections & Channels" },
    { id: "seo", label: "SEO & Google Feed" },
    { id: "marketing", label: "Marketing Intelligence" },
    { id: "relationships", label: "Recommendations" },
    { id: "supplier", label: "Supplier Sourcing" },
    { id: "publishing", label: "Publishing Schedule" },
  ], []);

  return {
    form, update, bulkUpdate,
    handleAutoGenerateSKU, handleApplyAutoPricing, handleResetAutoPricing,
    handleSave, handlePublish, handlePreview,
    saving, saveState, healthResult,
    activeSection, setActiveSection, scrollToSection,
    sections,
  };
}

function buildPayload(form: StudioFormState): Record<string, unknown> {
  return {
    name: form.name.trim(),
    productType: form.productType,
    templateId: form.templateId || undefined,
    sku: form.sku.trim() || form.inventorySku || `SKU-${Date.now()}`,
    shortDescription: form.shortDescription || undefined,
    richDescription: form.richDescription || undefined,
    productModel: form.productModel || undefined,
    barcode: form.barcode || undefined,
    brandId: form.brandId || undefined,
    categoryId: form.categoryId || undefined,
    supplierId: form.supplierId || undefined,
    tags: form.tags,
    visibility: form.visibility,
    status: form.status,
    featured: form.featured,
    trending: form.trending,
    flashSale: form.flashSale,
    newArrival: form.newArrival,
    warranty: form.warranty || undefined,
    returnPolicy: form.returnPolicy || undefined,
    variants: form.variants
      .filter((v) => v.sku.trim())
      .map((v) => ({
        color: v.color || undefined,
        size: v.size || undefined,
        storage: v.storage || undefined,
        ram: v.ram || undefined,
        capacity: v.capacity || undefined,
        material: v.material || undefined,
        sku: v.sku.trim(),
        weight: v.weight,
      })),
    media: form.media.map((m) => ({
      url: m.url,
      type: m.type,
      isFeatured: m.isFeatured,
      altText: m.altText || undefined,
    })),
    seo: {
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      metaKeywords: form.metaKeywords.length > 0 ? form.metaKeywords : undefined,
      slug: form.slug || undefined,
      ogImage: form.ogImage || undefined,
    },
    pricing: {
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      wholesalePrice: parseFloat(form.wholesalePrice) || 0,
      resellerPrice: parseFloat(form.resellerPrice) || 0,
      comparePrice: parseFloat(form.comparePrice) || 0,
      manualPriceOverrides: form.manualPriceOverrides,
    },
    inventory: {
      sku: form.inventorySku || form.sku || undefined,
      barcode: form.inventoryBarcode || form.barcode || undefined,
      stock: parseInt(form.stock) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
    },
    bulletFeatures: form.bulletFeatures,
    selectedCollectionIds: form.selectedCollectionIds,
    channels: form.channels,
    supplierSku: form.supplierSku || undefined,
    supplierCost: form.supplierCost || undefined,
    leadTimeDays: form.leadTimeDays || undefined,
    purchaseLink: form.purchaseLink || undefined,
    supplierNotes: form.supplierNotes || undefined,
    relationships: form.relationships,
    scheduledPublishDate: form.scheduledPublishDate || undefined,
    scheduledPublishTime: form.scheduledPublishTime || undefined,
    scheduledUnpublishDate: form.scheduledUnpublishDate || undefined,
    timezone: form.timezone || undefined,
  };
}
