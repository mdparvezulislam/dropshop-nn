import { scheduleCenter } from "../services/schedule-center";

export async function processScheduledJobs(): Promise<void> {
  await scheduleCenter.triggerDue();
}

export async function processScheduledJob(job: {
  workflowId: string;
  name: string;
  cron: string;
}): Promise<void> {
  const { scheduleCenter: sc } = await import("../services/schedule-center");
  await sc.triggerDue();
}
