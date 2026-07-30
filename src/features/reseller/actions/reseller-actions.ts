"use server";

import { auth } from "@/lib/auth";
import { ResellerService } from "../services/reseller-service";
import { ProductAssignmentService } from "../services/product-assignment-service";
import {
  createResellerSchema,
  updateResellerSchema,
  resellerStatusSchema,
  assignProductSchema,
  updateResellerProductSchema,
  updateResellerProductPricingSchema,
  createCollectionSchema,
  createProductGroupSchema,
  resellerListQuerySchema,
  resellerProductSearchSchema,
} from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

const RESELLERS_PATH = "/dashboard/resellers";

export async function createResellerAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["createReseller"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Create");

  logger.info("Reseller Action: createResellerAction", {
    email: session?.user?.email,
    event: "Reseller Created",
  });

  const validated = createResellerSchema.parse(formData);
  const service = new ResellerService();
  const result = await service.createReseller(validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function updateResellerAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["updateReseller"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: updateResellerAction", {
    id,
    event: "Reseller Updated",
  });

  const validated = updateResellerSchema.parse(formData);
  const service = new ResellerService();
  const result = await service.updateReseller(id, validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  revalidatePath(`${RESELLERS_PATH}/${id}`);
  return { success: true, data: result };
}

export async function updateResellerMarkupAction(
  id: string,
  resellerMarkupPercent?: number,
  wholesaleMarkupPercent?: number,
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ResellerService();
  const result = await service.updateReseller(
    id,
    { resellerMarkupPercent, wholesaleMarkupPercent },
    session?.user?.id,
  );

  revalidatePath(RESELLERS_PATH);
  revalidatePath(`${RESELLERS_PATH}/${id}`);
  return { success: true, data: result };
}

export async function updateResellerStatusAction(
  id: string,
  status: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["updateStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  const parsedStatus = resellerStatusSchema.parse(status);

  const permission =
    parsedStatus === "suspended" || parsedStatus === "blocked"
      ? "Reseller.Suspend"
      : "Reseller.Update";
  checkPermission(session, permission);

  logger.info("Reseller Action: updateResellerStatusAction", { id, status: parsedStatus });

  const service = new ResellerService();
  const result = await service.updateStatus(id, parsedStatus, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  revalidatePath(`${RESELLERS_PATH}/${id}`);
  return { success: true, data: result };
}

export async function getResellerByIdAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["getResellerById"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const service = new ResellerService();
  const result = await service.getResellerById(id);
  return { success: true, data: result };
}

export async function listResellersAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["searchResellers"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const validated = resellerListQuerySchema.parse(query);
  const service = new ResellerService();
  const result = await service.searchResellers(validated);
  return { success: true, data: result };
}

export async function softDeleteResellerAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ResellerService();
  const result = await service.softDelete(id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function assignProductAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["assignProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: assignProductAction", {
    email: session?.user?.email,
    event: "Product Added",
  });

  const validated = assignProductSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.assignProduct(validated, session?.user?.id);

  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}`);
  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}/products`);
  return { success: true, data: result };
}

export async function removeResellerProductAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: removeResellerProductAction", {
    id,
    event: "Product Removed",
  });

  const service = new ProductAssignmentService();
  const result = await service.removeProduct(id, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function updateResellerProductAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["updateResellerProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const validated = updateResellerProductSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.updateResellerProduct(id, validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function updateResellerProductPricingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["updatePricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: updateResellerProductPricingAction", {
    id,
    event: "Price Updated",
  });

  const validated = updateResellerProductPricingSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.updatePricing(id, validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function resetResellerProductPriceAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["resetPrice"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ProductAssignmentService();
  const result = await service.resetPrice(id, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function previewResellerProductPricingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["previewPricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const validated = updateResellerProductPricingSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.previewPricing(id, validated);
  return { success: true, data: result };
}

type AuthSession = {
  user?: { id?: string; email?: string | null; role?: string; name?: string | null };
} | null;

async function resolvePortalResellerId(session: AuthSession, resellerId?: string): Promise<string> {
  const user = session?.user;
  const role = (user?.role ?? "").toLowerCase();
  const isStaff = role.includes("admin") || role === "manager" || role === "super_admin";

  if (resellerId && resellerId !== "me" && resellerId !== "current") {
    if (!isStaff && user?.id) {
      try {
        const service = new ResellerService();
        const own = await service.resolveForUser(user.id, user.email);
        if (own && own.id !== resellerId) {
          return resellerId;
        }
      } catch {
        return resellerId;
      }
    }
    return resellerId;
  }

  if (user?.id) {
    try {
      const service = new ResellerService();
      const reseller = await service.resolveForUser(user.id, user.email);
      if (reseller?.id) return reseller.id;
    } catch {
      // fallback
    }
    return user.id;
  }

  return "default-reseller";
}

export async function resolveCurrentResellerAction(): Promise<{
  success: boolean;
  data?: {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    status: string;
    code: string;
  };
  error?: string;
}> {
  try {
    const session = (await auth()) as AuthSession;
    if (!session?.user) return { success: false, error: "Unauthorized" };
    checkPermission(session as never, "Reseller.View");
    const user = session.user;
    const service = new ResellerService();
    const reseller = user?.id ? await service.resolveForUser(user.id, user.email) : null;
    if (!reseller) {
      return {
        success: false,
        error: "No reseller profile linked to this account",
      };
    }
    return {
      success: true,
      data: {
        id: reseller.id,
        businessName: reseller.businessName,
        ownerName: reseller.ownerName,
        email: reseller.email,
        status: reseller.status,
        code: reseller.code,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to resolve reseller",
    };
  }
}

export async function searchResellerProductsAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["searchResellerProducts"]>>;
  error?: string;
}> {
  try {
    const session = (await auth()) as AuthSession;
    checkPermission(session as never, "Reseller.View");

    const validated = resellerProductSearchSchema.parse(query);
    const resellerId = await resolvePortalResellerId(session, validated.resellerId);
    const service = new ProductAssignmentService();
    const result = await service.searchResellerProducts({
      ...validated,
      resellerId,
    });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to search products",
    };
  }
}

export async function getResellerDashboardAction(resellerId?: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["getDashboardStats"]>> & {
    resellerId: string;
  };
  error?: string;
}> {
  try {
    const session = (await auth()) as AuthSession;
    checkPermission(session as never, "Reseller.View");
    const id = await resolvePortalResellerId(session, resellerId);
    const service = new ProductAssignmentService();
    const result = await service.getDashboardStats(id);
    return { success: true, data: { ...result, resellerId: id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load dashboard",
    };
  }
}

export async function getMyResellerProfileAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["getResellerById"]>>;
  error?: string;
}> {
  try {
    const session = (await auth()) as AuthSession;
    checkPermission(session as never, "Reseller.View");
    const id = await resolvePortalResellerId(session);
    const service = new ResellerService();
    const result = await service.getResellerById(id);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load profile",
    };
  }
}

export async function updateMyResellerProfileAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["updateReseller"]>>;
  error?: string;
}> {
  try {
    const session = (await auth()) as AuthSession;
    checkPermission(session as never, "Reseller.Update");
    const id = await resolvePortalResellerId(session);
    const validated = updateResellerSchema.parse(formData);
    const service = new ResellerService();
    const result = await service.updateReseller(id, validated, session?.user?.id);
    revalidatePath("/reseller/settings");
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

export async function createResellerCollectionAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["createCollection"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const validated = createCollectionSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.createCollection(validated, session?.user?.id);

  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}`);
  return { success: true, data: result };
}

export async function createResellerProductGroupAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["createProductGroup"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const validated = createProductGroupSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.createProductGroup(validated, session?.user?.id);

  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}`);
  return { success: true, data: result };
}

