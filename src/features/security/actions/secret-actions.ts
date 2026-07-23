"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { SecretService } from "../services/secret-service";
import { EncryptionService } from "../services/encryption-service";
import { SecretRepository } from "../repositories/secret-repository";
import {
  saveSecretSchema,
  rotateSecretSchema,
  rollbackSecretSchema,
  deleteSecretSchema,
} from "../types/validation";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function listMaskedSecretsAction(): Promise<{
  success: boolean;
  data?: {
    secrets: any[];
    masterKeyHealthy: boolean;
    auditLogs: any[];
    failedAccessLogs: any[];
  };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "identity.security.view");

  try {
    const service = new SecretService();
    const repo = new SecretRepository();

    const [secrets, auditLogs, failedAccessLogs] = await Promise.all([
      service.listMaskedSecrets(),
      repo.listAuditLogs(50),
      repo.listFailedAccessLogs(50),
    ]);

    const masterKeyHealthy = EncryptionService.verifyMasterKey();

    return {
      success: true,
      data: {
        secrets,
        masterKeyHealthy,
        auditLogs,
        failedAccessLogs,
      },
    };
  } catch (error: any) {
    logger.error("listMaskedSecretsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function saveSecretAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "identity.security.manage");

  try {
    const validated = saveSecretSchema.parse(formData);
    const service = new SecretService();
    const result = await service.saveSecret({
      ...validated,
      performedBy: session?.user?.name || session?.user?.id || "admin",
    });

    revalidatePath("/dashboard/identity/security/secrets");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("saveSecretAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function rotateSecretAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "identity.security.manage");

  try {
    const validated = rotateSecretSchema.parse(formData);
    const service = new SecretService();
    const result = await service.rotateSecret({
      provider: validated.provider as any,
      secretType: validated.secretType as any,
      newPlaintextValue: validated.newPlaintextValue,
      performedBy: session?.user?.name || session?.user?.id || "admin",
    });

    revalidatePath("/dashboard/identity/security/secrets");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("rotateSecretAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function rollbackSecretAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "identity.security.manage");

  try {
    const validated = rollbackSecretSchema.parse(formData);
    const service = new SecretService();
    const result = await service.rollbackSecret(
      validated.provider as any,
      validated.secretType as any,
      session?.user?.name || session?.user?.id || "admin",
    );

    revalidatePath("/dashboard/identity/security/secrets");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("rollbackSecretAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSecretAction(formData: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "identity.security.manage");

  try {
    const validated = deleteSecretSchema.parse(formData);
    const service = new SecretService();
    await service.softDeleteSecret(
      validated.provider as any,
      validated.secretType as any,
      session?.user?.name || session?.user?.id || "admin",
    );

    revalidatePath("/dashboard/identity/security/secrets");
    return { success: true };
  } catch (error: any) {
    logger.error("deleteSecretAction failed", error);
    return { success: false, error: error.message };
  }
}
