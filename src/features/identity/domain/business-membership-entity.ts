import { BaseDBEntity } from "@/lib/database/types";

export type BusinessMembershipType = string;

export interface MembershipBenefits {
  features: string[];
  pricingRules: {
    ruleType: string;
    discountPercent?: number;
    marginPercent?: number;
  };
  minimumOrderAmount: number;
  discountRules: {
    minQty?: number;
    discountPercent?: number;
  };
  accessRules: string[];
  dashboardVisibility: boolean;
  marketingAccess: boolean;
}

export interface BusinessMembershipTypeEntity extends BaseDBEntity {
  slug: string;
  name: string;
  banglaName: string;
  description: string;
  icon: string;
  color: string;
  priority: number;
  approvalRequired: boolean;
  isActive: boolean;
  isArchived: boolean;
  benefits: MembershipBenefits;
}

export type MembershipStatus = "active" | "suspended" | "expired";

export type ApplicationStatus =
  "pending" | "under_review" | "need_info" | "approved" | "rejected" | "suspended" | "expired";

export interface CommonApplicationFields {
  fullName: string;
  phone: string;
  altPhone?: string;
  bkashNumber: string;
  district: string;
  upazila: string;
  fullAddress: string;
  facebookProfile?: string;
  facebookPage?: string;
  website?: string;
  salesChannel: string;
}

export interface ResellerApplicationFields {
  monthlyOrders: "0-20" | "20-50" | "50-100" | "100+";
  productCategories: string[];
}

export interface WholesalerApplicationFields {
  companyName: string;
  businessType: "Retail Shop" | "Online Shop" | "Distributor" | "Dealer" | "Importer" | "Other";
  estimatedMonthlyPurchase: "২০,০০০+" | "৫০,০০০+" | "১,০০,০০০+" | "৫,০০,০০০+";
  tradeLicense?: string;
  binNumber?: string;
  tinNumber?: string;
}

export interface BusinessMembershipEntity extends BaseDBEntity {
  userId: string;
  membershipType: BusinessMembershipType;
  status: MembershipStatus;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date | null;
  suspendedAt?: Date | null;
  suspensionReason?: string | null;
}

export interface BusinessMembershipApplicationEntity extends BaseDBEntity {
  userId: string;
  userFullName: string;
  userPhone: string;
  userEmail: string;
  membershipType: string;
  status: ApplicationStatus;
  commonFields: CommonApplicationFields;
  resellerFields?: ResellerApplicationFields;
  wholesalerFields?: WholesalerApplicationFields;
  reviewNotes?: string;
  adminQuestion?: string;
  userAnswer?: string;
  reviewedBy?: string;
  reviewedAt?: Date | null;
  rejectionReason?: string;
}

export interface BusinessMembershipHistoryEntity extends BaseDBEntity {
  userId: string;
  applicationId?: string;
  membershipType: string;
  action:
    | "submitted"
    | "edited"
    | "review_started"
    | "need_info_requested"
    | "approved"
    | "rejected"
    | "suspended"
    | "restored"
    | "membership_assigned"
    | "membership_removed";
  actorId: string;
  actorRole: string;
  previousStatus?: string;
  newStatus?: string;
  note?: string;
  createdAt: Date;
}

export interface ApplicationNoteEntity extends BaseDBEntity {
  applicationId: string;
  authorId: string;
  authorName: string;
  note: string;
  isInternal: boolean;
  createdAt: Date;
}
