import { BaseDBEntity } from "@/lib/database/types";

export type BusinessType = "sole_proprietorship" | "partnership" | "limited_company" | "individual";

export type BusinessUserRole = "reseller" | "wholesaler" | "supplier";

export type BusinessVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type BusinessStatus = "pending" | "active" | "suspended" | "blocked" | "archived";

export interface BusinessAddress {
  division: string;
  district: string;
  upazila: string;
  area?: string;
  postalCode?: string;
  fullAddress: string;
}

export interface BusinessDocuments {
  nidNumber?: string;
  tradeLicenseNumber?: string;
  tinNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bkashNumber?: string;
  nagadNumber?: string;
}

export interface BusinessSocialLinks {
  website?: string;
  facebookPage?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface BusinessProfile extends BaseDBEntity {
  userId: string;
  businessName: string;
  ownerName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  businessType: BusinessType;
  role: BusinessUserRole;
  description?: string;
  logo?: string;
  banner?: string;
  address: BusinessAddress;
  socialLinks?: BusinessSocialLinks;
  documents?: BusinessDocuments;
  verificationStatus: BusinessVerificationStatus;
  verificationNotes?: string;
  verifiedAt?: Date | null;
  verifiedBy?: string;
  status: BusinessStatus;
  statusReason?: string;
  suspendedAt?: Date | null;
}

export default BusinessProfile;
