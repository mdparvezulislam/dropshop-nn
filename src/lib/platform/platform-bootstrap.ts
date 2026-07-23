import { EngineRegistry, type EngineLifecycle } from "./engine-registry";
import type { PlatformEngine, PlatformEngineId, BootstrapContext, EngineStatus } from "./platform-types";
import { FeatureFlags, Settings, DEFAULT_FEATURE_FLAGS, DEFAULT_SETTINGS } from "@/lib/core/feature-flags";
import { logger } from "@/lib/utils/logger";

const BOOTSTRAP_PHASES: { name: string; order: number; engines: PlatformEngineId[] }[] = [
  { name: "core", order: 0, engines: ["CORE"] },
  { name: "identity", order: 1, engines: ["IDENTITY"] },
  { name: "catalog", order: 2, engines: ["CATALOG", "COST"] },
  { name: "pricing", order: 3, engines: ["PRICING"] },
  { name: "inventory", order: 4, engines: ["INVENTORY"] },
  { name: "supplier", order: 5, engines: ["SUPPLIER"] },
  { name: "checkout", order: 6, engines: ["CHECKOUT"] },
  { name: "order", order: 7, engines: ["ORDER"] },
  { name: "customer", order: 8, engines: ["CUSTOMER"] },
  { name: "finance", order: 9, engines: ["FINANCE"] },
  { name: "courier", order: 10, engines: ["COURIER"] },
  { name: "cms", order: 11, engines: ["CMS"] },
  { name: "analytics", order: 12, engines: ["ANALYTICS"] },
  { name: "notification", order: 13, engines: ["NOTIFICATION"] },
];

let bootstrapContext: BootstrapContext | null = null;

export class PlatformBootstrap {
  private constructor() {}

  static async initialize(): Promise<BootstrapContext> {
    if (bootstrapContext?.completedAt) {
      logger.warn("PlatformBootstrap: already initialized, skipping");
      return bootstrapContext;
    }

    const context: BootstrapContext = {
      startedAt: new Date(),
      engines: new Map<PlatformEngineId, EngineStatus>(),
      errors: [],
    };
    bootstrapContext = context;

    await PlatformBootstrap.registerDefaultEngines();

    for (const phase of BOOTSTRAP_PHASES) {
      await PlatformBootstrap.executePhase(phase.name, phase.engines, context);
    }

    context.completedAt = new Date();
    const duration = context.completedAt.getTime() - context.startedAt.getTime();
    logger.info(`PlatformBootstrap: initialization completed in ${duration}ms`, {
      engines: context.engines.size,
      errors: context.errors.length,
    });

    if (context.errors.length > 0) {
      for (const err of context.errors) {
        logger.error(`PlatformBootstrap: engine "${err.engineId}" failed at ${err.phase}`, err.message);
      }
    }

    return context;
  }

