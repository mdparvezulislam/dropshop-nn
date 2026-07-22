export interface PricingSettings {
  retailMultiplier: number;    // e.g. 1.40 (+40%)
  wholesaleMultiplier: number; // e.g. 1.30 (+30%)
  resellerMultiplier: number;  // e.g. 1.22 (+22%)
  campaignMultiplier: number;  // e.g. 1.15 (+15%)
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  retailMultiplier: 1.30,   // Cost + 30%
  wholesaleMultiplier: 1.12, // Cost + 12%
  resellerMultiplier: 1.20,  // Cost + 20%
  campaignMultiplier: 1.00,  // Manual only
};

export interface HealthScoreItem {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  sectionId: string;
}

export interface HealthScoreResult {
  score: number;
  completedCount: number;
  totalCount: number;
  missingItems: HealthScoreItem[];
  items: HealthScoreItem[];
}

export interface ImageUploadItem {
  id: string;
  file?: File;
  url: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  errorMessage?: string;
  isPrimary: boolean;
  altText?: string;
  caption?: string;
  imagekitFileId?: string;
}

export interface ExtendedVariantRow {
  id: string;
  sku: string;
  barcode?: string;
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  capacity?: string;
  material?: string;
  customAttribute?: string;
  image?: string;
  price: number;            // Retail
  wholesalePrice?: number;
  resellerPrice?: number;
  campaignPrice?: number;
  costPrice?: number;
  stock: number;
  reservedStock?: number;
  incomingStock?: number;
  weight?: number;
  status: "active" | "draft" | "disabled";
  visibility: "public" | "private" | "hidden";
  dynamicAttrs?: Record<string, string>;
}

export interface VariantMatrixOptions {
  colors: string[];
  sizes: string[];
  storages: string[];
  rams: string[];
  materials: string[];
  baseSku: string;
  basePrice: number;
  baseCost: number;
  baseStock: number;
  dynamicAxes?: { name: string; values: string[] }[];
}

export interface SpecificationField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "color" | "multiselect";
  value: string | number | boolean | string[];
  options?: string[];
  required?: boolean;
}

export interface CategorySpecTemplate {
  categoryId: string;
  categoryName: string;
  fields: SpecificationField[];
}

export interface GoogleMerchantData {
  gtin: string;
  mpn: string;
  condition: "new" | "refurbished" | "used";
  availability: "in_stock" | "out_of_stock" | "preorder";
  googleCategory: string;
  ageGroup: "adult" | "kids" | "toddler" | "infant";
  gender: "unisex" | "male" | "female";
  shippingWeight: string;
}

export interface ProductRelationship {
  id: string;
  targetProductId: string;
  targetProductName: string;
  targetProductSku: string;
  targetProductPrice: number;
  targetProductImage?: string;
  type: "related" | "cross_sell" | "upsell" | "accessory" | "replacement" | "frequently_bought_together";
}

export interface ScheduledPublishConfig {
  scheduledAt?: string;
  timezone?: string;
  autoArchiveAt?: string;
  enabled: boolean;
}

export interface SearchTokensData {
  searchWeight: number;
  tokens: string[];
  keywords: string[];
  synonyms: string[];
  autocomplete: string[];
}
