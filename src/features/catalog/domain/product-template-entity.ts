import { BaseDBEntity } from "@/lib/database/types";

export type TemplateSpecFieldType = "text" | "number" | "boolean" | "select" | "multiselect" | "color";

export interface TemplateSpecField {
  key: string;
  label: string;
  type: TemplateSpecFieldType;
  defaultValue: string | number | boolean | string[];
  options?: string[];
  required?: boolean;
  group: "specification" | "technical" | "general";
}

export interface TemplateAttribute {
  key: string;
  label: string;
  type: "text" | "select" | "color" | "size" | "number";
  options?: string[];
  required?: boolean;
}

export interface TemplatePricingProfile {
  retailMultiplier: number;
  wholesaleMultiplier: number;
  resellerMultiplier: number;
  campaignMultiplier: number;
  minMarginPercent: number;
}

export interface TemplateShippingProfile {
  weight: number;
  weightUnit: string;
  length: number;
  width: number;
  height: number;
  dimensionUnit: string;
  shippingClass: string;
}

export interface TemplateWarrantyProfile {
  period: string;
  periodDays: number;
  type: "manufacturer" | "seller" | "none";
  description: string;
}

export interface TemplateSEOProfile {
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  focusKeywordSuggestions: string[];
}

export interface TemplateGoogleMerchant {
  googleProductCategory: string;
  ageGroup: string;
  gender: string;
  condition: string;
}

export interface ProductTemplate extends BaseDBEntity {
  name: string;
  slug: string;
  nameBangla: string;
  description: string;
  iconName: string;
  categoryId?: string;
  categoryName: string;
  isActive: boolean;
  sortOrder: number;

  specs: TemplateSpecField[];
  attributes: TemplateAttribute[];
  suggestedTags: string[];
  suggestedCollections: string[];

  pricingProfile: TemplatePricingProfile;
  shippingProfile: TemplateShippingProfile;
  warrantyProfile: TemplateWarrantyProfile;
  returnPolicy: string;
  packageIncludes: string[];

  seoProfile: TemplateSEOProfile;
  googleMerchant: TemplateGoogleMerchant;

  suggestedBulletFeatures: string[];
}

export default ProductTemplate;
