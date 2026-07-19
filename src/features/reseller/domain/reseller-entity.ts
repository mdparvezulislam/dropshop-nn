import { BaseDBEntity } from "@/shared/lib/database/types";

export type ResellerStatus = "pending" | "active" | "suspended" | "blocked" | "archived";

export type ResellerProductSellingStatus = "draft" | "active" | "hidden" | "out_of_catalog";

export interface ResellerAddress {
  country: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode: string;
  fullAddress: string;
}

export interface Reseller extends BaseDBEntity {
  code: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  logo?: string;
  coverImage?: string;
  businessType: string;
  address: ResellerAddress;
  nidNumber?: string;
  nidVerified: boolean;
  tradeLicenseNumber?: string;
  tradeLicenseVerified: boolean;
  status: ResellerStatus;
  userId?: string;
  collections: string[];
  tags: string[];
  notes?: string;
}

export interface ResellerProductPricing {
  sellingPrice: number;
  discountAmount: number;
  discountPercentage: number;
  recommendedPrice: number;
  costBasis: number;
  profitAmount: number;
  profitMargin: number;
  currency: string;
  isCustomPrice: boolean;
}

export interface ResellerProduct extends BaseDBEntity {
  resellerId: string;
  productId: string;
  variantSku?: string;
  customTitle?: string;
  customDescription?: string;
  personalNotes?: string;
  sellingStatus: ResellerProductSellingStatus;
  isFavorite: boolean;
  isHidden: boolean;
  collectionIds: string[];
  groupIds: string[];
  tags: string[];
  pricing: ResellerProductPricing;
  assignedAt: Date;
}

export interface ResellerCollection extends BaseDBEntity {
  resellerId: string;
  name: string;
  slug: string;
  description?: string;
  productIds: string[];
}

export interface ResellerProductGroup extends BaseDBEntity {
  resellerId: string;
  name: string;
  slug: string;
  description?: string;
  productIds: string[];
}

export interface ResellerDashboardStats {
  totalProducts: number;
  activeProducts: number;
  hiddenProducts: number;
  favoriteProducts: number;
  draftProducts: number;
  revenueReady: boolean;
  ordersReady: boolean;
  walletReady: boolean;
}

export interface ResellerPricePreview {
  sellingPrice: number;
  costBasis: number;
  discountAmount: number;
  discountPercentage: number;
  profitAmount: number;
  profitMargin: number;
  recommendedPrice: number;
  currency: string;
}

/** Customer-ready stubs — do not implement full customer module yet */
export interface ResellerCustomerReady {
  resellerId: string;
  customerNotesReady: true;
  customerHistoryReady: true;
  myCustomersReady: true;
}

export default Reseller;
