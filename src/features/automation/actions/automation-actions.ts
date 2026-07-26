"use server";

import { workflowEngine } from "../services/workflow-engine";
import { scheduleCenter } from "../services/schedule-center";
import { retryEngine } from "../services/retry-engine";
import { automationSearchService } from "../services/automation-search-service";
import { automationExportService } from "../services/export-service";
import { workflowRepository } from "../repositories/workflow-repository";
import { workflowExecutionRepository } from "../repositories/workflow-execution-repository";
import { executionLogRepository } from "../repositories/execution-log-repository";
import { automationCacheService } from "../services/automation-cache-service";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  executeWorkflowSchema,
  scheduleJobSchema,
  automationSearchSchema,
} from "../types/validation";
import type {
  WorkflowDefinition,
  WorkflowExecution,
  ScheduledJob,
  ExecutionLog,
  AutomationDashboardData,
} from "../domain/automation-entity";

/* ───────── Workflow CRUD ───────── */

export async function createWorkflowAction(
  input: Record<string, unknown>,
): Promise<{ success: boolean; data?: WorkflowDefinition; error?: string }> {
  try {
    const parsed = createWorkflowSchema.parse(input);
    const workflow = await workflowEngine.create(parsed);
    return { success: true, data: workflow };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create workflow";
    return { success: false, error: message };
  }
}

export async function updateWorkflowAction(
  id: string,
  input: Record<string, unknown>,
): Promise<{ success: boolean; data?: WorkflowDefinition; error?: string }> {
  try {
    const parsed = updateWorkflowSchema.parse(input);
    const workflow = await workflowEngine.update(id, parsed);
    if (!workflow) return { success: false, error: "Workflow not found" };
    return { success: true, data: workflow };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update workflow";
    return { success: false, error: message };
  }
}

export async function duplicateWorkflowAction(
  id: string,
): Promise<{ success: boolean; data?: WorkflowDefinition; error?: string }> {
  try {
    const workflow = await workflowEngine.duplicate(id);
    if (!workflow) return { success: false, error: "Workflow not found" };
    return { success: true, data: workflow };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to duplicate workflow";
    return { success: false, error: message };
  }
}

export async function enableWorkflowAction(
  id: string,
): Promise<{ success: boolean; data?: WorkflowDefinition; error?: string }> {
  try {
    const workflow = await workflowEngine.enable(id);
    if (!workflow) return { success: false, error: "Workflow not found" };
    return { success: true, data: workflow };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to enable workflow";
    return { success: false, error: message };
  }
}

export async function disableWorkflowAction(
  id: string,
): Promise<{ success: boolean; data?: WorkflowDefinition; error?: string }> {
  try {
    const workflow = await workflowEngine.disable(id);
    if (!workflow) return { success: false, error: "Workflow not found" };
    return { success: true, data: workflow };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to disable workflow";
    return { success: false, error: message };
  }
}

export async function deleteWorkflowAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = await workflowEngine.delete(id);
    if (!deleted) return { success: false, error: "Workflow not found" };
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete workflow";
    return { success: false, error: message };
  }
}

export async function getWorkflowAction(
  id: string,
): Promise<{ success: boolean; data?: WorkflowDefinition; error?: string }> {
  try {
    const workflow = await workflowRepository.findById(id);
    if (!workflow) return { success: false, error: "Workflow not found" };
    return { success: true, data: workflow };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get workflow";
    return { success: false, error: message };
  }
}

export async function getWorkflowsAction(): Promise<{
  success: boolean;
  data?: WorkflowDefinition[];
  error?: string;
}> {
  try {
    const workflows = await workflowRepository.find({});
    return { success: true, data: workflows };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get workflows";
    return { success: false, error: message };
  }
}

/* ───────── Execution ───────── */

export async function executeWorkflowAction(
  input: Record<string, unknown>,
): Promise<{ success: boolean; data?: WorkflowExecution; error?: string }> {
  try {
    const parsed = executeWorkflowSchema.parse(input);
    const execution = await workflowEngine.execute(parsed.workflowId, parsed.input, parsed.trigger);
    return { success: true, data: execution };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute workflow";
    return { success: false, error: message };
  }
}

export async function retryExecutionAction(
  executionId: string,
): Promise<{ success: boolean; data?: WorkflowExecution; error?: string }> {
  try {
    const execution = await retryEngine.retryExecution(executionId);
    if (!execution) return { success: false, error: "Execution not found or not retryable" };
    return { success: true, data: execution };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retry execution";
    return { success: false, error: message };
  }
}

export async function cancelExecutionAction(
  executionId: string,
): Promise<{ success: boolean; data?: WorkflowExecution; error?: string }> {
  try {
    const execution = await workflowEngine.cancel(executionId);
    if (!execution) return { success: false, error: "Execution not found" };
    return { success: true, data: execution };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel execution";
    return { success: false, error: message };
  }
}

export async function getExecutionAction(
  id: string,
): Promise<{ success: boolean; data?: WorkflowExecution; error?: string }> {
  try {
    const execution = await workflowExecutionRepository.findById(id);
    if (!execution) return { success: false, error: "Execution not found" };
    return { success: true, data: execution };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get execution";
    return { success: false, error: message };
  }
}

