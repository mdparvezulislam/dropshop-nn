import { BaseDBEntity } from "@/lib/database/types";

export type SecretProvider =
  | "courier_steadfast"
  | "courier_pathao"
  | "smtp"
  | "sms_gateway"
  | "payment_bkash"
  | "payment_nagad"
  | "payment_sslcommerz"
  | "payment_stripe"
  | "cloudflare"
  | "imagekit"
  | "mongodb"
  | "redis"
  | "jwt"
  | "custom";

export type SecretType =
  | "api_key"
  | "api_secret"
  | "client_secret"
  | "username"
  | "password"
  | "access_token"
  | "refresh_token"
  | "webhook_secret"
  | "private_key"
  | "certificate"
  | "bearer_token";

export type SecretStatus = "active" | "rotated" | "revoked" | "pending";

export interface EncryptedPayload {
  encryptedValue: string;
  iv: string;
  authTag: string;
}

export interface PlatformSecret extends BaseDBEntity {
  provider: SecretProvider;
  secretType: SecretType;
  displayName: string;
  description?: string;
  encryptedValue: string;
  iv: string;
  authTag: string;
  maskedValue: string; // e.g. "sk_live_********9XQ2"
  version: number;
  status: SecretStatus;
  currentVersion: number;
  previousVersion?: number;
  rollbackVersion?: number;
  previousEncryptedValue?: string;
  previousIv?: string;
  previousAuthTag?: string;
  lastUsedAt?: Date;
  rotatedAt?: Date;
}

export interface SecretAuditLog extends BaseDBEntity {
  secretId: string;
  provider: SecretProvider;
  secretType: SecretType;
  action: "created" | "updated" | "rotated" | "rolled_back" | "deleted" | "viewed_metadata";
  performedBy: string;
  timestamp: Date;
  ipAddress?: string;
  details?: string;
}

export interface SecretFailedAccessLog extends BaseDBEntity {
  secretId?: string;
  provider?: string;
  failureReason:
    | "unauthorized"
    | "invalid_permission"
    | "decryption_failed"
    | "missing_master_key"
    | "tamper_detected";
  attemptedBy: string;
  timestamp: Date;
  ipAddress?: string;
  errorMessage?: string;
}
