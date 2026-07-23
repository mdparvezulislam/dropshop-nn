import { SettingRepository } from "../repositories/setting-repository";
import type { FeatureFlagEntry, FeatureFlagState } from "../domain/setting-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";

export const DEFAULT_FEATURE_FLAGS_REGISTRY: Array<Omit<FeatureFlagEntry, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">> = [
  { key: "customer-module", name: "Customer Commerce Module", description: "Customer registration, checkout profiles, cart sync", state: "on" },
  { key: "order-management", name: "Order Engine Workflow", description: "16-state machine order lifecycle & status transitions", state: "on" },
  { key: "courier-integration", name: "Courier & Delivery Ops Hub", description: "Multi-courier dispatch, live tracking, return management", state: "on" },
  { key: "payment-gateway", name: "bKash & Nagad Payment Gateway", description: "MFS payment integration & instant verification", state: "on" },
  { key: "wallet-system", name: "Digital Wallet & Payouts", description: "User digital wallet, payouts, and transaction ledger", state: "on" },
  { key: "invoice-system", name: "Automated Invoicing System", description: "Automated PDF invoice generation & delivery", state: "on" },
  { key: "multi-warehouse", name: "Multi-Warehouse Management", description: "Warehouse location transfers & inventory safety stock", state: "beta" },
  { key: "analytics-engine", name: "Advanced Commerce Analytics", description: "Real-time analytics dashboards & BI reports", state: "on" },
  { key: "reseller-portal", name: "Reseller Commerce Portal", description: "Self-service reseller shop management & payouts", state: "on" },
  { key: "supplier-portal", name: "Supplier Workspace Portal", description: "Supplier product submissions & purchase orders", state: "on" },
  { key: "ai-product-studio", name: "AI Product Studio Helper", description: "Experimental AI copy generation for products", state: "experimental" },
];

export class FeatureFlagService {
  private readonly repository: SettingRepository;

  constructor() {
    this.repository = new SettingRepository();
  }

  async isEnabled(key: string, userRole?: string): Promise<boolean> {
    const flags = await this.listFlags();
    const flag = flags.find((f) => f.key === key);
    if (!flag) return false;

    if (flag.state === "off") return false;
    if (flag.state === "on") return true;

    if (flag.allowedRoles && flag.allowedRoles.length > 0 && userRole) {
      return flag.allowedRoles.includes(userRole);
    }

    return flag.state === "beta" || flag.state === "internal";
  }

  async updateFlagState(key: string, state: FeatureFlagState, allowedRoles?: string[], changedBy: string = "system"): Promise<FeatureFlagEntry> {
    const existing = (await this.listFlags()).find((f) => f.key === key);
    const name = existing?.name || key;
    const description = existing?.description || "";

    const updated = await this.repository.upsertFlag({
      key,
      name,
      description,
      state,
      allowedRoles: allowedRoles || existing?.allowedRoles || [],
    });

    await EventBus.publish(
      "feature_flag.updated",
      { key, state, changedBy },
      { source: "feature-flag-service" },
    );

    logger.info("FeatureFlagService: updated feature flag", { key, state, changedBy });
    return updated;
  }

  async listFlags(): Promise<FeatureFlagEntry[]> {
    const dbFlags = await this.repository.listFlags();
    if (dbFlags.length === 0) {
      for (const def of DEFAULT_FEATURE_FLAGS_REGISTRY) {
        await this.repository.upsertFlag(def as any);
      }
      return this.repository.listFlags();
    }
    return dbFlags;
  }
}

export default FeatureFlagService;
