"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { WishlistItemRepository } from "../repositories/wishlist-item-repository";
import { PublicCatalogService } from "../services/public-catalog-service";
import type { PublicProductCard } from "../domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

/**
 * Wishlist actions. Product data is rendered through PublicCatalogService so
 * wishlist cards carry the same real prices (BDT), real stock status and real
 * ratings as every other surface — no second mapping to drift.
 */

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id");

async function sessionUserId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  return user?.id ?? null;
}

export interface WishlistEntry {
  wishlistId: string;
  product: PublicProductCard;
}

export async function getMyWishlistAction(): Promise<ActionResult<WishlistEntry[]>> {
  try {
    const userId = await sessionUserId();
    if (!userId) return { success: false, error: "লগইন করুন" };

    const items = await new WishlistItemRepository().findByUser(userId);
    if (items.length === 0) return { success: true, data: [] };

    // One batched catalog read for every saved product.
    const result = await new PublicCatalogService().listCards({
      productIds: items.map((item) => item.productId),
      limit: 48,
      page: 1,
    });

    const byProductId = new Map(result.items.map((card) => [card.id, card]));
    const entries: WishlistEntry[] = [];
    for (const item of items) {
      const product = byProductId.get(item.productId);
      // Products that were unpublished/deleted simply drop out of the list.
      if (product) entries.push({ wishlistId: item.id, product });
    }

    return { success: true, data: entries };
  } catch (error) {
    logger.error("getMyWishlistAction failed", error);
    return { success: false, error: "উইশলিস্ট লোড করা যায়নি" };
  }
}

/** Ids only — powers the heart-toggle state without shipping product payloads. */
export async function getMyWishlistIdsAction(): Promise<ActionResult<string[]>> {
  try {
    const userId = await sessionUserId();
    if (!userId) return { success: true, data: [] };
    const items = await new WishlistItemRepository().findByUser(userId);
    return { success: true, data: items.map((item) => item.productId) };
  } catch (error) {
    logger.error("getMyWishlistIdsAction failed", error);
    return { success: true, data: [] };
  }
}

export async function toggleWishlistAction(
  productId: string,
): Promise<ActionResult<{ inWishlist: boolean }>> {
  try {
    const userId = await sessionUserId();
    if (!userId) return { success: false, error: "উইশলিস্টে যোগ করতে লগইন করুন" };

    const id = objectId.parse(productId);
    const repo = new WishlistItemRepository();
    const existing = await repo.findByUserAndProduct(userId, id);

    if (existing) {
      await repo.delete(existing.id);
      revalidatePath("/account/wishlist");
      return { success: true, data: { inWishlist: false } };
    }

    await repo.create({ userId, productId: id } as never);
    revalidatePath("/account/wishlist");
    return { success: true, data: { inWishlist: true } };
  } catch (error) {
    logger.error("toggleWishlistAction failed", error);
    return { success: false, error: "উইশলিস্ট আপডেট করা যায়নি" };
  }
}

export async function removeWishlistProductAction(productId: string): Promise<ActionResult<null>> {
  try {
    const userId = await sessionUserId();
    if (!userId) return { success: false, error: "লগইন করুন" };

    const id = objectId.parse(productId);
    const repo = new WishlistItemRepository();
    // Scoped by userId — ownership is part of the lookup, not a later check.
    const existing = await repo.findByUserAndProduct(userId, id);
    if (existing) await repo.delete(existing.id);

    revalidatePath("/account/wishlist");
    return { success: true, data: null };
  } catch (error) {
    logger.error("removeWishlistProductAction failed", error);
    return { success: false, error: "উইশলিস্ট আপডেট করা যায়নি" };
  }
}

export async function getWishlistCountAction(): Promise<ActionResult<number>> {
  try {
    const userId = await sessionUserId();
    if (!userId) return { success: true, data: 0 };
    return { success: true, data: await new WishlistItemRepository().countByUser(userId) };
  } catch (error) {
    logger.error("getWishlistCountAction failed", error);
    return { success: true, data: 0 };
  }
}
