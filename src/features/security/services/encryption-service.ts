import crypto from "crypto";
import { env } from "@/config/env";
import { logger } from "@/lib/utils/logger";
import type { EncryptedPayload } from "../domain/secret-entity";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits standard for GCM

export class EncryptionService {
  private static getMasterKeyBuffer(): Buffer {
    const rawKey =
      env.ENCRYPTION_MASTER_KEY ||
      "4f8a9b2c7e1d5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b";
    // Derived 32-byte (256-bit) Buffer from SHA-256 of master key string
    return crypto.createHash("sha256").update(rawKey).digest();
  }

  static encrypt(plaintext: string): EncryptedPayload {
    if (!plaintext) {
      throw new Error("Cannot encrypt empty string");
    }

    const key = EncryptionService.getMasterKeyBuffer();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return {
      encryptedValue: encrypted,
      iv: iv.toString("hex"),
      authTag,
    };
  }

  static decrypt(payload: EncryptedPayload): string {
    const key = EncryptionService.getMasterKeyBuffer();
    const iv = Buffer.from(payload.iv, "hex");
    const authTag = Buffer.from(payload.authTag, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(payload.encryptedValue, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  static maskSecret(plaintext: string, secretType?: string): string {
    if (!plaintext) return "************";
    const len = plaintext.length;

    if (len <= 4) {
      return "*".repeat(len);
    }

    if (plaintext.startsWith("sk_live_") || plaintext.startsWith("pk_live_")) {
      const prefix = plaintext.slice(0, 8);
      const suffix = plaintext.slice(-4);
      return `${prefix}********${suffix}`;
    }

    if (len <= 8) {
      return `${plaintext.slice(0, 2)}****${plaintext.slice(-2)}`;
    }

    const prefix = plaintext.slice(0, 3);
    const suffix = plaintext.slice(-4);
    return `${prefix}********${suffix}`;
  }

  static generateRandomSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static verifyMasterKey(): boolean {
    try {
      const sample = "dropshop_secret_test";
      const payload = EncryptionService.encrypt(sample);
      const decrypted = EncryptionService.decrypt(payload);
      return decrypted === sample;
    } catch (err: any) {
      logger.error("EncryptionService: verifyMasterKey failed", err);
      return false;
    }
  }
}

export default EncryptionService;