export async function getExecutionsAction(
  workflowId?: string,
): Promise<{ success: boolean; data?: WorkflowExecution[]; error?: string }> {
  try {
    const executions = workflowId
      ? await workflowExecutionRepository.findByWorkflowId(workflowId)
      : await workflowExecutionRepository.find({});
    return { success: true, data: executions };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get executions";
    return { success: false, error: message };
  }
}

/* ───────── Execution Logs ───────── */

export async function getExecutionLogsAction(
  executionId: string,
): Promise<{ success: boolean; data?: ExecutionLog[]; error?: string }> {
  try {
    const logs = await executionLogRepository.findByExecutionId(executionId);
    return { success: true, data: logs };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get execution logs";
    return { success: false, error: message };
  }
}

/* ───────── Dashboard ───────── */

export async function getAutomationDashboardAction(): Promise<{
  success: boolean;
  data?: AutomationDashboardData;
  error?: string;
}> {
  try {
    const cacheKey = "automation:dashboard";
    const cached = await automationCacheService.get<AutomationDashboardData>(cacheKey);
    if (cached) return { success: true, data: cached };

    const [
      stats,
      statusCounts,
      workflows,
      running,
      failed,
      retryCount,
      deadLetterCount,
      schedules,
    ] = await Promise.all([
      workflowExecutionRepository.getDashboardStats(),
      workflowRepository.countByStatus(),
      workflowRepository.find({}),
      workflowExecutionRepository.findRunning(),
      retryEngine.getFailedExecutions(),
      retryEngine.getRetryCount(),
      retryEngine.getDeadLetterCount(),
      scheduleCenter.getEnabled(),
    ]);

    const totalExecutions = stats.todayTotal;
    const successRate =
      totalExecutions > 0 ? Math.round((stats.todaySuccess / totalExecutions) * 100) : 0;
    const failureRate =
      totalExecutions > 0 ? Math.round((stats.todayFailure / totalExecutions) * 100) : 0;

    const data: AutomationDashboardData = {
      runningWorkflows: stats.runningCount,
      scheduledJobs: schedules.length,
      queuedJobs: 0,
      failedJobs: stats.failedCount,
      retryQueue: retryCount,
      deadLetterQueue: deadLetterCount,
      avgExecutionTime: Math.round(stats.avgDuration),
      todayExecutions: totalExecutions,
      successRate,
      failureRate,
      recentExecutions: running.slice(0, 10) as WorkflowExecution[],
      workflowStatusCounts: statusCounts as unknown as Record<string, number>,
    };

    await automationCacheService.set(cacheKey, data, 60);
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get dashboard data";
    return { success: false, error: message };
  }
}

/* ───────── Schedules ───────── */

export async function createScheduleAction(
  input: Record<string, unknown>,
): Promise<{ success: boolean; data?: ScheduledJob; error?: string }> {
  try {
    const parsed = scheduleJobSchema.parse(input);
    const job = await scheduleCenter.create(parsed);
    if (!job) return { success: false, error: "Failed to create schedule" };
    return { success: true, data: job };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create schedule";
    return { success: false, error: message };
  }
}

export async function getSchedulesAction(): Promise<{
  success: boolean;
  data?: ScheduledJob[];
  error?: string;
}> {
  try {
    const schedules = await scheduleCenter.getAll();
    return { success: true, data: schedules };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get schedules";
    return { success: false, error: message };
  }
}

export async function disableScheduleAction(
  jobId: string,
): Promise<{ success: boolean; data?: ScheduledJob; error?: string }> {
  try {
    const job = await scheduleCenter.disable(jobId);
    if (!job) return { success: false, error: "Schedule not found" };
    return { success: true, data: job };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to disable schedule";
    return { success: false, error: message };
  }
}

export async function enableScheduleAction(
  jobId: string,
): Promise<{ success: boolean; data?: ScheduledJob; error?: string }> {
  try {
    const job = await scheduleCenter.enable(jobId);
    if (!job) return { success: false, error: "Schedule not found" };
    return { success: true, data: job };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to enable schedule";
    return { success: false, error: message };
  }
}

/* ───────── Search ───────── */

export async function searchAutomationAction(input: Record<string, unknown>): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<typeof automationSearchService.search>>;
  error?: string;
}> {
  try {
    const parsed = automationSearchSchema.parse(input);
    const results = await automationSearchService.search(parsed.query, parsed.limit);
    return { success: true, data: results };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return { success: false, error: message };
  }
}

/* ───────── Export / Import ───────── */

export async function exportWorkflowAction(
  workflowId: string,
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const data = await automationExportService.exportWorkflow(workflowId);
    if (!data) return { success: false, error: "Workflow not found" };
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Export failed";
    return { success: false, error: message };
  }
}

export async function importWorkflowAction(
  data: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await automationExportService.importWorkflow(data);
    if (!result) return { success: false, error: "Import failed" };
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Import failed";
    return { success: false, error: message };
  }
}
