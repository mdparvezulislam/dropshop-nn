"use server";

import { auth } from "@/shared/lib/auth";
import { InventoryService } from "../services/inventory-service";
import {
  createInventorySchema,
  updateInventorySchema,
  stockAdjustmentSchema,
  createSupplierInventorySchema,
  updateSupplierInventorySchema,
  bulkStockUpdateSchema,
  inventoryListQuerySchema,
  inventoryHistoryQuerySchema,
} from "../types/validation";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/shared/constants";

function checkPermission(
  session: { user?: { permissions?: string[]; email?: string | null; id?: string } } | null,
  permission: string,
): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export async function createInventoryAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["createInventory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Update");

  logger.info("Inventory Action: createInventoryAction called", {
    email: session?.user?.email,
    event: "Stock Updated",
  });

  const validated = createInventorySchema.parse(formData);
  const service = new InventoryService();
  const result = await service.createInventory(validated, session?.user?.id);

  revalidatePath(ROUTES.INVENTORY);
  return { success: true, data: result };
}

export async function updateInventoryAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["updateInventory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Update");

  logger.info("Inventory Action: updateInventoryAction called", {
    id,
    event: "Stock Updated",
  });

  const validated = updateInventorySchema.parse(formData);
  const service = new InventoryService();
  const result = await service.updateInventory(id, validated, session?.user?.id);

  revalidatePath(ROUTES.INVENTORY);
  revalidatePath(`${ROUTES.INVENTORY}/${id}`);
  return { success: true, data: result };
}

export async function adjustStockAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["adjustStock"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Adjust");

  logger.info("Inventory Action: adjustStockAction called", {
    email: session?.user?.email,
    event: "Stock Adjusted",
  });

  const validated = stockAdjustmentSchema.parse(formData);
  const service = new InventoryService();
  const result = await service.adjustStock(validated, session?.user?.id);

  revalidatePath(ROUTES.INVENTORY);
  revalidatePath(`${ROUTES.INVENTORY}/${validated.inventoryId}`);
  revalidatePath(`${ROUTES.INVENTORY}/history`);
  revalidatePath(`${ROUTES.INVENTORY}/low-stock`);
  return { success: true, data: result };
}

export async function getInventoryByIdAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["getInventoryById"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const service = new InventoryService();
  const result = await service.getInventoryById(id);
  return { success: true, data: result };
}

export async function listInventoryAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["listInventory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const validated = inventoryListQuerySchema.parse(query);
  const filter: Record<string, unknown> = {};

  if (validated.productId) filter.productId = validated.productId;
  if (validated.warehouseId) filter.warehouseId = validated.warehouseId;
  if (validated.availability && validated.availability !== "all") {
    filter.availability = validated.availability;
  }
  if (validated.status && validated.status !== "all") filter.status = validated.status;
  if (validated.lowStockOnly) {
    filter.availability = "low_stock";
  }

  const service = new InventoryService();
  const result = await service.listInventory(
    filter,
    { page: validated.page, limit: validated.limit },
    validated.sortBy
      ? { sortBy: validated.sortBy, sortOrder: validated.sortOrder }
      : { sortBy: "updatedAt", sortOrder: "desc" },
  );

  return { success: true, data: result };
}

export async function getInventoryDashboardAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["getDashboardStats"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const service = new InventoryService();
  const result = await service.getDashboardStats();
  return { success: true, data: result };
}

export async function getLowStockListAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["getLowStockList"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const service = new InventoryService();
  const result = await service.getLowStockList();
  return { success: true, data: result };
}

export async function markDamagedAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["markDamaged"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Adjust");

  const validated = stockAdjustmentSchema.parse(formData);
  const service = new InventoryService();
  const result = await service.markDamaged(
    validated.inventoryId,
    validated.quantity,
    validated.reason,
    session?.user?.id,
  );

  revalidatePath(ROUTES.INVENTORY);
  revalidatePath(`${ROUTES.INVENTORY}/damaged`);
  return { success: true, data: result };
}

