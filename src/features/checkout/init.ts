import { EventRegistry } from "@/shared/lib/event-bus";
import { FeatureFlags, type FeatureFlagDefinition } from "@/shared/core/feature-flags";
import { Settings, type SettingDefinition } from "@/shared/core/feature-flags";

export function registerCheckoutFeatureFlags(): void {
  const flags: FeatureFlagDefinition[] = [
    {
      key: "checkout.management.enabled",
      name: "Checkout Management",
      description: "Enable the checkout management module",
      defaultState: "on",
    },
    {
      key: "checkout.guest_checkout",
      name: "Guest Checkout",
      description: "Allow guest users to create carts and checkout",
      defaultState: "on",
    },
    {
      key: "checkout.reseller_checkout",
      name: "Reseller Checkout",
      description: "Enable reseller-specific checkout flow",
      defaultState: "on",
    },
    {
      key: "checkout.wholesale_checkout",
      name: "Wholesale Checkout",
      description: "Enable wholesale-specific checkout with MOQ enforcement",
      defaultState: "on",
    },
    {
      key: "checkout.abandoned_cart_recovery",
      name: "Abandoned Cart Recovery",
      description: "Enable abandoned cart detection and recovery workflows",
      defaultState: "off",
    },
  ];

  flags.forEach((f) => FeatureFlags.register(f));

  const settings: SettingDefinition[] = [
    {
      key: "checkout.session_ttl_minutes",
      name: "Checkout Session TTL (Minutes)",
      description: "Time-to-live for active checkout sessions before expiry",
      scope: "global",
      defaultValue: 30,
    },
    {
      key: "checkout.abandoned_cart_hours",
      name: "Abandoned Cart Detection (Hours)",
      description: "Hours of inactivity before a cart is marked as abandoned",
      scope: "global",
      defaultValue: 24,
    },
    {
      key: "checkout.max_cart_items",
      name: "Max Cart Items",
      description: "Maximum number of items allowed in a single cart",
      scope: "global",
      defaultValue: 50,
    },
    {
      key: "checkout.max_quantity_per_item",
      name: "Max Quantity Per Item",
      description: "Maximum quantity of a single item in a cart",
      scope: "global",
      defaultValue: 100,
    },
  ];

  settings.forEach((s) => Settings.register(s));

  // Register checkout events
  const checkoutEvents = [
    { eventType: "checkout.cart_created", description: "A new cart was created" },
    { eventType: "checkout.cart_updated", description: "Cart contents were modified" },
    { eventType: "checkout.started", description: "A checkout session was initiated" },
    {
      eventType: "checkout.validated",
      description: "Checkout prices and inventory were validated",
    },
    {
      eventType: "checkout.inventory_reserved",
      description: "Inventory was reserved for the checkout",
    },
    {
      eventType: "checkout.order_draft_created",
      description: "An order draft was created from the checkout",
    },
    { eventType: "checkout.expired", description: "The checkout session expired" },
  ];

  for (const ev of checkoutEvents) {
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
          deadLetterQueue: "checkout-dlq",
        },
        idempotencyWindow: 60,
        maxProcessingTime: 30000,
      });
    } catch {
      // Already registered
    }
  }
}
