import { CodRepository } from "../repositories/cod-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import type { CodReconciliation, CodSettlementStatus } from "../domain/cod-entity";
import { EventBus } from "@/shared/lib/event-bus";
import { NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import type { CreateCodReconciliationInput, ReconcileCodInput, SettleCodInput } from "../types/validation";

export class CodService {
  private readonly codRepository: CodRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.codRepository = new CodRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async createOrUpdate(input: CreateCodReconciliationInput, actor?: { id: string; name?: string; role?: string }): Promise<CodReconciliation> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const existing = (await this.codRepository.findByOrder(input.orderId))[0];
      const receivedAmount = input.receivedAmount ?? 0;
      const difference = receivedAmount - input.expectedAmount;

      let record: CodReconciliation;

      if (existing) {
        record = await this.codRepository.update(existing.id, {
          courierName: input.courierName,
          trackingNumber: input.trackingNumber,
          expectedAmount: input.expectedAmount,
          receivedAmount,
          difference,
        } as any);

        await this.timelineService.addEntry({
          entityType: "order",
          entityId: input.orderId,
          eventType: "order.system_action",
          action: "order.system_action",
          summary: `COD record updated: expected ${input.expectedAmount}, received ${receivedAmount}`,
          actor,
          changes: [{ field: "codDifference", oldValue: existing.difference, newValue: difference }],
        });
      } else {
        record = await this.codRepository.create({
          orderId: input.orderId,
          orderNumber: input.orderNumber,
          courierName: input.courierName,
          trackingNumber: input.trackingNumber,
          expectedAmount: input.expectedAmount,
          receivedAmount,
          difference,
          settlementStatus: "pending",
        } as any);

        await this.timelineService.addEntry({
          entityType: "order",
          entityId: input.orderId,
          eventType: "order.system_action",
          action: "order.system_action",
          summary: `COD reconciliation created for ${input.orderNumber}: expected ${input.expectedAmount}`,
          actor,
        });
      }

      await EventBus.publish("order.cod_reconciliation_updated", {
        codId: record.id,
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        expectedAmount: input.expectedAmount,
        receivedAmount,
        difference,
      }, { source: "order" });

      return record;
    });
  }

  async reconcile(codId: string, input: ReconcileCodInput, actor?: { id: string; name?: string; role?: string }): Promise<CodReconciliation> {
    return runInTransaction(async () => {
      const record = await this.codRepository.findById(codId);
      if (!record) throw new NotFoundError("COD reconciliation not found");

      const difference = input.receivedAmount - record.expectedAmount;
      const settlementStatus: CodSettlementStatus = difference === 0 ? "settled" : "partial";
      const now = new Date();

      const updated = await this.codRepository.update(codId, {
        receivedAmount: input.receivedAmount,
        difference,
        settlementStatus,
        reconciledAt: now,
        reconciledBy: input.reconciledBy,
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: record.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `COD reconciled: expected ${record.expectedAmount}, received ${input.receivedAmount} (difference ${difference})`,
        actor,
        changes: [
          { field: "receivedAmount", oldValue: record.receivedAmount, newValue: input.receivedAmount },
          { field: "settlementStatus", oldValue: record.settlementStatus, newValue: settlementStatus },
        ],
      });

      await EventBus.publish("order.cod_reconciled", {
        codId,
        orderId: record.orderId,
        orderNumber: record.orderNumber,
        expectedAmount: record.expectedAmount,
        receivedAmount: input.receivedAmount,
        difference,
        settlementStatus,
      }, { source: "order" });

      return updated;
    });
  }

  async settle(codId: string, input: SettleCodInput, actor?: { id: string; name?: string; role?: string }): Promise<CodReconciliation> {
    return runInTransaction(async () => {
      const record = await this.codRepository.findById(codId);
      if (!record) throw new NotFoundError("COD reconciliation not found");

      const settlementDate = input.settlementDate ? new Date(input.settlementDate) : new Date();

      const updated = await this.codRepository.update(codId, {
        settlementStatus: "settled",
        settlementDate,
        notes: input.notes,
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: record.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `COD settled on ${settlementDate.toISOString().split("T")[0]}${input.notes ? `: ${input.notes}` : ""}`,
        actor,
        changes: [{ field: "settlementStatus", oldValue: record.settlementStatus, newValue: "settled" }],
      });

      await EventBus.publish("order.cod_settled", {
        codId,
        orderId: record.orderId,
        orderNumber: record.orderNumber,
        settlementDate,
      }, { source: "order" });

      return updated;
    });
  }

  async findByOrder(orderId: string): Promise<CodReconciliation[]> {
    return this.codRepository.findByOrder(orderId);
  }

  async listAll(page: number = 1, limit: number = 20): Promise<{ items: CodReconciliation[]; total: number }> {
    const result = await this.codRepository.findPaginated({}, { page, limit }, { createdAt: -1 } as any);
    return { items: result.items, total: result.totalCount };
  }

  async getStats(): Promise<{ byStatus: Record<string, number>; totalMismatched: number; totalPending: number }> {
    const byStatus = await this.codRepository.countByStatus();
    const mismatched = await this.codRepository.findMismatched();
    const pending = await this.codRepository.findPending();
    return { byStatus, totalMismatched: mismatched.length, totalPending: pending.length };
  }
}

export default CodService;