export async function favoriteResellerProductAction(
  id: string,
  isFavorite: boolean,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["favoriteProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ProductAssignmentService();
  const result = await service.favoriteProduct(id, isFavorite, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function hideResellerProductAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["hideProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ProductAssignmentService();
  const result = await service.hideProduct(id, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function getResellerShopSettingsAction(): Promise<{
  success: boolean;
  data?: {
    businessName: string;
    ownerName: string;
    phone: string;
    whatsapp: string;
    email: string;
    logo: string;
    coverImage: string;
    address: string;
    description: string;
    invoiceFooter: string;
    defaultDeliveryCharge: number;
    status: string;
  };
  error?: string;
}> {
  const session = (await auth()) as any;
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { ResellerModel } = await import("../repositories/reseller-model");
    const { UserModel } = await import("@/features/auth/repositories/user-model");

    let resellerDoc = await ResellerModel.findOne({ userId }).exec();
    const userDoc = await UserModel.findById(userId).exec();

    if (!resellerDoc && userDoc) {
      resellerDoc = await ResellerModel.findOne({ phone: userDoc.phone }).exec();
    }

    return {
      success: true,
      data: {
        businessName: resellerDoc?.businessName || (userDoc as any)?.shopName || session.user.name || "DropshopNN Reseller Store",
        ownerName: resellerDoc?.ownerName || userDoc?.name || "Md Reseller",
        phone: resellerDoc?.phone || userDoc?.phone || "01700000000",
        whatsapp: (userDoc as any)?.whatsapp || resellerDoc?.alternativePhone || resellerDoc?.phone || "01700000000",
        email: resellerDoc?.email || userDoc?.email || "",
        logo: resellerDoc?.logo || "",
        coverImage: resellerDoc?.coverImage || "",
        address: resellerDoc?.address?.fullAddress || "Dhanmondi, Dhaka, Bangladesh",
        description: resellerDoc?.notes || "সেরা দামে কোয়ালিটি পণ্য সরবরাহকারী ই-কমার্স শপ।",
        invoiceFooter: (userDoc as any)?.invoiceFooter || resellerDoc?.notes || "কেনাকাটার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে যোগাযোগ করুন।",
        defaultDeliveryCharge: 80,
        status: resellerDoc?.status || "active",
      },
    };
  } catch (error: any) {
    logger.error("getResellerShopSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function saveResellerShopSettingsAction(data: {
  businessName: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  description?: string;
  invoiceFooter?: string;
  defaultDeliveryCharge?: number;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "অনুমোদিত নয়। অনুগ্রহ করে লগইন করুন।" };
  }

  try {
    const { ResellerModel } = await import("../repositories/reseller-model");
    const { UserModel } = await import("@/features/auth/repositories/user-model");

    let resellerDoc = await ResellerModel.findOne({ userId });
    if (!resellerDoc && session.user.phone) {
      resellerDoc = await ResellerModel.findOne({ phone: session.user.phone });
    }

    if (!resellerDoc) {
      const code = `RS-${Date.now().toString().slice(-6)}`;
      resellerDoc = await ResellerModel.create({
        code,
        businessName: data.businessName || session.user.name || "Reseller Store",
        ownerName: data.ownerName || session.user.name || "Reseller Owner",
        contactPerson: data.ownerName || session.user.name || "Reseller",
        email: data.email || session.user.email || `${code.toLowerCase()}@dropshop.nn`,
        phone: data.phone || session.user.phone || "01700000000",
        logo: data.logo || "",
        coverImage: data.coverImage || "",
        businessType: "e_commerce",
        address: {
          country: "Bangladesh",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Dhaka",
          area: "Dhaka",
          postalCode: "1200",
          fullAddress: data.address || "Dhaka, Bangladesh",
        },
        status: "active",
        userId,
        notes: data.invoiceFooter || "কেনাকাটার জন্য ধন্যবাদ!",
      });
    } else {
      resellerDoc.businessName = data.businessName || resellerDoc.businessName;
      if (data.ownerName) resellerDoc.ownerName = data.ownerName;
      if (data.phone) resellerDoc.phone = data.phone;
      if (data.logo !== undefined) resellerDoc.logo = data.logo;
      if (data.coverImage !== undefined) resellerDoc.coverImage = data.coverImage;
      if (data.address) {
        resellerDoc.address = {
          ...resellerDoc.address,
          fullAddress: data.address,
        };
      }
      if (data.invoiceFooter !== undefined) resellerDoc.notes = data.invoiceFooter;

      await resellerDoc.save();
    }

    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        name: data.ownerName || session.user.name,
        shopName: data.businessName,
        whatsapp: data.whatsapp,
        invoiceFooter: data.invoiceFooter,
      },
    });

    revalidatePath("/reseller/settings");
    revalidatePath("/reseller/orders");
    return {
      success: true,
      data: {
        id: String(resellerDoc._id),
        businessName: resellerDoc.businessName,
        ownerName: resellerDoc.ownerName,
        phone: resellerDoc.phone,
        email: resellerDoc.email,
        address: resellerDoc.address?.fullAddress || "",
        invoiceFooter: resellerDoc.notes || "",
      },
    };
  } catch (error: any) {
    logger.error("saveResellerShopSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

