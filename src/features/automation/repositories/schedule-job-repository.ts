import { BaseRepository } from "@/shared/lib/database/generic-repository";
import type { ScheduledJob } from "../domain/automation-entity";
import { ScheduleJobModel, type ScheduleJobDocument } from "./schedule-job-model";

function toScheduleDomain(doc: ScheduleJobDocument): ScheduledJob {
  return {
    id: doc._id.toString(),
    workflowId: doc.workflowId,
    name: doc.name,
    cron: doc.cron,
    enabled: doc.enabled,
    lastRunAt: doc.lastRunAt,
    nextRunAt: doc.nextRunAt,
    timezone: doc.timezone ?? "UTC",
    maxRetries: doc.maxRetries ?? 3,
    retryDelay: doc.retryDelay ?? 5000,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class ScheduleJobRepository extends BaseRepository<ScheduleJobDocument, ScheduledJob> {
  constructor() {
    super(ScheduleJobModel, toScheduleDomain);
  }

  async findEnabled(): Promise<ScheduledJob[]> {
    return this.find({ enabled: true });
  }

  async findDue(): Promise<ScheduledJob[]> {
    const now = new Date();
    const all = await this.find({ enabled: true });
    return all.filter((j) => j.nextRunAt && j.nextRunAt <= now);
  }
}

export const scheduleJobRepository = new ScheduleJobRepository();
