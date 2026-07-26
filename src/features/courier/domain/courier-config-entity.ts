import { BaseDBEntity } from "@/lib/database/types";

export type CourierProviderName =
  "steadfast" | "pathao" | "redx" | "ecourier" | "paperfly" | "sundarban" | "custom";

export interface PathaoCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  autoRefresh?: boolean;
}

export interface SteadfastCredentials {
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
}

export interface AutoBookingRules {
  autoBookOnConfirm: boolean;
  autoBookOnPayment: boolean;
  applyReseller: boolean;
  applyWholesale: boolean;
  applyRetail: boolean;
}

export interface CourierConfig extends BaseDBEntity {
  provider: CourierProviderName;
  displayName: string;
  enabled: boolean;
  isSandbox: boolean;
  apiBaseUrl: string;
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  webhookSecret?: string;
  defaultStatus: string;
  defaultPackageType: string;
  defaultWeight: number; // in grams
  defaultCodPolicy: string; // collect_full, collect_partial, no_cod
  pickupAddressId?: string;
  lastTestedAt?: Date;
  connectionStatus: "connected" | "disconnected" | "error" | "untested";
  lastErrorMessage?: string;

  // Extended Steadfast & Pathao Integration Settings
  pathaoConfig?: PathaoCredentials;
  steadfastConfig?: SteadfastCredentials;
  autoBookingRules?: AutoBookingRules;
  statusMapping?: Record<string, string>;
  bookingRetryCount?: number;
  bookingTimeoutMs?: number;
}
