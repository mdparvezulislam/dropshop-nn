import type { BaseDBEntity } from "@/shared/lib/database/types";

export type UserAddressType = "home" | "office" | "warehouse" | "custom" | "store";

export interface UserAddress extends BaseDBEntity {
  userId: string;
  type: UserAddressType;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}

export interface UserDBAddressFields {
  userId: string;
  type: UserAddressType;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}
