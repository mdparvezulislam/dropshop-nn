"use server";

import { auth } from "@/lib/auth";
import { CustomerService } from "../services/customer-service";
import { CustomerRepository } from "../repositories/customer-repository";
import {
  createCustomerSchema,
  updateCustomerSchema,
  addAddressSchema,
  addNoteSchema,
  updateTagsSchema,
} from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
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
  const session = (await auth()) as any;
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
  const session = (await auth()) as any;
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
  const session = (await auth()) as any;
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
  const session = (await auth()) as any;
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

export async function getCustomerAction(customerId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Customer.View");

  try {
    const repo = new CustomerRepository();
    const customer = await repo.findById(customerId);
    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    // Force workspace isolation
    if (session.user.role === "Reseller" && customer.workspaceId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: customer };
  } catch (error: any) {
    logger.error("getCustomerAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listCustomersAction(
  searchQuery?: string,
  page: number = 1,
  limit: number = 50,
): Promise<{
  success: boolean;
  data?: any[];
  totalCount?: number;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "customers.customer.view");

  try {
    const repo = new CustomerRepository();
    const filter: any = {};

    // Force workspace isolation boundary constraints for resellers
    const userRole = (session?.user?.role || "").toLowerCase();
    if (userRole.includes("reseller")) {
      filter.$or = [
        { workspaceId: session.user.id },
        { resellerId: session.user.id },
        { createdBy: session.user.id },
      ];
    }

    if (searchQuery?.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), "i");
      const searchConditions = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { tags: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const result = await repo.findPaginated(
      filter,
      { page: safePage, limit: safeLimit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    return { success: true, data: result.items, totalCount: result.totalCount };
  } catch (error: any) {
    logger.error("listCustomersAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function lookupCustomerByPhoneAction(phoneInput: string): Promise<{
  success: boolean;
  data?: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    district?: string;
    upazila?: string;
    address?: string;
  };
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false };
    }

    const clean = phoneInput.replace(/\D/g, "");
    if (clean.length < 10) {
      return { success: false };
    }

    const last10 = clean.slice(-10);
    const phoneRegex = new RegExp(last10, "i");

    const { CustomerModel } = await import("../repositories/customer-model");
    const { OrderModel } = await import("@/features/order/repositories/order-model");

    // Search CustomerModel first
    const customerDoc = await CustomerModel.findOne({ phone: phoneRegex }).exec();
    if (customerDoc) {
      const addr = customerDoc.addresses?.[0] || {};
      return {
        success: true,
        data: {
          id: customerDoc._id?.toString() || customerDoc.id,
          name: customerDoc.name,
          phone: customerDoc.phone,
          email: customerDoc.email || undefined,
          district: addr.district || addr.division,
          upazila: addr.upazila || addr.area,
          address: addr.landmark || addr.postalCode || (addr as any).address,
        },
      };
    }

    // Fallback search in OrderModel
    const orderDoc = await OrderModel.findOne({
      $or: [{ "customer.phone": phoneRegex }, { "shipping.phone": phoneRegex }],
    })
      .sort({ createdAt: -1 })
      .exec();

    if (orderDoc) {
      const shipping = orderDoc.shipping || {};
      const cust = orderDoc.customer || {};
      return {
        success: true,
        data: {
          name: shipping.receiverName || cust.name || "Customer",
          phone: shipping.phone || cust.phone || phoneInput,
          email: cust.email || undefined,
          district: shipping.district || shipping.division || "Dhaka",
          upazila: shipping.upazila || shipping.area || "",
          address: shipping.address || "",
        },
      };
    }

    return { success: false };
  } catch (error) {
    logger.error("lookupCustomerByPhoneAction failed", error);
    return { success: false };
  }
}

export async function saveCustomerProfileAction(data: {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  district?: string;
  upazila?: string;
  address?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = (await auth()) as any;
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "লগইন করা আবশ্যক।" };
    }

    const { CustomerModel } = await import("../repositories/customer-model");
    const workspaceId = session.user.role === "Reseller" ? userId : "admin-platform";

    const addressObj = {
      id: `ADR-${Date.now()}`,
      type: "home",
      division: data.district || "Dhaka",
      district: data.district || "Dhaka",
      upazila: data.upazila || data.district || "",
      area: data.upazila || data.district || "",
      landmark: data.address || "",
      postalCode: data.address || "",
      isDefault: true,
    };

    if (data.id) {
      const updated = await CustomerModel.findByIdAndUpdate(
        data.id,
        {
          $set: {
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            addresses: [addressObj],
          },
        },
        { new: true },
      );
      return { success: true, data: updated };
    }

    const existing = await CustomerModel.findOne({ phone: data.phone, workspaceId });
    if (existing) {
      const updated = await CustomerModel.findByIdAndUpdate(
        existing._id,
        {
          $set: {
            name: data.name,
            email: data.email || null,
            addresses: [addressObj],
          },
        },
        { new: true },
      );
      return { success: true, data: updated };
    }

    const created = await CustomerModel.create({
      workspaceId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      source: "manual",
      status: "active",
      addresses: [addressObj],
      notes: [],
      tags: ["Regular"],
      timeline: [
        {
          eventType: "customer.created",
          timestamp: new Date(),
          message: "Customer added manually",
          actorId: userId,
        },
      ],
      statistics: {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
      },
    });

    return { success: true, data: created };
  } catch (error: any) {
    logger.error("saveCustomerProfileAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(customerId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = (await auth()) as any;
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "লগইন করা আবশ্যক।" };
    }

    const { CustomerModel } = await import("../repositories/customer-model");
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি।" };
    }

    if (session.user.role === "Reseller" && customer.workspaceId !== userId) {
      return { success: false, error: "অনুমতি নেই।" };
    }

    await CustomerModel.findByIdAndDelete(customerId);
    return { success: true };
  } catch (error: any) {
    logger.error("deleteCustomerAction failed", error);
    return { success: false, error: error.message };
  }
}


