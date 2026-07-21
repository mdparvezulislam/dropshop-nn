"use server";

import { z } from "zod";
import { auth } from "@/shared/lib/auth";
import { AuthService } from "@/features/auth/services/auth-service";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { UserAddressRepository } from "../repositories/user-address-repository";
import { UserNotificationPreferenceRepository } from "../repositories/user-notification-preference-repository";
import { WishlistItemRepository } from "@/features/catalog/repositories/wishlist-item-repository";
import { OrderService } from "@/features/order/services/order-service";
import { ProductService } from "@/features/catalog/services/product-service";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { BusinessProfileService } from "../services/business-profile-service";
import type { SessionUser } from "@/shared/lib/check-permission";
import type { SortParams } from "@/shared/types";
import { UnauthorizedError } from "@/shared/errors/app-error";
import { revalidatePath } from "next/cache";

function getSessionUser(session: unknown): { id: string; name?: string; email?: string; role?: string } {
  const user = (session as { user?: SessionUser } | null)?.user;
  if (!user?.id) throw new UnauthorizedError("Session expired or invalid");
  return { id: user.id, name: user.email ?? undefined, email: user.email ?? undefined };
}

const addressSchema = z.object({
  type: z.enum(["home", "office", "warehouse", "custom", "store"]),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Phone is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  area: z.string().min(1, "Area is required"),
  postalCode: z.string().optional(),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const notificationPrefSchema = z.object({
  orderUpdates: z.boolean(),
  marketingMessages: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

// ─── Overview ──────────────────────────────────────────

export interface AccountOverviewData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profileImage?: string;
  };
  orderCount: number;
  wishlistCount: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
  }[];
}

export async function getAccountOverviewAction(): Promise<{
  success: boolean;
  data?: AccountOverviewData;
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);
    const currentUserId = sessionUser.id;

    const userRepo = new UserRepository();
    const user = await userRepo.findById(currentUserId);
    if (!user) return { success: false, error: "User not found" };

    const orderService = new OrderService();
    const sortParams: SortParams = { sortBy: "createdAt", sortOrder: "desc" };
    const orderResult = await orderService.listOrders(
      { search: user.email },
      { page: 1, limit: 5 },
      sortParams,
    );

    const wishlistRepo = new WishlistItemRepository();
    const wishlistCount = await wishlistRepo.countByUser(currentUserId);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
        },
        orderCount: orderResult.totalCount,
        wishlistCount,
        recentOrders: orderResult.items.slice(0, 5).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.pricing?.total || 0,
          createdAt: o.createdAt,
        })),
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load account overview";
    return { success: false, error: msg };
  }
}

// ─── Profile ───────────────────────────────────────────

export async function updateAccountProfileAction(data: {
  fullName?: string;
  phone?: string;
  profileImage?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const authService = new AuthService();
    await authService.updateProfile(sessionUser.id, data);

    revalidatePath("/account");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: msg };
  }
}

// ─── Security ──────────────────────────────────────────

export async function changeAccountPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.newPassword !== data.confirmNewPassword) {
      return { success: false, error: "Passwords do not match" };
    }
    if (data.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" };
    }

    const session = await auth();
    const sessionUser = getSessionUser(session);

    const authService = new AuthService();
    await authService.changePassword(sessionUser.id, data.currentPassword, data.newPassword);

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to change password";
    return { success: false, error: msg };
  }
}

export async function getActiveSessionsAction(): Promise<{
  success: boolean;
  data?: { ip: string; userAgent: string; loggedAt: Date }[];
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const userRepo = new UserRepository();
    const user = await userRepo.findById(sessionUser.id);

    return {
      success: true,
      data: user?.loginHistory?.slice(-10).reverse() || [],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load sessions";
    return { success: false, error: msg };
  }
}

// ─── Addresses ─────────────────────────────────────────

export async function getAddressesAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const repo = new UserAddressRepository();
    const addresses = await repo.findByUser(sessionUser.id);

    return { success: true, data: addresses };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load addresses";
    return { success: false, error: msg };
  }
}

export async function addAddressAction(data: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const validated = addressSchema.parse(data);
    const repo = new UserAddressRepository();

    if (validated.isDefault) {
      await repo.unsetDefault(sessionUser.id);
    }

    const address = await repo.create({
      userId: sessionUser.id,
      ...validated,
    });

    revalidatePath("/account/addresses");
    return { success: true, data: address };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Invalid input" };
    }
    const msg = err instanceof Error ? err.message : "Failed to add address";
    return { success: false, error: msg };
  }
}

export async function updateAddressAction(
  addressId: string,
  data: unknown,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const validated = addressSchema.partial().parse(data);
    const repo = new UserAddressRepository();

    if (validated.isDefault) {
      await repo.unsetDefault(sessionUser.id);
    }

    await repo.update(addressId, validated);
    revalidatePath("/account/addresses");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Invalid input" };
    }
    const msg = err instanceof Error ? err.message : "Failed to update address";
    return { success: false, error: msg };
  }
}

