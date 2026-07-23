import { SecretRepository } from "../repositories/secret-repository";
import { EncryptionService } from "./encryption-service";
import type { PlatformSecret, SecretProvider, SecretType } from "../domain/secret-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";

export class SecretService {
  private readonly repository: SecretRepository;

  constructor() {
    this.repository = new SecretRepository();
  }

  async saveSecret(input: {
    provider: SecretProvider;
    secretType: SecretType;
    displayName: string;
    plaintextValue: string;
    description?: string;
    performedBy?: string;
  }): Promise<PlatformSecret> {
    const performedBy = input.performedBy || "system";
    const existing = await this.repository.findByProviderAndType(input.provider, input.secretType);

    const encrypted = EncryptionService.encrypt(input.plaintextValue);
    const maskedValue = EncryptionService.maskSecret(input.plaintextValue, input.secretType);

    const updated = await this.repository.upsertSecret({
      provider: input.provider,
      secretType: input.secretType,
      displayName: input.displayName,
      description: input.description,
      encryptedValue: encrypted.encryptedValue,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      maskedValue,
      version: existing ? existing.version + 1 : 1,
      currentVersion: existing ? existing.version + 1 : 1,
      previousVersion: existing ? existing.version : undefined,
      previousEncryptedValue: existing ? existing.encryptedValue : undefined,
      previousIv: existing ? existing.iv : undefined,
      previousAuthTag: existing ? existing.authTag : undefined,
      status: "active",
    });

    await this.repository.createAuditLog({
      secretId: updated.id,
      provider: input.provider,
      secretType: input.secretType,
      action: existing ? "updated" : "created",
      performedBy,
      timestamp: new Date(),
      details: `Saved ${input.displayName} secret`,
    });

    await EventBus.publish(
      "secret.saved",
      { provider: input.provider, secretType: input.secretType, version: updated.version, performedBy },
      { source: "secret-service" },
    );

    logger.info("SecretService: saved secret", { provider: input.provider, secretType: input.secretType });
    return updated;
  }

  async getDecryptedSecret(provider: SecretProvider, secretType: SecretType, performedBy: string = "system"): Promise<string | null> {
    const secret = await this.repository.findByProviderAndType(provider, secretType);
    if (!secret || secret.status === "revoked") {
      await this.repository.createFailedAccessLog({
        secretId: secret?.id,
        provider,
        failureReason: "decryption_failed",
        attemptedBy: performedBy,
        timestamp: new Date(),
        errorMessage: "Secret missing or revoked",
      });
      return null;
    }

    try {
      const plaintext = EncryptionService.decrypt({
        encryptedValue: secret.encryptedValue,
        iv: secret.iv,
        authTag: secret.authTag,
      });

      await this.repository.upsertSecret({
        provider,
        secretType,
        lastUsedAt: new Date(),
      });

      return plaintext;
    } catch (err: any) {
      await this.repository.createFailedAccessLog({
        secretId: secret.id,
        provider,
        failureReason: "tamper_detected",
        attemptedBy: performedBy,
        timestamp: new Date(),
        errorMessage: err.message,
      });
      logger.error("SecretService: decryption error", { provider, secretType, error: err.message });
      return null;
    }
  }

  async rotateSecret(input: {
    provider: SecretProvider;
    secretType: SecretType;
    newPlaintextValue: string;
    performedBy?: string;
  }): Promise<PlatformSecret> {
    const performedBy = input.performedBy || "system";
    const existing = await this.repository.findByProviderAndType(input.provider, input.secretType);

    if (!existing) {
      throw new Error(`Cannot rotate secret for ${input.provider}/${input.secretType}: Secret does not exist`);
    }

    const encrypted = EncryptionService.encrypt(input.newPlaintextValue);
    const maskedValue = EncryptionService.maskSecret(input.newPlaintextValue, input.secretType);
    const nextVersion = existing.version + 1;

    const rotated = await this.repository.upsertSecret({
      provider: input.provider,
      secretType: input.secretType,
      encryptedValue: encrypted.encryptedValue,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      maskedValue,
      version: nextVersion,
      currentVersion: nextVersion,
      previousVersion: existing.version,
      rollbackVersion: existing.version,
      previousEncryptedValue: existing.encryptedValue,
      previousIv: existing.iv,
      previousAuthTag: existing.authTag,
      status: "active",
      rotatedAt: new Date(),
    });

    await this.repository.createAuditLog({
      secretId: rotated.id,
      provider: input.provider,
      secretType: input.secretType,
      action: "rotated",
      performedBy,
      timestamp: new Date(),
      details: `Rotated secret to version ${nextVersion}`,
    });

    logger.info("SecretService: rotated secret", { provider: input.provider, version: nextVersion });
    return rotated;
  }

  async rollbackSecret(provider: SecretProvider, secretType: SecretType, performedBy: string = "system"): Promise<PlatformSecret> {
    const secret = await this.repository.findByProviderAndType(provider, secretType);
    if (!secret || !secret.previousEncryptedValue || !secret.previousIv || !secret.previousAuthTag) {
      throw new Error("No previous secret version available for rollback");
    }

    const prevPlaintext = EncryptionService.decrypt({
      encryptedValue: secret.previousEncryptedValue,
      iv: secret.previousIv,
      authTag: secret.previousAuthTag,
    });

    const maskedValue = EncryptionService.maskSecret(prevPlaintext, secretType);

    const rolledBack = await this.repository.upsertSecret({
      provider,
      secretType,
      encryptedValue: secret.previousEncryptedValue,
      iv: secret.previousIv,
      authTag: secret.previousAuthTag,
      maskedValue,
      version: secret.version + 1,
      currentVersion: secret.version + 1,
      previousVersion: secret.version,
      status: "active",
    });

    await this.repository.createAuditLog({
      secretId: rolledBack.id,
      provider,
      secretType,
      action: "rolled_back",
      performedBy,
      timestamp: new Date(),
      details: `Rolled back secret version from v${secret.version} to v${secret.version + 1}`,
    });

    return rolledBack;
  }

  async listMaskedSecrets(): Promise<PlatformSecret[]> {
    return this.repository.listAllSecrets();
  }

  async softDeleteSecret(provider: SecretProvider, secretType: SecretType, performedBy: string = "system"): Promise<void> {
    const secret = await this.repository.findByProviderAndType(provider, secretType);
    if (secret) {
      await this.repository.upsertSecret({
        provider,
        secretType,
        status: "revoked",
        isDeleted: true,
      });

      await this.repository.createAuditLog({
        secretId: secret.id,
        provider,
        secretType,
        action: "deleted",
        performedBy,
        timestamp: new Date(),
        details: `Soft deleted secret`,
      });
    }
  }
}

export default SecretService;
