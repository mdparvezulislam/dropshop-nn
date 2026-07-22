import { ActivityLogRepository } from "../repositories/activity-log-repository";
import type { ActivityLogEntry } from "../domain/activity-log-entity";

interface LogInput {
  entityType: "order" | "return" | "warranty" | "exchange" | "invoice";
  entityId: string;
  action: string;
  summary: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}

export class ActivityLogService {
  private readonly logRepository: ActivityLogRepository;

  constructor() {
    this.logRepository = new ActivityLogRepository();
  }

  async record(input: LogInput): Promise<ActivityLogEntry> {
    return this.logRepository.create(input as any);
  }

  async getByEntity(entityType: string, entityId: string): Promise<ActivityLogEntry[]> {
    return this.logRepository.findByEntity(entityType, entityId);
  }
}

export default ActivityLogService;
