"use server";

import { auth } from "@/lib/auth";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { CheckoutSessionRepository } from "@/features/checkout/repositories/checkout-repository";
import { logger } from "@/lib/utils/logger";

export interface ResellerOrderDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  district: string;
  upazila?: string;
  fullAddress: string;
  productName: string;
  quantity: number;
  items: Array<{
    productId: string;
    productName: string;
    variantSku?: string;
    quantity: number;
    unitSellingPrice: number;
    unitCostBasis: number;
    totalSellingPrice: number;
    totalProfit: number;
  }>;
  imageUrl?: string;
  sellingPriceCents: number;
  costBasisCents: number;
  deliveryChargeCents: number;
  profitCents: number;
  status: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  createdAt: string;
  timeline: Array<{ title: string; date: string; note?: string }>;
}

export async function getResellerOrdersAction(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: { items: ResellerOrderDTO[]; totalCount: number };
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "লগইন করা আবশ্যক।" };
    }

    const orderRepo = new OrderRepository();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const statusFilter = params.status && params.status !== "all" ? params.status : undefined;

    // Query real Orders created by this reseller
    const filter: Record<string, unknown> = {
      $or: [{ createdBy: userId }, { resellerId: userId }, { type: "reseller" }],
    };

    if (statusFilter) {
      filter.status = statusFilter;
    }

    const paginated = await orderRepo.findPaginated(
      filter,
      { page, limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    let ordersList = paginated.items || [];

    // Fallback: If no Order documents found, query CheckoutSession for drafts
    if (ordersList.length === 0) {
      const checkoutRepo = new CheckoutSessionRepository();
      const checkouts = await checkoutRepo.findPaginated(
        { userId, type: "reseller" },
        { page, limit },
        { sortBy: "createdAt", sortOrder: "desc" },
      );

      const mappedCheckouts: ResellerOrderDTO[] = (checkouts.items || []).map((c: any) => {
        const item = c.items?.[0] || {};
        const unitSelling = item.unitPriceOverride || item.resolvedPrice || 0;
        const unitCost = item.profitPreview?.costBasis || Math.round(unitSelling * 0.7);
        const qty = item.quantity || 1;
        const deliveryFee =
          c.deliveryFee || (c.shippingAddress?.city?.toLowerCase().includes("dhaka") ? 8000 : 15000);
        const totalSelling = unitSelling * qty + deliveryFee;
        const profit = (unitSelling - unitCost) * qty;

        return {
          id: c.id || c._id,
          orderNumber:
            c.checkoutNumber || c.orderNumber || (c.id ? `ORD-${c.id.slice(-6)}` : "ORD-000"),
          customerName:
            c.customer?.name ||
            c.shippingAddress?.receiverName ||
            c.shippingAddress?.name ||
            "কাস্টমার",
          customerPhone: c.customer?.phone || c.shippingAddress?.phone || "",
          customerEmail: c.customer?.email || c.shippingAddress?.email || "",
          district:
            c.customer?.district ||
            c.shippingAddress?.district ||
            c.shippingAddress?.city ||
            "Dhaka",
          upazila: c.customer?.upazila || c.shippingAddress?.upazila || "",
          fullAddress:
            c.customer?.address ||
            c.customer?.fullAddress ||
            c.shippingAddress?.address ||
            "",
          productName: item.name || item.productName || "Reseller Product",
          quantity: qty,
          items: [
            {
              productId: item.productId || "prod-1",
              productName: item.name || item.productName || "Reseller Product",
              variantSku: item.variantSku,
              quantity: qty,
              unitSellingPrice: unitSelling,
              unitCostBasis: unitCost,
              totalSellingPrice: unitSelling * qty,
              totalProfit: profit,
            },
          ],
          sellingPriceCents: totalSelling,
          costBasisCents: unitCost * qty,
          deliveryChargeCents: deliveryFee,
          profitCents: profit,
          status: c.status === "completed" ? "confirmed" : c.status || "pending",
          courierName: c.courier?.name,
          trackingNumber: c.courierTrackingId,
          notes: c.notes,
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
          timeline: [
            {
              title: "Order Created",
              date: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
            },
          ],
        };
      });

      return {
        success: true,
        data: { items: mappedCheckouts, totalCount: checkouts.totalCount || mappedCheckouts.length },
      };
    }

    const dtos: ResellerOrderDTO[] = ordersList.map((o: any) => {
      const itemsList = o.pricing?.items || [];
      const firstItem = itemsList[0] || {};
      const grandTotalCents = o.pricing?.grandTotal ?? 0;
      const subtotalCents = o.pricing?.subtotal ?? (firstItem.totalSellingPrice || 0);
      const deliveryCents =
        grandTotalCents > subtotalCents ? grandTotalCents - subtotalCents : 8000;
      const profitCents =
        o.profitPreview?.totalProfit ?? (subtotalCents - (o.profitPreview?.totalCostBasis || 0));

      return {
        id: o.id || o._id,
        orderNumber: o.orderNumber || (o.id ? `ORD-${o.id.slice(-6)}` : "ORD-000"),
        customerName: o.shipping?.receiverName || o.customer?.name || "কাস্টমার",
        customerPhone: o.shipping?.phone || o.customer?.phone || "",
        customerEmail: o.shipping?.email || o.customer?.email || "",
        district: o.shipping?.district || o.shipping?.division || "Dhaka",
        upazila: o.shipping?.upazila || "",
        fullAddress: o.shipping?.address || "",
        productName: firstItem.productName || "Reseller Product",
        quantity: itemsList.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0),
        items: itemsList.map((i: any) => ({
          productId: i.productId,
          productName: i.productName || "Product Item",
          variantSku: i.variantSku,
          quantity: i.quantity,
          unitSellingPrice: i.unitSellingPrice || 0,
          unitCostBasis: i.unitCostBasis || 0,
          totalSellingPrice: i.totalSellingPrice || 0,
          totalProfit: i.totalProfit || 0,
        })),
        imageUrl: firstItem.imageUrl,
        sellingPriceCents: grandTotalCents || subtotalCents,
        costBasisCents: o.profitPreview?.totalCostBasis || 0,
        deliveryChargeCents: deliveryCents,
        profitCents,
        status: o.status || "pending",
        courierName: o.courier?.name,
        trackingNumber: o.courier?.trackingNumber,
        trackingUrl: o.courier?.trackingUrl,
        notes: o.shipping?.deliveryNote || o.notes,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        timeline: (o.timeline || []).map((t: any) => ({
          title: t.title || t.action || t.status || "Status Event",
          date: t.date || t.timestamp || t.createdAt
            ? new Date(t.date || t.timestamp || t.createdAt).toISOString()
            : new Date().toISOString(),
          note: t.note,
        })),
      };
    });

    return {
      success: true,
      data: {
        items: JSON.parse(JSON.stringify(dtos)),
        totalCount: paginated.totalCount || dtos.length,
      },
    };
  } catch (error: unknown) {
    logger.error("getResellerOrdersAction failed", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "অর্ডার তালিকা লোড করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function getResellerOrderDetailAction(orderId: string): Promise<{
  success: boolean;
  data?: ResellerOrderDTO;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "লগইন করা আবশ্যক।" };
    }

    const orderRepo = new OrderRepository();
    let order = await orderRepo.findById(orderId);

    if (!order) {
      order = await orderRepo.findByOrderNumber(orderId);
    }
    if (!order) {
      order = await orderRepo.findByCheckoutDraft(orderId);
    }

    if (order) {
      const o = order as any;
      const itemsList = o.pricing?.items || [];
      const firstItem = itemsList[0] || {};
      const grandTotalCents = o.pricing?.grandTotal ?? 0;
      const subtotalCents = o.pricing?.subtotal ?? (firstItem.totalSellingPrice || 0);
      const deliveryCents =
        grandTotalCents > subtotalCents ? grandTotalCents - subtotalCents : 8000;
      const profitCents =
        o.profitPreview?.totalProfit ?? (subtotalCents - (o.profitPreview?.totalCostBasis || 0));

      const dto: ResellerOrderDTO = {
        id: o.id || o._id,
        orderNumber: o.orderNumber || (o.id ? `ORD-${o.id.slice(-6)}` : "ORD-000"),
        customerName: o.shipping?.receiverName || o.customer?.name || "কাস্টমার",
        customerPhone: o.shipping?.phone || o.customer?.phone || "",
        customerEmail: o.shipping?.email || o.customer?.email || "",
        district: o.shipping?.district || o.shipping?.division || "Dhaka",
        upazila: o.shipping?.upazila || "",
        fullAddress: o.shipping?.address || "",
        productName: firstItem.productName || "Reseller Product",
        quantity: itemsList.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0),
        items: itemsList.map((i: any) => ({
          productId: i.productId,
          productName: i.productName || "Product Item",
          variantSku: i.variantSku,
          quantity: i.quantity,
          unitSellingPrice: i.unitSellingPrice || 0,
          unitCostBasis: i.unitCostBasis || 0,
          totalSellingPrice: i.totalSellingPrice || 0,
          totalProfit: i.totalProfit || 0,
        })),
        imageUrl: firstItem.imageUrl,
        sellingPriceCents: grandTotalCents || subtotalCents,
        costBasisCents: o.profitPreview?.totalCostBasis || 0,
        deliveryChargeCents: deliveryCents,
        profitCents,
        status: o.status || "pending",
        courierName: o.courier?.name,
        trackingNumber: o.courier?.trackingNumber,
        trackingUrl: o.courier?.trackingUrl,
        notes: o.shipping?.deliveryNote || o.notes,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        timeline: (o.timeline || []).map((t: any) => ({
          title: t.title || t.action || t.status || "Status Event",
          date: t.date || t.timestamp || t.createdAt
            ? new Date(t.date || t.timestamp || t.createdAt).toISOString()
            : new Date().toISOString(),
          note: t.note,
        })),
      };

      return { success: true, data: JSON.parse(JSON.stringify(dto)) };
    }

    // Fallback search in CheckoutSession
    const checkoutRepo = new CheckoutSessionRepository();
    const c = await checkoutRepo.findById(orderId);
    if (c) {
      const rawC = c as any;
      const item = rawC.items?.[0] || {};
      const unitSelling = item.unitPriceOverride || item.resolvedPrice || 0;
      const unitCost = item.profitPreview?.costBasis || Math.round(unitSelling * 0.7);
      const qty = item.quantity || 1;
      const deliveryFee =
        rawC.deliveryFee || (rawC.shippingAddress?.city?.toLowerCase().includes("dhaka") ? 8000 : 15000);
      const totalSelling = unitSelling * qty + deliveryFee;
      const profit = (unitSelling - unitCost) * qty;

      const dto: ResellerOrderDTO = {
        id: rawC.id || rawC._id,
        orderNumber:
          rawC.checkoutNumber || rawC.orderNumber || (rawC.id ? `ORD-${rawC.id.slice(-6)}` : "ORD-000"),
        customerName:
          rawC.customer?.name ||
          rawC.shippingAddress?.receiverName ||
          rawC.shippingAddress?.name ||
          "কাস্টমার",
        customerPhone: rawC.customer?.phone || rawC.shippingAddress?.phone || "",
        customerEmail: rawC.customer?.email || rawC.shippingAddress?.email || "",
        district:
          rawC.customer?.district ||
          rawC.shippingAddress?.district ||
          rawC.shippingAddress?.city ||
          "Dhaka",
        upazila: rawC.customer?.upazila || rawC.shippingAddress?.upazila || "",
        fullAddress:
          rawC.customer?.address ||
          rawC.customer?.fullAddress ||
          rawC.shippingAddress?.address ||
          "",
        productName: item.name || item.productName || "Reseller Product",
        quantity: qty,
        items: [
          {
            productId: item.productId || "prod-1",
            productName: item.name || item.productName || "Reseller Product",
            variantSku: item.variantSku,
            quantity: qty,
            unitSellingPrice: unitSelling,
            unitCostBasis: unitCost,
            totalSellingPrice: unitSelling * qty,
            totalProfit: profit,
          },
        ],
        sellingPriceCents: totalSelling,
        costBasisCents: unitCost * qty,
        deliveryChargeCents: deliveryFee,
        profitCents: profit,
        status: rawC.status === "completed" ? "confirmed" : rawC.status || "pending",
        courierName: rawC.courier?.name,
        trackingNumber: rawC.courierTrackingId,
        notes: rawC.notes,
        createdAt: rawC.createdAt ? new Date(rawC.createdAt).toISOString() : new Date().toISOString(),
        timeline: [
          {
            title: "Order Created",
            date: rawC.createdAt ? new Date(rawC.createdAt).toISOString() : new Date().toISOString(),
          },
        ],
      };

      return { success: true, data: JSON.parse(JSON.stringify(dto)) };
    }

    return { success: false, error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" };
  } catch (error: unknown) {
    logger.error("getResellerOrderDetailAction failed", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "অর্ডারের বিস্তারিত বিবরণ লোড করা যায়নি",
    };
  }
}
