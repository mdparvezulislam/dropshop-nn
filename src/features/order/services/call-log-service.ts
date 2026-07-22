import { CallLogRepository } from "../repositories/call-log-repository";
import { ComplaintModel } from "../repositories/complaint-model";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import type { CallLogEntry } from "../domain/call-log-entity";
import { NotFoundError } from "@/shared/errors/app-error";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import type { z } from "zod";
import type { createCallLogSchema } from "../types/validation";

type CreateCallLogInput = z.infer<typeof createCallLogSchema>;

export interface CallLogStats {
  byOutcome: Record<string, number>;
  todayCount: number;
  total: number;
}

export class CallLogService {
  private readonly callLogRepository: CallLogRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.callLogRepository = new CallLogRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(input: CreateCallLogInput): Promise<CallLogEntry> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const callLog = await this.callLogRepository.create({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        staffId: input.staffId,
        staffName: input.staffName,
        duration: input.duration,
        outcome: input.outcome,
        notes: input.notes,
        callTime: new Date(),
        nextFollowUpAt: input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : undefined,
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Call logged: ${input.outcome} by ${input.staffName} (${input.duration}s)`,
      });

      return callLog;
    });
  }

  async getByOrder(orderId: string): Promise<CallLogEntry[]> {
    return this.callLogRepository.findByOrder(orderId);
  }

  async listAll(
    page: number = 1,
    limit: number = 20,
    staffId?: string,
    outcome?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ items: CallLogEntry[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (staffId) filter.staffId = staffId;
    if (outcome) filter.outcome = outcome;
    if (dateFrom || dateTo) {
      filter.callTime = {};
      if (dateFrom) (filter.callTime as any).$gte = new Date(dateFrom);
      if (dateTo) (filter.callTime as any).$lte = new Date(dateTo);
    }

    const result = await this.callLogRepository.findPaginated(
      filter,
      { page, limit },
      { callTime: -1 } as any,
    );
    return { items: result.items, total: result.totalCount };
  }

  async getStats(): Promise<CallLogStats> {
    const byOutcome = await this.callLogRepository.countByOutcome();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayCount = await this.callLogRepository.count({
      callTime: { $gte: todayStart, $lte: todayEnd },
    });

    const total = Object.values(byOutcome).reduce((a, b) => a + b, 0);

    return { byOutcome, todayCount, total };
  }
}

export default CallLogService;
