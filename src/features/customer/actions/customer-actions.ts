"use server";

import { auth } from "@/shared/lib/auth";
import { CustomerService } from "../services/customer-service";
import { CustomerRepository } from "../repositories/customer-repository";
import {
  createCustomerSchema,
  updateCustomerSchema,
  addAddressSchema,
  addNoteSchema,
  updateTagsSchema,
} from "../types/validation";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Customer.Manage");

  try {
    const validated = createCustomerSchema.parse(formData);
    
    // Reseller can only create customer inside their own workspace tenant
    if (session.user.role === "Reseller" && validated.workspaceId !== session.user.id) {
      throw new Error("Unauthorized workspace tenant insertion target");
    }

    const service = new CustomerService();
    const result = await service.createCustomer(validated, session.user.id);
    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createCustomerAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateCustomerAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Customer.Manage");

  try {
    const validated = updateCustomerSchema.parse(formData);
    const service = new CustomerService();
    const repo = new CustomerRepository();

    // Verify tenant ownership
    const customer = await repo.findById(validated.customerId);
    if (!customer) {
      throw new Error("Customer profile not found");
    }

    if (session.user.role === "Reseller" && customer.workspaceId !== session.user.id) {
      throw new Error("Unauthorized tenant boundary mutation access");
    }

    const result = await service.updateCustomer(validated.customerId, validated, session.user.id);
    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateCustomerAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function addAddressAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Customer.Manage");

  try {
    const validated = addAddressSchema.parse(formData);
    const service = new CustomerService();
    const repo = new CustomerRepository();

    const customer = await repo.findById(validated.customerId);
    if (!customer) {
      throw new Error("Customer profile not found");
    }

    if (session.user.role === "Reseller" && customer.workspaceId !== session.user.id) {
      throw new Error("Unauthorized tenant access");
    }

    const result = await service.addAddress(validated.customerId, validated, session.user.id);
    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("addAddressAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function addNoteAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Customer.Manage");

  try {
    const validated = addNoteSchema.parse(formData);
    const service = new CustomerService();
    const repo = new CustomerRepository();

    const customer = await repo.findById(validated.customerId);
    if (!customer) {
      throw new Error("Customer profile not found");
    }

    if (session.user.role === "Reseller" && customer.workspaceId !== session.user.id) {
      throw new Error("Unauthorized tenant access");
    }

    const result = await service.addNote(
      validated.customerId,
      validated.note,
      session.user.id,
      validated.isPrivate,
    );
    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("addNoteAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateTagsAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Customer.Manage");

  try {
    const validated = updateTagsSchema.parse(formData);
    const service = new CustomerService();
    const repo = new CustomerRepository();

    const customer = await repo.findById(validated.customerId);
    if (!customer) {
      throw new Error("Customer profile not found");
    }

    if (session.user.role === "Reseller" && customer.workspaceId !== session.user.id) {
      throw new Error("Unauthorized tenant access");
    }

    const result = await service.updateTags(validated.customerId, validated.tags, session.user.id);
    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateTagsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listCustomersAction(searchQuery?: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Customer.View");

  try {
    const repo = new CustomerRepository();
    const filter: any = {};

    // Force workspace isolation boundary constraints for resellers
    if (session.user.role === "Reseller") {
      filter.workspaceId = session.user.id;
    }

    if (searchQuery?.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { tags: searchRegex },
      ];
    }

    const results = await repo.find(filter);
    // Sort in-memory by newest first
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listCustomersAction failed", error);
    return { success: false, error: error.message };
  }
}
