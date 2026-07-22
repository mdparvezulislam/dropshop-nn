import { RiskRepository, type RiskFlagEntity } from "../repositories/risk-repository";
import { RiskModel } from "../repositories/risk-model";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { EventBus } from "@/shared/lib/event-bus";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import type { z } from "zod";
import type {
  createRiskFlagSchema,
  resolveRiskFlagSchema,
} from "../types/validation";

type CreateRiskFlagInput = z.infer<typeof createRiskFlagSchema>;
type ResolveRiskFlagInput = z.infer<typeof resolveRiskFlagSchema>;

export interface RiskStats {
  total: number;
  open: number;
  resolved: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
}

export class RiskService {
  private readonly riskRepository: RiskRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.riskRepository = new RiskRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async flagOrder(
    input: CreateRiskFlagInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<RiskFlagEntity> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const flag = await this.riskRepository.create({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        riskLevel: input.riskLevel,
        category: input.category,
        reason: input.reason,
        confidence: input.confidence,
        detectedBy: "manual",
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Risk flag ${input.riskLevel}: ${input.category} - ${input.reason}`,
        actor,
      });

      await EventBus.publish(
        "order.system_action",
        {
          riskId: flag.id,
          orderId: input.orderId,
          orderNumber: order.orderNumber,
          riskLevel: input.riskLevel,
          category: input.category,
        },
        { source: "order" },
      );

      return flag;
    });
  }

  async resolve(
    riskId: string,
    resolution: string,
    resolvedBy: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<RiskFlagEntity> {
    const flag = await this.riskRepository.findById(riskId);
    if (!flag) throw new NotFoundError("Risk flag not found");
    if (flag.resolved) throw new ValidationError("Risk flag is already resolved");

    const updated = await this.riskRepository.resolve(riskId, resolution, resolvedBy);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: flag.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Risk ${flag.riskLevel} resolved: ${resolution}`,
      actor,
    });

    return updated;
  }

  async getOrderRisks(orderId: string): Promise<RiskFlagEntity[]> {
    return this.riskRepository.findByOrder(orderId);
  }

  async detectDuplicateOrders(order: any): Promise<void> {
    const phone = order.customer?.phone;
    if (!phone) return;

    const existing = await this.orderRepository.find({ "customer.phone": phone });
    if (existing.length > 1) {
      await this.riskRepository.create({
        orderId: order.id,
        orderNumber: order.orderNumber,
        riskLevel: "high",
        category: "duplicate_order",
        reason: `Duplicate order detected: ${existing.length} orders found with phone ${phone}`,
        confidence: 85,
        detectedBy: "system",
      } as any);
    }
  }

  async detectHighRisk(customerPhone: string): Promise<{
    isHighRisk: boolean;
    reasons: string[];
    score: number;
    riskLevel: "low" | "medium" | "high" | "critical";
  }> {
    try {
      const orders = await this.orderRepository.find({ "customer.phone": customerPhone });

      if (orders.length === 0) return { isHighRisk: false, reasons: [], score: 0, riskLevel: "low" };

      let score = 0;
      const reasons: string[] = [];

      const totalOrders = orders.length;
      const cancelledOrders = orders.filter((o: any) => o.status === "cancelled").length;
      const returnedOrders = orders.filter((o: any) => ["returned", "refunded"].includes(o.status)).length;
      const failedDeliveries = orders.filter((o: any) => o.status === "failed").length;

      const cancelRate = cancelledOrders / totalOrders;
      if (cancelRate > 0.3) {
        score += 25;
        reasons.push(`High cancellation rate (${Math.round(cancelRate * 100)}%)`);
      }

      const returnRate = returnedOrders / totalOrders;
      if (returnRate > 0.2) {
        score += 30;
        reasons.push(`High return rate (${Math.round(returnRate * 100)}%)`);
      }

      const failRate = failedDeliveries / totalOrders;
      if (failRate > 0.15) {
        score += 20;
        reasons.push(`Failed delivery rate (${Math.round(failRate * 100)}%)`);
      }

      if (cancelledOrders >= 3) {
        score += 15;
        reasons.push(`${cancelledOrders} cancelled orders`);
      }

      const codCancelledTotal = orders
        .filter((o: any) => o.status === "cancelled" && o.pricing?.grandTotal > 0)
        .reduce((sum: number, o: any) => sum + (o.pricing?.grandTotal ?? 0), 0);
      if (codCancelledTotal > 500000) {
        score += 10;
        reasons.push(`COD cancellations worth BDT ${Math.round(codCancelledTotal / 100)}`);
      }

      const riskLevel = score >= 70 ? "critical" : score >= 40 ? "high" : score >= 20 ? "medium" : "low";

      return { isHighRisk: score >= 40, reasons, score, riskLevel };
    } catch {
      return { isHighRisk: false, reasons: ["Failed to compute risk score"], score: 0, riskLevel: "low" };
    }
  }

  async getActiveRisks(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: RiskFlagEntity[]; total: number }> {
    const result = await this.riskRepository.findPaginated(
      { resolved: false },
      { page, limit },
      { createdAt: -1 } as any,
    );
    return { items: result.items, total: result.totalCount };
  }

  async getStats(): Promise<RiskStats> {
    const byLevel = await this.riskRepository.countByRiskLevel();
    const pipeline = [
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ];
    const byCatResults = await (RiskModel as any).aggregate(pipeline);
    const byCategory: Record<string, number> = {};
    for (const r of byCatResults) {
      byCategory[r._id] = r.count;
    }
    const total = Object.values(byLevel).reduce((a, b) => a + b, 0);
    const open = await this.riskRepository.count({ resolved: false });
    const resolved = await this.riskRepository.count({ resolved: true });

    return { total, open, resolved, byLevel, byCategory };
  }
}

export default RiskService;
