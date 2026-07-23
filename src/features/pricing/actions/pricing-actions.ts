"use server";

import { auth } from "@/lib/auth";
import { PricingService } from "../services/pricing-service";
import {
  createPricingSchema,
  updatePricingSchema,
  bulkPriceUpdateSchema,
  bulkSupplierPriceUpdateSchema,
  pricingListQuerySchema,
} from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants";

export async function createPricingAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["createPricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Update");

  logger.info("Pricing Action: createPricingAction called", {
    email: session?.user?.email,
    event: "Price Changed",
  });

  const validated = createPricingSchema.parse(formData);
  const service = new PricingService();
  const result = await service.createPricing(validated, session?.user?.id);

  revalidatePath(ROUTES.PRICING);
  return { success: true, data: result };
}

export async function updatePricingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["updatePricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Update");

  logger.info("Pricing Action: updatePricingAction called", {
    id,
    event: "Price Changed",
  });

  const validated = updatePricingSchema.parse(formData);
  const service = new PricingService();
  const result = await service.updatePricing(id, validated, session?.user?.id);

  revalidatePath(ROUTES.PRICING);
  revalidatePath(`${ROUTES.PRICING}/${id}`);
  return { success: true, data: result };
}

export async function overridePricingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["overridePricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Override");

  logger.info("Pricing Action: overridePricingAction called", {
    id,
    event: "Price Changed",
  });

  const validated = updatePricingSchema.parse(formData);
  const service = new PricingService();
  const result = await service.overridePricing(id, validated, session?.user?.id);

  revalidatePath(ROUTES.PRICING);
  revalidatePath(`${ROUTES.PRICING}/${id}`);
  return { success: true, data: result };
}

export async function getPricingByIdAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["getPricingById"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.View");

  const service = new PricingService();
  const result = await service.getPricingById(id);
  return { success: true, data: result };
}

export async function listPricingAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["listPricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.View");

  const validated = pricingListQuerySchema.parse(query);
  const filter: Record<string, unknown> = {};

  if (validated.productId) filter.productId = validated.productId;
  if (validated.status && validated.status !== "all") filter.status = validated.status;
  if (validated.currency) filter.currency = validated.currency.toUpperCase();

  const service = new PricingService();
  const result = await service.listPricing(
    filter,
    { page: validated.page, limit: validated.limit },
    validated.sortBy
      ? { sortBy: validated.sortBy, sortOrder: validated.sortOrder }
      : { sortBy: "updatedAt", sortOrder: "desc" },
  );

  return { success: true, data: result };
}

export async function bulkUpdatePricesAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["bulkUpdatePrices"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Update");

  logger.info("Pricing Action: bulkUpdatePricesAction called", {
    email: session?.user?.email,
    event: "Price Changed",
  });

  const validated = bulkPriceUpdateSchema.parse(formData);
  const service = new PricingService();
  const result = await service.bulkUpdatePrices(validated, session?.user?.id);

  revalidatePath(ROUTES.PRICING);
  return { success: true, data: result };
}

export async function bulkUpdateSupplierPricesAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["bulkUpdateSupplierPrices"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Update");

  logger.info("Pricing Action: bulkUpdateSupplierPricesAction called", {
    email: session?.user?.email,
    event: "Supplier Price Changed",
  });

  const validated = bulkSupplierPriceUpdateSchema.parse(formData);
  const service = new PricingService();
  const result = await service.bulkUpdateSupplierPrices(validated, session?.user?.id);

  revalidatePath(ROUTES.PRICING);
  return { success: true, data: result };
}

export async function exportPricingAction(filter: unknown = {}): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<PricingService["exportPricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.View");

  const service = new PricingService();
  const result = await service.exportPricing(
    typeof filter === "object" && filter !== null ? (filter as object) : {},
  );
  return { success: true, data: result };
}

export async function softDeletePricingAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Update");

  logger.info("Pricing Action: softDeletePricingAction called", { id });

  const service = new PricingService();
  const result = await service.softDeletePricing(id);

  revalidatePath(ROUTES.PRICING);
  return { success: true, data: result };
}
