import { BaseDBEntity } from "@/shared/lib/database/types";

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

export interface Supplier extends BaseDBEntity {
  code: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  businessType: string;
  tradeLicenseNumber: string;
  binNumber?: string;
  tinNumber?: string;
  nidVerified: boolean;
  businessVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  address: SupplierAddress;
  status: "pending" | "active" | "suspended" | "blocked" | "archived";
  contacts: SupplierContact[];
  banking?: SupplierBankAccount;
  documents: SupplierDocument[];
  settings?: SupplierSettings;
}
export default Supplier;
