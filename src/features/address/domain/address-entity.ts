/**
 * Domain Entities & Interfaces for Address & Location Engine
 * NN Enterprise Commerce OS
 */

export interface SteadfastDistrictEntity {
  districtId: string;
  districtNameEn: string;
  districtNameBn: string;
  isDhaka: boolean;
  code?: string;
}

export interface SteadfastUpazilaEntity {
  upazilaId: string;
  districtId: string;
  upazilaNameEn: string;
  upazilaNameBn?: string;
  code?: string;
}

export interface LocationQueryResult<T> {
  success: boolean;
  data: T[];
  source: "provider" | "cache" | "fallback";
  error?: string;
}

export interface StructuredLocationAddress {
  districtId: string;
  districtName: string;
  upazilaId?: string;
  upazilaName?: string;
  addressLine: string;
  isDhaka: boolean;
  deliveryFee: number;
}

export interface LocationProvider {
  getDistricts(): Promise<SteadfastDistrictEntity[]>;
  getUpazilas(districtId: string): Promise<SteadfastUpazilaEntity[]>;
}
