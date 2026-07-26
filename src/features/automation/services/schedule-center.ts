import { scheduleJobRepository } from "../repositories/schedule-job-repository";
import { workflowEngine } from "./workflow-engine";
import { AUTOMATION_DOMAIN_EVENTS } from "../domain/automation-events";
import { EventBus } from "@/lib/event-bus";
import type { ScheduledJob } from "../domain/automation-entity";

export class ScheduleCenter {
  async create(params: {
    workflowId: string;
    name: string;
    cron: string;
    timezone?: string;
    maxRetries?: number;
    retryDelay?: number;
  }): Promise<ScheduledJob | null> {
    const existing = await scheduleJobRepository.find({
      workflowId: params.workflowId,
    });
    if (existing.length > 0) {
      throw new Error(`Schedule already exists for workflow ${params.workflowId}`);
    }

    const nextRun = this.calculateNextRun(params.cron);

    const job = await scheduleJobRepository.create({
      workflowId: params.workflowId,
      name: params.name,
      cron: params.cron,
      enabled: true,
      nextRunAt: nextRun,
      timezone: params.timezone ?? "UTC",
      maxRetries: params.maxRetries ?? 3,
      retryDelay: params.retryDelay ?? 5000,
    });

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.SCHEDULE_CREATED, {
      jobId: job.id,
      workflowId: params.workflowId,
      cron: params.cron,
    });

    return job;
  }

  async triggerDue(): Promise<void> {
    const dueJobs = await scheduleJobRepository.findDue();

    for (const job of dueJobs) {
      try {
        await workflowEngine.execute(
          job.workflowId,
          { scheduled: true, jobName: job.name },
          "schedule",
        );

        const nextRun = this.calculateNextRun(job.cron);
        await scheduleJobRepository.update(job.id, {
          lastRunAt: new Date(),
          nextRunAt: nextRun,
        });

        EventBus.publish(AUTOMATION_DOMAIN_EVENTS.SCHEDULE_TRIGGERED, {
          jobId: job.id,
          workflowId: job.workflowId,
        });
      } catch (error) {
        console.error(`Failed to trigger scheduled job ${job.id}:`, error);
      }
    }
  }

  async disable(jobId: string): Promise<ScheduledJob | null> {
    return scheduleJobRepository.update(jobId, { enabled: false });
  }

  async enable(jobId: string): Promise<ScheduledJob | null> {
    const job = await scheduleJobRepository.findById(jobId);
    if (!job) return null;

    const nextRun = this.calculateNextRun(job.cron);
    return scheduleJobRepository.update(jobId, {
      enabled: true,
      nextRunAt: nextRun,
    });
  }

  async update(
    jobId: string,
    data: Partial<Omit<ScheduledJob, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ScheduledJob | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.cron) {
      updateData.nextRunAt = this.calculateNextRun(data.cron);
    }
    return scheduleJobRepository.update(jobId, updateData);
  }

  private calculateNextRun(cron: string): Date {
    const parts = cron.split(" ");
    if (parts.length !== 5) {
      return new Date(Date.now() + 60000);
    }

    const now = new Date();
    const next = new Date(now);

    if (cron.includes("* * * * *")) {
      next.setMinutes(next.getMinutes() + 1);
      return next;
    }

    const minute = parts[0];
    const hour = parts[1];
    const dayOfMonth = parts[2];

    if (minute !== "*") {
      next.setMinutes(parseInt(minute, 10));
    }
    if (hour !== "*") {
      next.setHours(parseInt(hour, 10));
    } else {
      next.setHours(next.getHours() + 1);
    }
    if (dayOfMonth !== "*") {
      next.setDate(parseInt(dayOfMonth, 10));
    }

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  async getAll(): Promise<ScheduledJob[]> {
    return scheduleJobRepository.find({});
  }

  async getEnabled(): Promise<ScheduledJob[]> {
    return scheduleJobRepository.findEnabled();
  }

  async delete(jobId: string): Promise<boolean> {
    return scheduleJobRepository.hardDelete(jobId);
  }
}

export const scheduleCenter = new ScheduleCenter();