export async function markReturnedAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["markReturned"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Adjust");

  const validated = stockAdjustmentSchema.parse(formData);
  const service = new InventoryService();
  const result = await service.markReturned(
    validated.inventoryId,
    validated.quantity,
    validated.reason,
    session?.user?.id,
  );

  revalidatePath(ROUTES.INVENTORY);
  revalidatePath(`${ROUTES.INVENTORY}/returns`);
  return { success: true, data: result };
}

export async function markSoldAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["markSold"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Adjust");

  const validated = stockAdjustmentSchema.parse(formData);
  const service = new InventoryService();
  const result = await service.markSold(
    validated.inventoryId,
    validated.quantity,
    validated.referenceId,
    session?.user?.id,
  );

  revalidatePath(ROUTES.INVENTORY);
  revalidatePath(`${ROUTES.INVENTORY}/history`);
  return { success: true, data: result };
}

export async function getInventoryHistoryAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["getHistory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const validated = inventoryHistoryQuerySchema.parse(query);
  const filter: Record<string, unknown> = {};

  if (validated.inventoryId) filter.inventoryId = validated.inventoryId;
  if (validated.productId) filter.productId = validated.productId;
  if (validated.operation && validated.operation !== "all") {
    filter.operation = validated.operation;
  }

  const service = new InventoryService();
  const result = await service.getHistory(
    filter,
    { page: validated.page, limit: validated.limit },
    validated.sortBy
      ? { sortBy: validated.sortBy, sortOrder: validated.sortOrder }
      : { sortBy: "createdAt", sortOrder: "desc" },
  );

  return { success: true, data: result };
}

export async function bulkUpdateStockAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["bulkUpdateStock"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Update");

  logger.info("Inventory Action: bulkUpdateStockAction called", {
    email: session?.user?.email,
    event: "Stock Updated",
  });

  const validated = bulkStockUpdateSchema.parse(formData);
  const service = new InventoryService();
  const result = await service.bulkUpdateStock(validated, session?.user?.id);

  revalidatePath(ROUTES.INVENTORY);
  revalidatePath(`${ROUTES.INVENTORY}/low-stock`);
  return { success: true, data: result };
}

export async function createSupplierInventoryAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["createSupplierInventory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Update");

  logger.info("Inventory Action: createSupplierInventoryAction called", {
    email: session?.user?.email,
  });

  const validated = createSupplierInventorySchema.parse(formData);
  const service = new InventoryService();
  const result = await service.createSupplierInventory(validated, session?.user?.id);

  revalidatePath(ROUTES.INVENTORY);
  return { success: true, data: result };
}

export async function updateSupplierInventoryAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["updateSupplierInventory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Update");

  logger.info("Inventory Action: updateSupplierInventoryAction called", {
    id,
    event: "Supplier Price Changed",
  });

  const validated = updateSupplierInventorySchema.parse(formData);
  const service = new InventoryService();
  const result = await service.updateSupplierInventory(id, validated, session?.user?.id);

  revalidatePath(ROUTES.INVENTORY);
  return { success: true, data: result };
}

export async function getSupplierInventoryAction(productId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["getSupplierInventoryByProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const service = new InventoryService();
  const result = await service.getSupplierInventoryByProduct(productId);
  return { success: true, data: result };
}

export async function getInventoryStockLevelsAction(id: string): Promise<{
  success: boolean;
  data?: ReturnType<InventoryService["getStockLevels"]>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const service = new InventoryService();
  const inventory = await service.getInventoryById(id);
  const levels = service.getStockLevels(inventory);
  return { success: true, data: levels };
}

export async function exportInventoryAction(filter: unknown = {}): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<InventoryService["exportInventory"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.View");

  const service = new InventoryService();
  const result = await service.exportInventory(
    typeof filter === "object" && filter !== null ? (filter as object) : {},
  );
  return { success: true, data: result };
}

export async function softDeleteInventoryAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Inventory.Update");

  logger.info("Inventory Action: softDeleteInventoryAction called", { id });

  const service = new InventoryService();
  const result = await service.softDeleteInventory(id);

  revalidatePath(ROUTES.INVENTORY);
  return { success: true, data: result };
}
