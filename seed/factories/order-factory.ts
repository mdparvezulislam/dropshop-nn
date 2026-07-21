import { OrderRepository } from "@/features/order/repositories/order-repository";
import { TimelineEntryModel } from "@/features/order/repositories/timeline-model";
import { generateBDAddress, generateBDPhone, getRandomElement, getRandomInt } from "../helpers/random";
import { SeedLogger } from "../helpers/logger";
import { Product } from "@/features/catalog/domain/product-entity";
import { Customer } from "@/features/customer/domain/customer-entity";
import { User } from "@/features/auth/domain/user-entity";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "courier_assigned",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
] as const;

export async function seedOrders(
  customers: Customer[],
  products: Product[],
  resellerUsers: User[],
  wholesaleUsers: User[],
): Promise<number> {
  const orderRepo = new OrderRepository();

  let createdCount = 0;

  for (let i = 1; i <= 500; i++) {
    const orderNumber = `ORD-2026-${String(i).padStart(5, "0")}`;
    const existing = await orderRepo.findByOrderNumber(orderNumber);
    if (existing) continue;

    const customer = getRandomElement(customers);
    const product1 = getRandomElement(products);
    const product2 = getRandomElement(products);
    const qty1 = getRandomInt(1, 3);
    const qty2 = getRandomInt(1, 2);

    const price1 = (product1 as any).retailPrice || 350000;
    const price2 = (product2 as any).retailPrice || 250000;
    const subtotal = price1 * qty1 + price2 * qty2;
    const shippingFee = 12000; // 120 BDT
    const grandTotal = subtotal + shippingFee;
    const totalProfit = Math.round(subtotal * 0.22);

    const isResellerOrder = i % 3 === 0;
    const isWholesaleOrder = i % 5 === 0;
    const orderType = isWholesaleOrder ? "wholesaler" : isResellerOrder ? "reseller" : "customer";
    const reseller = isResellerOrder ? getRandomElement(resellerUsers) : undefined;
    const wholesaler = isWholesaleOrder ? getRandomElement(wholesaleUsers) : undefined;

    const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
    const bdAddr = generateBDAddress();

    const cost1 = Math.round(price1 * 0.75);
    const cost2 = Math.round(price2 * 0.75);
    const unitProfit1 = price1 - cost1;
    const unitProfit2 = price2 - cost2;

    const order = await orderRepo.create({
      orderNumber,
      type: orderType,
      status,
      previousStatuses: ["draft", "pending"],
      checkoutDraftId: `draft_${i}`,
      checkoutId: `chk_${i}`,
      cartId: `cart_${i}`,
      resellerId: reseller?.id,
      wholesaleId: wholesaler?.id,
      customer: {
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      shipping: {
        receiverName: customer.name,
        phone: customer.phone,
        alternativePhone: generateBDPhone(),
        division: bdAddr.division,
        district: bdAddr.district,
        upazila: bdAddr.upazila,
        area: "Main Market Road",
        address: bdAddr.street,
        deliveryNote: "Please call before delivery.",
      },
      pricing: {
        items: [
          {
            productId: product1.id,
            variantSku: product1.sku,
            productName: product1.name,
            quantity: qty1,
            unitSellingPrice: price1,
            unitCostBasis: cost1,
            totalSellingPrice: price1 * qty1,
            totalCostBasis: cost1 * qty1,
            totalProfit: unitProfit1 * qty1,
            marginPercent: 25,
            currency: "BDT",
            pricingSource: "retail",
          },
          {
            productId: product2.id,
            variantSku: product2.sku,
            productName: product2.name,
            quantity: qty2,
            unitSellingPrice: price2,
            unitCostBasis: cost2,
            totalSellingPrice: price2 * qty2,
            totalCostBasis: cost2 * qty2,
            totalProfit: unitProfit2 * qty2,
            marginPercent: 25,
            currency: "BDT",
            pricingSource: "retail",
          },
        ],
        subtotal,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal,
        currency: "BDT",
      },
      profitPreview: {
        totalCostBasis: subtotal - totalProfit,
        totalRevenue: subtotal,
        totalProfit,
        averageMargin: 22,
      },
      shippingInfo: {
        courierId: "pathao",
        courierName: "Pathao Courier",
        trackingNumber: `PT-2026-${String(i).padStart(6, "0")}`,
        trackingUrl: `https://pathao.com/courier/tracking?consignment_id=PT-${i}`,
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2),
        shippingCost: shippingFee,
      },
      items: [
        {
          id: `item_${i}_1`,
          productId: product1.id,
          productName: product1.name,
          variantSku: product1.sku,
          quantity: qty1,
          unitPrice: price1,
          totalPrice: price1 * qty1,
          unitCost: cost1,
          totalCost: cost1 * qty1,
          unitProfit: unitProfit1,
          totalProfit: unitProfit1 * qty1,
          status: "pending",
        },
        {
          id: `item_${i}_2`,
          productId: product2.id,
          productName: product2.name,
          variantSku: product2.sku,
          quantity: qty2,
          unitPrice: price2,
          totalPrice: price2 * qty2,
          unitCost: cost2,
          totalCost: cost2 * qty2,
          unitProfit: unitProfit2,
          totalProfit: unitProfit2 * qty2,
          status: "pending",
        },
      ] as any,
      timeline: [
        {
          id: `tl_${i}_1`,
          eventType: "ORDER_CREATED",
          action: "CREATE",
          summary: "Order placed by customer",
          timestamp: new Date(Date.now() - 86400000 * 5),
          actor: { id: customer.id, role: "customer", name: customer.name },
        },
        {
          id: `tl_${i}_2`,
          eventType: "ORDER_STATUS_CHANGED",
          action: "STATUS_TRANSITION",
          summary: `Order transitioned to ${status}`,
          timestamp: new Date(),
          actor: { id: "system", role: "system", name: "Automation System" },
        },
      ],
      note: "Standard order delivery",
      source: "website",
    });

    // Also seed standalone timeline audit document
    try {
      await TimelineEntryModel.create({
        entityType: "order",
        entityId: order.id,
        eventType: "ORDER_STATUS_CHANGED",
        action: "STATUS_TRANSITION",
        summary: `Automated status update to ${status}`,
        fromStatus: "pending",
        toStatus: status,
        actor: {
          id: customer.id,
          name: customer.name,
          role: "customer",
        },
      });
    } catch {
      // ignore
    }

    createdCount++;
  }

  SeedLogger.success("Orders & Timeline audit trails seeded", createdCount);
  return createdCount;
}
