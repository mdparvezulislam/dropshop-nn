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
  advancePaidCents: number;
  dueAmountCents: number;
  profitCents: number;
  status: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  createdAt: string;
  timeline: Array<{ title: string; date: string; note?: string }>;
}

export interface ResellerStatusCounts {
  all: number;
  new: number;
  pending: number;
  approved: number;
  wfp: number;
  packaging: number;
  shipment: number;
  delivered: number;
  wfr: number;
  returned: number;
  cancel: number;
}

function parseNoteMeta(notesStr?: string): { deliveryCharge?: number; advancePaid?: number } {
  if (!notesStr) return {};
  const result: { deliveryCharge?: number; advancePaid?: number } = {};
  const dcMatch = notesStr.match(/deliveryCharge:(\d+)/i);
  if (dcMatch) result.deliveryCharge = parseInt(dcMatch[1], 10);
  const apMatch = notesStr.match(/advancePaid:(\d+)/i);
  if (apMatch) result.advancePaid = parseInt(apMatch[1], 10);
  return result;
}

export async function getResellerOrdersAction(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: {
    items: ResellerOrderDTO[];
    totalCount: number;
    statusCounts: ResellerStatusCounts;
  };
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

    const { OrderModel } = await import("@/features/order/repositories/order-model");
    const { CheckoutSessionModel } = await import("@/features/checkout/repositories/checkout-model");

    const resellerFilter = {
      $or: [{ createdBy: userId }, { resellerId: userId }, { type: "reseller" }],
    };

    const statusCounts: ResellerStatusCounts = {
      all: 0,
      new: 0,
      pending: 0,
      approved: 0,
      wfp: 0,
      packaging: 0,
      shipment: 0,
      delivered: 0,
      wfr: 0,
      returned: 0,
      cancel: 0,
    };

    const [allOrdersForCount, allCheckoutsForCount] = await Promise.all([
      OrderModel.find(resellerFilter).select("status").lean(),
      CheckoutSessionModel.find({ userId, type: "reseller" }).select("status").lean(),
    ]);

    const incrementStatusCount = (stStr?: string) => {
      const s = (stStr || "pending").toLowerCase();
      statusCounts.all++;
      if (s === "new" || s === "draft") statusCounts.new++;
      else if (s === "pending") statusCounts.pending++;
      else if (s === "approved" || s === "confirmed" || s === "processing") statusCounts.approved++;
      else if (s === "wfp" || s === "waiting_for_payment") statusCounts.wfp++;
      else if (s === "packaging" || s === "packing") statusCounts.packaging++;
      else if (s === "shipment" || s === "shipped" || s === "in_transit") statusCounts.shipment++;
      else if (s === "delivered" || s === "completed") statusCounts.delivered++;
      else if (s === "wfr" || s === "waiting_for_return") statusCounts.wfr++;
      else if (s === "returned" || s === "return_received") statusCounts.returned++;
      else if (s === "cancel" || s === "cancelled") statusCounts.cancel++;
      else statusCounts.pending++;
    };

    allOrdersForCount.forEach((d: any) => incrementStatusCount(d.status));
    if (allOrdersForCount.length === 0) {
      allCheckoutsForCount.forEach((d: any) => incrementStatusCount(d.status));
    }

    const filter: Record<string, unknown> = { ...resellerFilter };

    if (statusFilter) {
      if (statusFilter === "new") filter.status = { $in: ["new", "draft"] };
      else if (statusFilter === "pending") filter.status = "pending";
      else if (statusFilter === "approved") filter.status = { $in: ["approved", "confirmed", "processing"] };
      else if (statusFilter === "wfp") filter.status = { $in: ["wfp", "waiting_for_payment"] };
      else if (statusFilter === "packaging") filter.status = { $in: ["packaging", "packing"] };
      else if (statusFilter === "shipment") filter.status = { $in: ["shipment", "shipped", "in_transit"] };
      else if (statusFilter === "delivered") filter.status = { $in: ["delivered", "completed"] };
      else if (statusFilter === "wfr") filter.status = { $in: ["wfr", "waiting_for_return"] };
      else if (statusFilter === "returned") filter.status = { $in: ["returned", "return_received"] };
      else if (statusFilter === "cancel") filter.status = { $in: ["cancel", "cancelled"] };
      else filter.status = statusFilter;
    }

    const paginated = await orderRepo.findPaginated(
      filter,
      { page, limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    let ordersList = paginated.items || [];

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
        const noteMeta = parseNoteMeta(c.notes || c.shippingAddress?.deliveryNote);

        const isDhaka = (c.shippingAddress?.district || c.shippingAddress?.city || "Dhaka").toLowerCase().includes("dhaka");
        const deliveryFee =
          noteMeta.deliveryCharge !== undefined
            ? noteMeta.deliveryCharge
            : (c.deliveryFee || (isDhaka ? 6000 : 12000));
        const subtotal = unitSelling * qty;
        const totalSelling = subtotal + deliveryFee;

        const advancePaidCents =
          noteMeta.advancePaid !== undefined
            ? noteMeta.advancePaid
            : (c.advancePaid || c.paidAmount || 0);
        const dueAmountCents = Math.max(0, totalSelling - advancePaidCents);

        const standardCourierFee = isDhaka ? 6000 : 12000;
        const profit = (subtotal - (unitCost * qty)) + (deliveryFee - standardCourierFee);

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
          advancePaidCents,
          dueAmountCents,
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
        data: {
          items: mappedCheckouts,
          totalCount: checkouts.totalCount || mappedCheckouts.length,
          statusCounts,
        },
      };
    }

    const dtos: ResellerOrderDTO[] = ordersList.map((o: any) => {
      const itemsList = o.pricing?.items || [];
      const firstItem = itemsList[0] || {};
      const noteMeta = parseNoteMeta(o.shipping?.deliveryNote || o.notes);

      const grandTotalCents = o.pricing?.grandTotal ?? 0;
      const subtotalCents = o.pricing?.subtotal ?? (firstItem.totalSellingPrice || 0);
      const deliveryCents =
        noteMeta.deliveryCharge !== undefined
          ? noteMeta.deliveryCharge
          : grandTotalCents > subtotalCents
            ? grandTotalCents - subtotalCents
            : (o.shipping?.deliveryFee || 6000);

      const advancePaidCents =
        o.pricing?.advancePaid !== undefined && o.pricing?.advancePaid > 0
          ? o.pricing.advancePaid
          : (noteMeta.advancePaid || o.advancePaidCents || 0);

      const totalSellingCents = grandTotalCents || (subtotalCents + deliveryCents);
      const dueAmountCents = Math.max(0, totalSellingCents - advancePaidCents);

      const isDhaka = (o.shipping?.district || o.shipping?.division || "Dhaka").toLowerCase().includes("dhaka");
      const standardCourierCostCents = isDhaka ? 6000 : 12000;
      const costBasisCents = o.profitPreview?.totalCostBasis || 0;
      const profitCents =
        o.profitPreview?.totalProfit !== undefined
          ? o.profitPreview.totalProfit
          : (subtotalCents - costBasisCents) + (deliveryCents - standardCourierCostCents);

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
        sellingPriceCents: totalSellingCents,
        costBasisCents: o.profitPreview?.totalCostBasis || 0,
        deliveryChargeCents: deliveryCents,
        advancePaidCents,
        dueAmountCents,
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
        statusCounts,
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
      const noteMeta = parseNoteMeta(o.shipping?.deliveryNote || o.notes);

      const grandTotalCents = o.pricing?.grandTotal ?? 0;
      const subtotalCents = o.pricing?.subtotal ?? (firstItem.totalSellingPrice || 0);
      const deliveryCents =
        noteMeta.deliveryCharge !== undefined
          ? noteMeta.deliveryCharge
          : grandTotalCents > subtotalCents
            ? grandTotalCents - subtotalCents
            : (o.shipping?.deliveryFee || 6000);

      const advancePaidCents =
        o.pricing?.advancePaid !== undefined && o.pricing?.advancePaid > 0
          ? o.pricing.advancePaid
          : (noteMeta.advancePaid || o.advancePaidCents || 0);

      const totalSellingCents = grandTotalCents || (subtotalCents + deliveryCents);
      const dueAmountCents = Math.max(0, totalSellingCents - advancePaidCents);

      const isDhaka = (o.shipping?.district || o.shipping?.division || "Dhaka").toLowerCase().includes("dhaka");
      const standardCourierCostCents = isDhaka ? 6000 : 12000;
      const costBasisCents = o.profitPreview?.totalCostBasis || 0;
      const profitCents =
        o.profitPreview?.totalProfit !== undefined
          ? o.profitPreview.totalProfit
          : (subtotalCents - costBasisCents) + (deliveryCents - standardCourierCostCents);

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
        sellingPriceCents: totalSellingCents,
        costBasisCents: o.profitPreview?.totalCostBasis || 0,
        deliveryChargeCents: deliveryCents,
        advancePaidCents,
        dueAmountCents,
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
      const noteMeta = parseNoteMeta(rawC.notes || rawC.shippingAddress?.deliveryNote);

      const isDhaka = (rawC.shippingAddress?.district || rawC.shippingAddress?.city || "Dhaka").toLowerCase().includes("dhaka");
      const deliveryFee =
        noteMeta.deliveryCharge !== undefined
          ? noteMeta.deliveryCharge
          : (rawC.deliveryFee || (isDhaka ? 6000 : 12000));
      const subtotal = unitSelling * qty;
      const totalSelling = subtotal + deliveryFee;
      const profit = (subtotal - (unitCost * qty)) + (deliveryFee - (isDhaka ? 6000 : 12000));

      const advancePaidCents =
        noteMeta.advancePaid !== undefined
          ? noteMeta.advancePaid
          : (rawC.advancePaid || rawC.paidAmount || 0);
      const dueAmountCents = Math.max(0, totalSelling - advancePaidCents);

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
        advancePaidCents,
        dueAmountCents,
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

export interface UpdateResellerOrderInput {
  orderId: string;
  customerName: string;
  customerPhone: string;
  district: string;
  upazila?: string;
  fullAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    variantSku?: string;
    quantity: number;
    unitSellingPrice: number;
    unitCostBasis: number;
  }>;
  deliveryChargeCents: number;
  advancePaidCents?: number;
  notes?: string;
}

export async function updateResellerOrderAction(
  input: UpdateResellerOrderInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "লগইন করা আবশ্যক।" };
    }

    const orderRepo = new OrderRepository();
    let order = await orderRepo.findById(input.orderId);
    if (!order) {
      order = await orderRepo.findByOrderNumber(input.orderId);
    }
    if (!order) {
      order = await orderRepo.findByCheckoutDraft(input.orderId);
    }

    if (order) {
      const currentStatus = (order as any).status || "pending";
      const trackingNo = (order as any).courier?.trackingNumber || (order as any).trackingNumber;
      const blockedStatuses = ["pickup_requested", "shipment", "shipped", "in_transit", "delivered", "completed", "cancelled"];

      if (blockedStatuses.includes(currentStatus) || trackingNo) {
        return {
          success: false,
          error: "কুরিয়ার পিকআপ রিকুয়েস্টের পর বা পণ্য ডেলিভারিতে যাওয়ার পর অর্ডার এডিট করা সম্ভব নয়।",
        };
      }

      const itemsList = input.items.map((i) => {
        const totalSellingPrice = i.unitSellingPrice * i.quantity;
        const totalCostBasis = i.unitCostBasis * i.quantity;
        const totalProfit = totalSellingPrice - totalCostBasis;
        return {
          productId: i.productId,
          productName: i.productName,
          variantSku: i.variantSku,
          quantity: i.quantity,
          unitSellingPrice: i.unitSellingPrice,
          unitCostBasis: i.unitCostBasis,
          totalSellingPrice,
          totalCostBasis,
          totalProfit,
        };
      });

      const subtotal = itemsList.reduce((sum, item) => sum + item.totalSellingPrice, 0);
      const totalCostBasis = itemsList.reduce((sum, item) => sum + item.totalCostBasis, 0);
      const grandTotal = subtotal + input.deliveryChargeCents;
      const advancePaid = Math.max(0, input.advancePaidCents || 0);
      const dueAmount = Math.max(0, grandTotal - advancePaid);

      const isDhaka = (input.district || "Dhaka").toLowerCase().includes("dhaka");
      const standardCourierCostCents = isDhaka ? 6000 : 12000;
      const totalProfit = (subtotal - totalCostBasis) + (input.deliveryChargeCents - standardCourierCostCents);

      const { OrderModel } = await import("@/features/order/repositories/order-model");
      await OrderModel.findByIdAndUpdate(order.id, {
        $set: {
          "customer.name": input.customerName,
          "customer.phone": input.customerPhone,
          "shipping.receiverName": input.customerName,
          "shipping.phone": input.customerPhone,
          "shipping.district": input.district,
          "shipping.upazila": input.upazila || "",
          "shipping.address": input.fullAddress,
          "shipping.deliveryNote": input.notes || "",
          notes: input.notes || "",
          pricing: {
            items: itemsList,
            subtotal,
            grandTotal,
            advancePaid,
            dueAmount,
            discountTotal: 0,
            taxTotal: 0,
            currency: "BDT",
          },
          profitPreview: {
            totalCostBasis,
            totalRevenue: subtotal,
            totalProfit,
            averageMargin: subtotal > 0 ? totalProfit / subtotal : 0,
          },
        },
        $push: {
          timeline: {
            title: "Order Updated by Reseller",
            date: new Date(),
            note: "Customer details and product pricing updated by reseller",
          },
        },
      });

      return { success: true };
    }

    const checkoutRepo = new CheckoutSessionRepository();
    const c = await checkoutRepo.findById(input.orderId);
    if (c) {
      if (!["pending", "draft"].includes((c as any).status || "pending")) {
        return {
          success: false,
          error: "এডমিন এপ্রুভ বা কুরিয়ার রিকুয়েস্টের পর অর্ডার এডিট করা সম্ভব নয়।",
        };
      }

      const itemsList = input.items.map((i) => ({
        productId: i.productId,
        name: i.productName,
        variantSku: i.variantSku,
        quantity: i.quantity,
        resolvedPrice: i.unitSellingPrice,
        profitPreview: {
          costBasis: i.unitCostBasis,
        },
      }));

      await checkoutRepo.update(input.orderId, {
        customer: {
          name: input.customerName,
          phone: input.customerPhone,
          district: input.district,
          upazila: input.upazila,
          address: input.fullAddress,
        },
        shippingAddress: {
          receiverName: input.customerName,
          phone: input.customerPhone,
          district: input.district,
          city: input.district,
          upazila: input.upazila,
          address: input.fullAddress,
          deliveryNote: `payment:cod;deliveryCharge:${input.deliveryChargeCents};advancePaid:${input.advancePaidCents || 0}`,
        },
        items: itemsList,
        deliveryFee: input.deliveryChargeCents,
        advancePaid: input.advancePaidCents || 0,
        notes: `payment:cod;deliveryCharge:${input.deliveryChargeCents};advancePaid:${input.advancePaidCents || 0};userNote:${input.notes || ""}`,
      } as any);

      return { success: true };
    }

    return { success: false, error: "অর্ডারটি পাওয়া যায়নি।" };
  } catch (error: unknown) {
    logger.error("updateResellerOrderAction failed", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "অর্ডার আপডেট করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function deleteResellerOrderAction(orderId: string): Promise<{
  success: boolean;
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
      const currentStatus = (order as any).status || "pending";
      if (!["pending", "draft"].includes(currentStatus)) {
        return {
          success: false,
          error: "এডমিন এপ্রুভ বা কুরিয়ার রিকুয়েস্টের পর অর্ডার মুছে ফেলা সম্ভব নয়।",
        };
      }
      const { OrderModel } = await import("@/features/order/repositories/order-model");
      await OrderModel.findByIdAndDelete(order.id);
      return { success: true };
    }

    const checkoutRepo = new CheckoutSessionRepository();
    const c = await checkoutRepo.findById(orderId);
    if (c) {
      if (!["pending", "draft"].includes((c as any).status || "pending")) {
        return {
          success: false,
          error: "এডমিন এপ্রুভ বা কুরিয়ার রিকুয়েস্টের পর অর্ডার মুছে ফেলা সম্ভব নয়।",
        };
      }
      await checkoutRepo.delete(orderId);
      return { success: true };
    }

    return { success: false, error: "অর্ডারটি পাওয়া যায়নি।" };
  } catch (error: unknown) {
    logger.error("deleteResellerOrderAction failed", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "অর্ডার ডিলিট করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function searchProductsForOrderEditAction(query: string): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    title: string;
    thumbnail?: string;
    costBasisTaka: number;
    sellingPriceTaka: number;
  }>;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "লগইন করা আবশ্যক।" };
    }

    const { ProductModel } = await import("@/features/catalog/repositories/product-model");
    const { ProductPricingModel } = await import("@/features/pricing/repositories/pricing-model");

    let filter: any = { isDeleted: { $ne: true } };
    const qStr = (query || "").trim();
    if (qStr) {
      filter.$or = [
        { name: { $regex: qStr, $options: "i" } },
        { slug: { $regex: qStr, $options: "i" } },
        { sku: { $regex: qStr, $options: "i" } },
      ];
    }

    const products = await ProductModel.find(filter)
      .select("_id name slug sku media")
      .limit(20)
      .lean();

    const result = await Promise.all(
      products.map(async (p: any) => {
        const pricing = await ProductPricingModel.findOne({
          productId: p._id,
          isDeleted: { $ne: true },
        }).lean();

        const thumbnail = p.media?.[0]?.url || "";

        let costTaka = 1000;
        let sellTaka = 1500;

        if (pricing) {
          sellTaka = Math.round(
            (pricing.sellingPrice || pricing.resellerPrice || 150000) / 100,
          );
          costTaka = Math.round(
            (pricing.wholesalePrice || pricing.baseCostPrice || pricing.supplierPrice || Math.round(sellTaka * 0.7 * 100)) / 100,
          );
        }

        return {
          id: String(p._id),
          title: p.name || "Product Item",
          thumbnail,
          costBasisTaka: costTaka > 0 ? costTaka : 1000,
          sellingPriceTaka: sellTaka > 0 ? sellTaka : 1500,
        };
      }),
    );

    return { success: true, data: result };
  } catch (error: any) {
    logger.error("searchProductsForOrderEditAction failed", error);
    return { success: false, error: error.message };
  }
}