  private static async registerDefaultEngines(): Promise<void> {
    const coreEngines: { engine: PlatformEngine; lifecycle?: EngineLifecycle }[] = [
      {
        engine: { id: "CORE", name: "Core Engine", description: "Platform kernel: feature flags, settings, event bus", version: "1.0.0", enabled: true },
        lifecycle: { preInit: async () => { PlatformBootstrap.registerCore(); } },
      },
      {
        engine: { id: "IDENTITY", name: "Identity Engine", description: "Business workspace, profiles, approvals, sessions", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerIdentityModule } = await import("@/features/identity/init"); registerIdentityModule(); } },
      },
      {
        engine: { id: "CATALOG", name: "Catalog Engine", description: "Enterprise product catalog with variants, media, SEO", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerCatalogModule } = await import("@/features/catalog/init"); registerCatalogModule(); } },
      },
      {
        engine: { id: "COST", name: "Cost Engine", description: "Versioned product cost intelligence & history with landed cost breakdowns", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerCostModule } = await import("@/features/cost/init"); registerCostModule(); } },
      },
      {
        engine: { id: "PRICING", name: "Pricing Engine", description: "Pricing rules, profit calculation, tier pricing", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerPricingModule } = await import("@/features/pricing/init"); registerPricingModule(); } },
      },
      {
        engine: { id: "INVENTORY", name: "Inventory Engine", description: "Stock management, reservations, supplier stock", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerInventoryModule } = await import("@/features/inventory/init"); registerInventoryModule(); } },
      },
      {
        engine: { id: "SUPPLIER", name: "Supplier Engine", description: "Supplier profiles, performance tracking, product mapping", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerSupplierFeatureFlags } = await import("@/features/supplier/init"); registerSupplierFeatureFlags(); } },
      },
      {
        engine: { id: "CHECKOUT", name: "Checkout Engine", description: "Cart, checkout sessions, order draft creation", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerCheckoutFeatureFlags } = await import("@/features/checkout/init"); registerCheckoutFeatureFlags(); } },
      },
      {
        engine: { id: "ORDER", name: "Order Engine", description: "Order lifecycle, state machine, timeline, returns", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerOrderFeatureFlags } = await import("@/features/order/init"); registerOrderFeatureFlags(); } },
      },
      {
        engine: { id: "CUSTOMER", name: "Customer Engine", description: "Customer profiles, addresses, notes, timeline, statistics", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerCustomerFeatureFlags } = await import("@/features/customer/init"); registerCustomerFeatureFlags(); } },
      },
      {
        engine: { id: "FINANCE", name: "Finance Engine", description: "Wallet, ledger, invoicing, payouts, withdrawals", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerFinanceFeatureFlags } = await import("@/features/finance/init"); registerFinanceFeatureFlags(); } },
      },
      {
        engine: { id: "COURIER", name: "Courier Engine", description: "Multicourier dispatch, tracking, pickup scheduling", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerCourierFeatureFlags } = await import("@/features/courier/init"); registerCourierFeatureFlags(); } },
      },
      {
        engine: { id: "CMS", name: "CMS Engine", description: "Headless content, media library, navigation, SEO", version: "1.0.0", enabled: true },
        lifecycle: { init: async () => { const { registerCmsModule } = await import("@/features/cms/init"); registerCmsModule(); } },
      },
      {
        engine: {
          id: "ANALYTICS",
          name: "Analytics Engine",
          description: "Event intelligence, metrics layer, and dashboards",
          version: "1.0.0",
          enabled: true,
        },
        lifecycle: {
          init: async () => {
            const { registerAnalyticsModule } = await import("@/features/analytics/init");
            registerAnalyticsModule();
          },
        },
      },
      {
        engine: {
          id: "NOTIFICATION",
          name: "Notification Engine",
          description: "Multi-channel communications, templates, and delivery pipeline",
          version: "1.0.0",
          enabled: true,
        },
        lifecycle: {
          init: async () => {
            const { registerNotificationModule } = await import(
              "@/features/notification/init"
            );
            registerNotificationModule();
          },
        },
      },
    ];

    for (const entry of coreEngines) {
      const status: EngineStatus = {
        engineId: entry.engine.id,
        preInit: "pending",
        init: "pending",
        postInit: "pending",
      };
      bootstrapContext!.engines.set(entry.engine.id, status);
      EngineRegistry.register(entry.engine, entry.lifecycle);
    }
  }

  private static async executePhase(
    phaseName: string,
    engineIds: PlatformEngineId[],
    context: BootstrapContext,
  ): Promise<void> {
    logger.info(`PlatformBootstrap: executing phase "${phaseName}"`);

    for (const id of engineIds) {
      const engine = EngineRegistry.get(id);
      if (!engine || !engine.enabled) continue;

      logger.info(`PlatformBootstrap: initializing "${id}"`);

      /* preInit */
      await EngineRegistry.runLifecycle(id, "preInit", context);

      /* init (register flags + settings + events) */
      await EngineRegistry.runLifecycle(id, "init", context);

      /* postInit (register subscribers + jobs) */
      await EngineRegistry.runLifecycle(id, "postInit", context);
    }
  }

  private static registerCore(): void {

    for (const flag of DEFAULT_FEATURE_FLAGS) {
      try {
        FeatureFlags.register(flag);
      } catch {
        // already registered
      }
    }

    for (const setting of DEFAULT_SETTINGS) {
      try {
        Settings.register(setting);
      } catch {
        // already registered
      }
    }

    logger.info(`Core: registered ${DEFAULT_FEATURE_FLAGS.length} default feature flags, ${DEFAULT_SETTINGS.length} default settings`);
  }

  static getContext(): BootstrapContext | null {
    return bootstrapContext;
  }

  static async verifyEngines(): Promise<{ registered: string[]; enabled: string[]; failed: string[] }> {
    const all = EngineRegistry.getAll();
    const enabled = EngineRegistry.getEnabled();
    const ctx = bootstrapContext;

    const failed: string[] = [];
    if (ctx) {
      for (const [id, status] of ctx.engines) {
        if (status.init === "failed") {
          failed.push(id);
        }
      }
    }

    return {
      registered: all.map((e) => e.id),
      enabled: enabled.map((e) => e.id),
      failed,
    };
  }
}
