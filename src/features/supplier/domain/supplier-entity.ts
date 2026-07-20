import { BaseDBEntity } from "@/shared/lib/database/types";

export type SupplierCategory =
  | "manufacturer"
  | "importer"
  | "wholesaler"
  | "distributor"
  | "local_vendor"
  | "dropshipping_partner";

export interface SupplierContact {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  isEmergency: boolean;
}

export interface SupplierBankAccount {
  bankName?: string;
  branch?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  mobileBankingType?: string;
  binanceWalletAddress?: string;
}

export interface SupplierDocument {
  id?: string;
  type: string;
  url: string;
  uploadedAt: Date;
  status: "pending" | "verified" | "rejected";
}

export interface SupplierSettings {
  autoAcceptOrders: boolean;
  autoRejectOutOfStock: boolean;
  allowBackorders: boolean;
  processingTimeDays: number;
  returnPolicy: string;
  warrantyPeriodDays: number;
  shippingTimeDays: number;
}

export interface SupplierAddress {
  country: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode: string;
  fullAddress: string;
  pickupAddress: string;
  returnAddress: string;
}

export interface SupplierPerformance {
  completedOrders: number;
  cancelledOrders: number;
  averageDeliveryDays: number;
  returnRate: number;
  responseTimeHours: number;
  performanceScore: number;
}

export interface SupplierNote {
  id?: string;
  content: string;
  createdBy?: string;
  createdAt: Date;
}

export interface SupplierProductMapping extends BaseDBEntity {
  supplierId: string;
  productId: string;
  variantSku?: string;
  supplierSku: string;
  isPrimary: boolean;
  priority: number;
  notes?: string;
}

export interface Supplier extends BaseDBEntity {
  code: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  facebook?: string;
  whatsApp?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  supplierCategory: SupplierCategory;
  businessType: string;
  tradeLicenseNumber: string;
  binNumber?: string;
  tinNumber?: string;
  nidVerified: boolean;
  businessVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  address: SupplierAddress;
  status: "pending" | "active" | "inactive" | "suspended" | "blocked" | "archived";
  contacts: SupplierContact[];
  banking?: SupplierBankAccount;
  documents: SupplierDocument[];
  settings?: SupplierSettings;
  performance?: SupplierPerformance;
  tags?: string[];
  notes?: SupplierNote[];
}

export default Supplier;
