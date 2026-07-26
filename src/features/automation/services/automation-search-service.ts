import { workflowRepository } from "../repositories/workflow-repository";
import { workflowExecutionRepository } from "../repositories/workflow-execution-repository";
import type {
  WorkflowDefinition,
  WorkflowExecution,
  ScheduledJob,
} from "../domain/automation-entity";
import { scheduleJobRepository } from "../repositories/schedule-job-repository";

export interface AutomationSearchResult {
  workflows: WorkflowDefinition[];
  executions: WorkflowExecution[];
  schedules: ScheduledJob[];
}

export class AutomationSearchService {
  async search(query: string, limit = 20): Promise<AutomationSearchResult> {
    const [workflows, executions, schedules] = await Promise.all([
      workflowRepository.search(query, limit),
      workflowExecutionRepository.search(query, limit),
      this.searchSchedules(query, limit),
    ]);

    return { workflows, executions, schedules };
  }

  private async searchSchedules(query: string, limit: number): Promise<ScheduledJob[]> {
    const all = await scheduleJobRepository.find({});
    const regex = new RegExp(query, "i");
    return all
      .filter((s) => regex.test(s.name) || regex.test(s.cron) || regex.test(s.workflowId))
      .slice(0, limit);
  }
}

export const automationSearchService = new AutomationSearchService();
