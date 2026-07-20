import { BaseDBEntity } from "@/shared/lib/database/types";

export type AddressType = "home" | "office" | "warehouse" | "custom" | "store";
export type CustomerStatus = "active" | "inactive" | "blacklisted";

export interface CustomerAddress {
  id: string;
  type: AddressType;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}

export interface CustomerNote {
  id: string;
  note: string;
  authorId: string;
  createdAt: Date;
  isPrivate: boolean; // True for private admin notes, False for reseller/public notes
}

export interface CustomerTimelineEntry {
  eventType: string;
  timestamp: Date;
  message: string;
  actorId?: string;
}

export interface CustomerStatistics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpend: number; // in cents
  averageOrderValue: number; // in cents
  lastOrderDate?: Date;
}

export interface Customer extends BaseDBEntity {
  workspaceId: string; // Reseller tenant workspace id
  name: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  birthDate?: Date;
  profileImage?: string;
  status: CustomerStatus;
  source: string; // guest_checkout, manual, registration, import
  addresses: CustomerAddress[];
  notes: CustomerNote[];
  tags: string[];
  timeline: CustomerTimelineEntry[];
  statistics: CustomerStatistics;
}
