import { EventRegistry } from "@/lib/event-bus";
import { FeatureFlags, type FeatureFlagDefinition } from "@/lib/core/feature-flags";
import { Settings, type SettingDefinition } from "@/lib/core/feature-flags";
import { DEFAULT_CURRENCY } from "@/constants";

export function registerOrderFeatureFlags(): void {
  const flags: FeatureFlagDefinition[] = [
    {
      key: "order.management.enabled",
      name: "Order Management",
      description: "Enable the order management module",
      defaultState: "on",
    },
    {
      key: "order.auto_confirm",
      name: "Auto Confirm Orders",
      description: "Automatically confirm orders created from checkout drafts",
      defaultState: "off",
    },
    {
      key: "order.bulk_operations",
      name: "Bulk Order Operations",
      description: "Enable bulk status transitions and batch processing",
      defaultState: "off",
    },
    {
      key: "order.returns_enabled",
      name: "Order Returns",
      description: "Enable return request and processing workflow",
      defaultState: "on",
    },
    {
      key: "order.supplier_routing",
      name: "Supplier Routing",
      description: "Enable auto-routing order items to suppliers",
      defaultState: "off",
    },
  ];

  flags.forEach((f) => FeatureFlags.register(f));

  const settings: SettingDefinition[] = [
    {
      key: "order.number_prefix",
      name: "Order Number Prefix",
      description: "Prefix for auto-generated order numbers (e.g. ORD-)",
      scope: "global",
      defaultValue: "ORD-",
    },
    {
      key: "order.default_ttl_days",
      name: "Default Order TTL (Days)",
      description: "Days before a draft order expires",
      scope: "global",
      defaultValue: 7,
    },
    {
      key: "order.max_items_per_order",
      name: "Max Items Per Order",
      description: "Maximum number of line items in a single order",
      scope: "global",
      defaultValue: 100,
    },
    {
      key: "order.auto_complete_days",
      name: "Auto Complete After Delivery (Days)",
      description: "Days after delivery before order is auto-completed",
      scope: "global",
      defaultValue: 7,
    },
  ];

  settings.forEach((s) => Settings.register(s));

  const orderEvents = [
    { eventType: "order.created", description: "A new order was created from a checkout draft" },
    { eventType: "order.confirmed", description: "Order was confirmed by admin or auto-confirmed" },
    { eventType: "order.packed", description: "Order items were packed and ready for dispatch" },
    { eventType: "order.ready_for_dispatch", description: "Order is ready for courier pickup" },
    { eventType: "order.courier_assigned", description: "A courier was assigned to the order" },
    { eventType: "order.shipped", description: "Order was shipped with tracking information" },
    { eventType: "order.out_for_delivery", description: "Order is out for last-mile delivery" },
    { eventType: "order.delivered", description: "Order was successfully delivered" },
    { eventType: "order.completed", description: "Order processing completed (post-delivery)" },
    { eventType: "order.cancelled", description: "Order was cancelled" },
    { eventType: "order.return_requested", description: "Customer requested a return" },
    { eventType: "order.return_initiated", description: "Return was initiated by admin" },
    { eventType: "order.returned", description: "Items were returned" },
    { eventType: "order.refunded", description: "Refund was processed" },
    { eventType: "order.failed", description: "Order processing failed at some step" },
    {
      eventType: "order.inventory_reserved",
      description: "Inventory was released or committed for order",
    },
    {
      eventType: "order.timeline_entry_added",
      description: "A timeline entry was added to an order",
    },
  ];

  for (const ev of orderEvents) {
    try {
      EventRegistry.register(ev.eventType, {
        eventType: ev.eventType,
        description: ev.description,
        version: 1,
        handlerType: "async",
        subscribers: [],
        retryConfig: {
          maxRetries: 3,
          initialBackoffMs: 1000,
          backoffMultiplier: 2,
          maxBackoffMs: 30000,
          retryableErrors: ["EventError"],
          deadLetterQueue: "order-dlq",
        },
        idempotencyWindow: 60,
        maxProcessingTime: 30000,
      });
    } catch {
      // Already registered
    }
  }

  try {
    EventRegistry.registerSyncSubscriber("checkout.order_draft_created", {
      eventType: "checkout.order_draft_created",
      priority: 10,
      handle: async (event) => {
        const { draftId, checkoutId, cartId, type } = event.data;
        const { OrderService } = await import("./services/order-service");
        const { CheckoutSessionRepository, OrderDraftRepository } =
          await import("@/features/checkout/repositories/checkout-repository");

        const checkoutRepo = new CheckoutSessionRepository();
        const draftRepo = new OrderDraftRepository();

        const checkout = await checkoutRepo.findById(checkoutId as string);
        const draft = await draftRepo.findById(draftId as string);

        if (!checkout || !draft) {
          return;
        }

        const orderService = new OrderService();
        const itemsMapped = await Promise.all(
          draft.resolvedPrices.map(async (priceItem) => {
            let productName = "Product Item";
            const unitCostBasis = Math.floor(priceItem.unitPrice * 0.7); // default 70% cost basis

            try {
              const { ProductRepository } =
                await import("@/features/catalog/repositories/product-repository");
              const productRepo = new ProductRepository();
              const p = await productRepo.findById(priceItem.productId);
              if (p) {
                productName = p.name;
              }
            } catch {
              // fallback
            }

            const totalSellingPrice = priceItem.totalPrice;
            const totalCostBasis = unitCostBasis * priceItem.quantity;
            const totalProfit = totalSellingPrice - totalCostBasis;
            const marginPercent =
              totalSellingPrice > 0 ? (totalProfit / totalSellingPrice) * 100 : 0;

            return {
              productId: priceItem.productId,
              variantSku: priceItem.variantSku || "SKU-DEFAULT",
              productName,
              quantity: priceItem.quantity,
              unitSellingPrice: priceItem.unitPrice,
              unitWholesalePrice:
                priceItem.pricingSource === "wholesale" ? priceItem.unitPrice : undefined,
              unitCostBasis,
              totalSellingPrice,
              totalCostBasis,
              totalProfit,
              marginPercent,
              currency: priceItem.currency,
              pricingSource: priceItem.pricingSource,
              campaignId: priceItem.campaignId || undefined,
              appliedRules: priceItem.appliedRules || [],
            };
          }),
        );

        const subtotal = itemsMapped.reduce((acc, curr) => acc + curr.totalSellingPrice, 0);
        const totalCostBasis = itemsMapped.reduce((acc, curr) => acc + curr.totalCostBasis, 0);
        const totalProfit = subtotal - totalCostBasis;

        await orderService.createFromDraft({
          draftId: draftId as string,
          checkoutId: checkoutId as string,
          cartId: cartId as string,
          orderNumber:
            "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString(),
          type: type as any,
          customer: {
            customerId: checkout.createdBy || undefined,
            name: checkout.shipping?.receiverName || "Guest Customer",
            phone: checkout.shipping?.phone || "+8801700000000",
            email: undefined,
          },
          shipping: checkout.shipping as any,
          pricing: {
            items: itemsMapped,
            subtotal,
            discountTotal: checkout.totals?.discountTotal ?? 0,
            taxTotal: checkout.totals?.taxTotal ?? 0,
            grandTotal: checkout.totals?.grandTotal ?? subtotal,
            currency: checkout.totals?.currency ?? DEFAULT_CURRENCY,
          },
          profitPreview: {
            totalCostBasis,
            totalRevenue: subtotal,
            totalProfit,
            averageMargin: subtotal > 0 ? (totalProfit / subtotal) * 100 : 0,
          },
          autoConfirmed: false,
        });
      },
    });
  } catch (err) {
    // Already registered
  }
}