export async function deleteAddressAction(addressId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    getSessionUser(session);

    const repo = new UserAddressRepository();
    await repo.delete(addressId);
    revalidatePath("/account/addresses");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete address";
    return { success: false, error: msg };
  }
}

// ─── Orders ────────────────────────────────────────────

export async function getOrdersAction(page = 1, limit = 10): Promise<{
  success: boolean;
  data?: {
    items: any[];
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const userRepo = new UserRepository();
    const user = await userRepo.findById(sessionUser.id);

    const orderService = new OrderService();
    const sortParams: SortParams = { sortBy: "createdAt", sortOrder: "desc" };
    const result = await orderService.listOrders(
      user?.email ? { search: user.email } : {},
      { page, limit },
      sortParams,
    );

    return {
      success: true,
      data: {
        items: result.items.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.pricing?.total || 0,
          itemCount: o.items?.length || 0,
          createdAt: o.createdAt,
        })),
        total: result.totalCount,
        page,
        totalPages: Math.ceil(result.totalCount / limit),
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load orders";
    return { success: false, error: msg };
  }
}

// ─── Wishlist ──────────────────────────────────────────

export async function getWishlistAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const wishlistRepo = new WishlistItemRepository();
    const items = await wishlistRepo.findByUser(sessionUser.id);

    if (items.length === 0) return { success: true, data: [] };

    const productService = new ProductService();
    const pricingService = new PricingService();

    const products = await Promise.all(
      items.map(async (item) => {
        const product = await productService.findById(item.productId);
        if (!product) return null;
        const pricing = await pricingService.getPricingByProduct(product.id);
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.media?.find((m: any) => m.isFeatured)?.url || product.media?.[0]?.url || "",
          retailPrice: pricing?.sellingPrice || 0,
          comparePrice: pricing?.comparePrice,
          rating: 0,
          stockStatus: "in_stock" as const,
          wishlistId: item.id,
        };
      }),
    );

    return { success: true, data: products.filter(Boolean) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load wishlist";
    return { success: false, error: msg };
  }
}

export async function addToWishlistAction(productId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const repo = new WishlistItemRepository();
    const existing = await repo.findByUserAndProduct(sessionUser.id, productId);

    if (!existing) {
      await repo.create({ userId: sessionUser.id, productId });
    }

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add to wishlist";
    return { success: false, error: msg };
  }
}

export async function removeFromWishlistAction(productId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const repo = new WishlistItemRepository();
    const existing = await repo.findByUserAndProduct(sessionUser.id, productId);
    if (existing) {
      await repo.delete(existing.id);
    }

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to remove from wishlist";
    return { success: false, error: msg };
  }
}

export async function removeWishlistItemAction(wishlistId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    getSessionUser(session);

    const repo = new WishlistItemRepository();
    await repo.delete(wishlistId);

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to remove from wishlist";
    return { success: false, error: msg };
  }
}

// ─── Notifications ────────────────────────────────────

export async function getNotificationPreferencesAction(): Promise<{
  success: boolean;
  data?: {
    orderUpdates: boolean;
    marketingMessages: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const repo = new UserNotificationPreferenceRepository();
    let prefs = await repo.findByUser(sessionUser.id);

    if (!prefs) {
      prefs = await repo.create({
        userId: sessionUser.id,
        orderUpdates: true,
        marketingMessages: false,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      });
    }

    return { success: true, data: prefs };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load preferences";
    return { success: false, error: msg };
  }
}

export async function updateNotificationPreferencesAction(data: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const validated = notificationPrefSchema.parse(data);
    const repo = new UserNotificationPreferenceRepository();

    const prefs = await repo.findByUser(sessionUser.id);
    if (prefs) {
      await repo.update(prefs.id, validated);
    } else {
      await repo.create({ userId: sessionUser.id, ...validated });
    }

    revalidatePath("/account/notifications");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Invalid input" };
    }
    const msg = err instanceof Error ? err.message : "Failed to update preferences";
    return { success: false, error: msg };
  }
}

// ─── Role Application ──────────────────────────────────

export async function submitRoleApplicationAction(data: {
  role: "reseller" | "wholesaler" | "supplier";
  businessName: string;
  ownerName: string;
  primaryPhone: string;
  businessType: string;
  address: {
    division: string;
    district: string;
    upazila: string;
    area?: string;
    fullAddress: string;
  };
  description?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const bpService = new BusinessProfileService();
    await bpService.create({
      ...data,
      email: sessionUser.email || "",
      userId: sessionUser.id,
    } as any);

    revalidatePath("/account/role");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to submit application";
    return { success: false, error: msg };
  }
}

export async function getRoleApplicationStatusAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const session = await auth();
    const sessionUser = getSessionUser(session);

    const bpService = new BusinessProfileService();
    const repo = (bpService as any).businessProfileRepository;
    const profiles = await repo.find({ createdBy: sessionUser.id });

    return {
      success: true,
      data: profiles.map((p: any) => ({
        id: p.id,
        role: p.role,
        businessName: p.businessName,
        status: p.status,
        createdAt: p.createdAt,
      })),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to check application status";
    return { success: false, error: msg };
  }
}
