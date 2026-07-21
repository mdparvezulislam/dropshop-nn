import { RuleRepository } from "@/features/pricing/repositories/rule-repository";
import { SeedLogger } from "../helpers/logger";

export async function seedCoupons(): Promise<void> {
  const repo = new RuleRepository();

  const coupons = [
    {
      name: "EID2026",
      description: "Eid Festival 10% Discount on all electronics orders over 2,000 BDT",
      ruleType: "campaign",
      priority: 10,
      isActive: true,
      status: "active",
      conditions: [{ field: "cartTotal", operator: "gte", value: 200000 }],
      actions: [{ type: "override", config: { discountPercentage: 10 } }],
    },
    {
      name: "WELCOMEBD",
      description: "Flat 200 BDT off for new customer registration orders",
      ruleType: "reseller",
      priority: 5,
      isActive: true,
      status: "active",
      conditions: [{ field: "isFirstOrder", operator: "eq", value: true }],
      actions: [{ type: "override", config: { discountAmount: 20000 } }],
    },
    {
      name: "WHOLESALE5",
      description: "Extra 5% discount on bulk orders exceeding 50,000 BDT",
      ruleType: "wholesale",
      priority: 15,
      isActive: true,
      status: "active",
      conditions: [{ field: "cartTotal", operator: "gte", value: 5000000 }],
      actions: [{ type: "transform", config: { discountPercentage: 5 } }],
    },
  ];

  for (const c of coupons) {
    const existing = await repo.findActiveByType(c.ruleType);
    const hasName = existing.some((r) => r.name === c.name);
    if (!hasName) {
      await repo.create({
        name: c.name,
        description: c.description,
        ruleType: c.ruleType as any,
        priority: c.priority,
        isActive: c.isActive,
        status: c.status as any,
        conditions: c.conditions as any,
        actions: c.actions as any,
      });
    }
  }

  SeedLogger.success("Coupons & Discount Rules seeded", coupons.length);
}
