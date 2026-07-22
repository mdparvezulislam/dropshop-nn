"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { DeliveryOpsService } from "../services/delivery-ops-service";
import { DeliveryReturnService } from "../services/delivery-return-service";
import { DeliveryDisputeService } from "../services/delivery-dispute-service";
import { ShippingRuleService } from "../services/shipping-rule-service";
import { CODReconciliationService } from "../services/cod-reconciliation-service";
import {
  recordAttemptSchema,
  reassignCourierSchema,
  manualInterventionSchema,
  createReturnSchema,
  updateReturnStatusSchema,
  createRTSSchema,
  inspectRTSSchema,
  recordPartialDeliverySchema,
  createDisputeSchema,
  escalateDisputeSchema,
  createShippingRuleSchema,
  createDeliveryZoneSchema,
  createCostRuleSchema,
} from "../types/validation";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

export async function recordDeliveryAttemptAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = recordAttemptSchema.parse(formData);
    const service = new DeliveryOpsService();
    const result = await service.recordAttempt({
      ...validated,
      actorId: session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("recordDeliveryAttemptAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function reassignCourierAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = reassignCourierSchema.parse(formData);
    const service = new DeliveryOpsService();
    const result = await service.reassignCourier({
      ...validated,
      actorId: session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("reassignCourierAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function recordPartialDeliveryAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = recordPartialDeliverySchema.parse(formData);
    const service = new DeliveryOpsService();
    const result = await service.recordPartialDelivery(
      validated.shipmentId,
      validated.partialCodCents,
      validated.notes,
      session?.user?.id || "admin",
    );
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("recordPartialDeliveryAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function manualInterventionAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = manualInterventionSchema.parse(formData);
    const service = new DeliveryOpsService();
    const result = await service.executeManualIntervention({
      ...validated,
      actorId: session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("manualInterventionAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createDeliveryReturnAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = createReturnSchema.parse(formData);
    const service = new DeliveryReturnService();
    const result = await service.initiateReturn({
      ...validated,
      initiatedBy: session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createDeliveryReturnAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateReturnStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = updateReturnStatusSchema.parse(formData);
    const service = new DeliveryReturnService();
    const result = await service.updateReturnStatus(
      validated.returnId,
      validated.status,
      validated.notes,
      session?.user?.id || "admin",
    );
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateReturnStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createRTSAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = createRTSSchema.parse(formData);
    const service = new DeliveryReturnService();
    const result = await service.createRTS({
      ...validated,
      actorId: session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createRTSAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function inspectRTSAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = inspectRTSSchema.parse(formData);
    const service = new DeliveryReturnService();
    const result = await service.inspectRTSPackage(validated.rtsId, validated.condition, validated.notes);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("inspectRTSAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createDeliveryDisputeAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = createDisputeSchema.parse(formData);
    const service = new DeliveryDisputeService();
    const result = await service.createDispute({
      ...validated,
      actorId: session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createDeliveryDisputeAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function escalateDisputeAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = escalateDisputeSchema.parse(formData);
    const service = new DeliveryDisputeService();
    const result = await service.escalateDispute({
      ...validated,
      escalatedBy: session?.user?.name || session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("escalateDisputeAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listDeliveryOpsDataAction(): Promise<{
  success: boolean;
  data?: {
    returns: any[];
    rtsList: any[];
    disputes: any[];
    escalations: any[];
    zones: any[];
    rules: any[];
    costRules: any[];
    exceptions: any;
    slaWarnings: any[];
    codSummary: any;
  };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const returnService = new DeliveryReturnService();
    const disputeService = new DeliveryDisputeService();
    const ruleService = new ShippingRuleService();
    const opsService = new DeliveryOpsService();
    const codService = new CODReconciliationService();

    const [returns, rtsList, disputes, escalations, zones, rules, costRules, exceptions, slaWarnings, codSummary] =
      await Promise.all([
        returnService.listReturns(),
        returnService.listRTS(),
        disputeService.listDisputes(),
        disputeService.listEscalations(),
        ruleService.listZones(),
        ruleService.listShippingRules(),
        ruleService.listCostRules(),
        opsService.getExceptionQueue(),
        opsService.getSLAWarnings(),
        codService.getCODMetrics(),
      ]);

    return {
      success: true,
      data: {
        returns,
        rtsList,
        disputes,
        escalations,
        zones,
        rules,
        costRules,
        exceptions,
        slaWarnings,
        codSummary,
      },
    };
  } catch (error: any) {
    logger.error("listDeliveryOpsDataAction failed", error);
    return { success: false, error: error.message };
  }
}
