import { z } from "zod";

export const saveSecretSchema = z.object({
  provider: z.enum([
    "courier_steadfast",
    "courier_pathao",
    "smtp",
    "sms_gateway",
    "payment_bkash",
    "payment_nagad",
    "payment_sslcommerz",
    "payment_stripe",
    "cloudflare",
    "imagekit",
    "mongodb",
    "redis",
    "jwt",
    "custom",
  ]),
  secretType: z.enum([
    "api_key",
    "api_secret",
    "client_secret",
    "username",
    "password",
    "access_token",
    "refresh_token",
    "webhook_secret",
    "private_key",
    "certificate",
    "bearer_token",
  ]),
  displayName: z.string().min(1, "Display Name is required"),
  plaintextValue: z.string().min(1, "Secret value is required"),
  description: z.string().optional(),
});

export const rotateSecretSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  secretType: z.string().min(1, "Secret type is required"),
  newPlaintextValue: z.string().min(1, "New secret value is required"),
});

export const rollbackSecretSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  secretType: z.string().min(1, "Secret type is required"),
});

export const deleteSecretSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  secretType: z.string().min(1, "Secret type is required"),
});

export type SaveSecretInput = z.infer<typeof saveSecretSchema>;
export type RotateSecretInput = z.infer<typeof rotateSecretSchema>;
export type RollbackSecretInput = z.infer<typeof rollbackSecretSchema>;
export type DeleteSecretInput = z.infer<typeof deleteSecretSchema>;
