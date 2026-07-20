import { EventRegistry } from "@/shared/lib/event-bus";
import { FeatureFlags, type FeatureFlagDefinition } from "@/shared/core/feature-flags";
import { Settings, type SettingDefinition } from "@/shared/core/feature-flags";

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
    { eventType: "order.inventory_reserved", description: "Inventory was released or committed for order" },
    { eventType: "order.timeline_entry_added", description: "A timeline entry was added to an order" },
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
}
