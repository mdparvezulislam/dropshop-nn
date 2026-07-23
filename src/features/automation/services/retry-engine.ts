import { workflowExecutionRepository } from "../repositories/workflow-execution-repository";
import { workflowEngine } from "./workflow-engine";
import type { WorkflowExecution } from "../domain/automation-entity";

export class RetryEngine {
  private maxGlobalRetries = 10;
  private deadLetterThreshold = 5;

  async automaticRetry(): Promise<number> {
    const failedExecutions = await workflowExecutionRepository.findByStatus("failed", 100);
    let retriedCount = 0;

    for (const execution of failedExecutions) {
      if (execution.retryCount >= this.maxGlobalRetries) {
        await this.moveToDeadLetter(execution);
        continue;
      }

      try {
        const result = await workflowEngine.retry(execution.id);
        if (result) retriedCount++;
      } catch {
        if (execution.retryCount >= this.deadLetterThreshold) {
          await this.moveToDeadLetter(execution);
        }
      }
    }

    return retriedCount;
  }

  async retryExecution(executionId: string): Promise<WorkflowExecution | null> {
    return workflowEngine.retry(executionId);
  }

  async retryExecutionWithDelay(executionId: string, delayMs: number): Promise<WorkflowExecution | null> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return workflowEngine.retry(executionId);
  }

  async moveToDeadLetter(execution: WorkflowExecution): Promise<void> {
    try {
      await workflowExecutionRepository.update(execution.id, {
        context: {
          ...execution.context,
          deadLetter: true,
          deadLetterAt: new Date().toISOString(),
        },
      });
    } catch {
      // best effort
    }
  }

  async getDeadLetterQueue(limit = 50): Promise<WorkflowExecution[]> {
    const all = await workflowExecutionRepository.findByStatus("failed", limit);
    return all.filter((e) => e.context?.deadLetter === true);
  }

  async getRetryQueue(limit = 50): Promise<WorkflowExecution[]> {
    return workflowExecutionRepository.findByStatus("retrying", limit);
  }

  async getFailedExecutions(limit = 50): Promise<WorkflowExecution[]> {
    return workflowExecutionRepository.findByStatus("failed", limit);
  }

  async getRetryCount(): Promise<number> {
    const counts = await workflowExecutionRepository.countByStatus();
    return counts.retrying ?? 0;
  }

  async getDeadLetterCount(): Promise<number> {
    const deadLetter = await this.getDeadLetterQueue(1000);
    return deadLetter.length;
  }
}

export const retryEngine = new RetryEngine();
