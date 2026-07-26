import { workflowRepository } from "../repositories/workflow-repository";
import { workflowVersionRepository } from "../repositories/workflow-version-repository";
import { workflowExecutionRepository } from "../repositories/workflow-execution-repository";
import { executionLogRepository } from "../repositories/execution-log-repository";
import { getTask } from "./task-library";
import { evaluateRules, type ConditionContext } from "./rules-engine";
import type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowRule,
  WorkflowAction,
  ExecutionStatus,
  ExecutionError,
  ExecutionStep,
  TriggerType,
  WorkflowVersion,
} from "../domain/automation-entity";
import { AUTOMATION_DOMAIN_EVENTS } from "../domain/automation-events";
import { EventBus } from "@/lib/event-bus";
import type { CreateWorkflowInput, UpdateWorkflowInput } from "../types/validation";

export class WorkflowEngine {
  async create(input: CreateWorkflowInput, userId?: string): Promise<WorkflowDefinition> {
    const doc = await workflowRepository.create({
      name: input.name,
      key: input.key,
      description: input.description,
      category: input.category,
      status: "draft" as const,
      version: 1,
      trigger: input.trigger,
      rules: input.rules ?? [],
      steps: input.steps ?? [],
      tags: input.tags ?? [],
      settings: {
        maxRetries: 3,
        retryDelay: 5000,
        timeout: 300000,
        concurrency: 5,
        preserveOrder: true,
        notifyOnFailure: true,
        notifyOnSuccess: false,
        notificationRecipients: [],
        ...input.settings,
      },
      totalRuns: 0,
      totalFailures: 0,
      averageDuration: 0,
    });

    await workflowVersionRepository.create({
      workflowId: doc.id,
      version: 1,
      definition: { ...doc } as unknown as Record<string, unknown>,
      publishedBy: userId,
      changelog: "Initial version",
    });

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_CREATED, {
      workflowId: doc.id,
      key: doc.key,
      name: doc.name,
    });

    return doc;
  }

  async update(
    id: string,
    input: UpdateWorkflowInput,
    userId?: string,
  ): Promise<WorkflowDefinition | null> {
    const existing = await workflowRepository.findById(id);
    if (!existing) return null;

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.trigger !== undefined) updateData.trigger = input.trigger;
    if (input.rules !== undefined) updateData.rules = input.rules;
    if (input.steps !== undefined) updateData.steps = input.steps;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.settings !== undefined) updateData.settings = input.settings;

    const patched = await workflowRepository.update(id, updateData);

    if (input.status === "active" && existing.status !== "active") {
      await workflowVersionRepository.create({
        workflowId: id,
        version: existing.version + 1,
        definition: { ...patched } as unknown as Record<string, unknown>,
        publishedBy: userId,
        changelog: "Updated and activated",
      });
    }

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_UPDATED, {
      workflowId: id,
      key: patched.key,
      status: patched.status,
    });

    return patched;
  }

  async duplicate(id: string): Promise<WorkflowDefinition | null> {
    const original = await workflowRepository.findById(id);
    if (!original) return null;

    return workflowRepository.create({
      ...original,
      name: `${original.name} (Copy)`,
      key: `${original.key}_copy`,
      status: "draft" as const,
      version: 1,
      totalRuns: 0,
      totalFailures: 0,
      averageDuration: 0,
      lastRunAt: undefined,
      lastRunStatus: undefined,
    });
  }

  async execute(
    workflowId: string,
    input: Record<string, unknown>,
    trigger: TriggerType,
    initiatedBy?: string,
    correlationId?: string,
  ): Promise<WorkflowExecution> {
    const workflow = await workflowRepository.findById(workflowId);
    if (!workflow || workflow.status !== "active") {
      throw new Error(`Workflow ${workflowId} not found or not active`);
    }

    const execution = await workflowExecutionRepository.create({
      workflowId,
      workflowKey: workflow.key,
      workflowName: workflow.name,
      workflowVersion: workflow.version,
      trigger,
      status: "running",
      input,
      output: {},
      context: {},
      steps: [],
      retryCount: 0,
      maxRetries: workflow.settings.maxRetries,
      startedAt: new Date(),
      initiatedBy,
      correlationId,
    });

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_EXECUTION_STARTED, {
      executionId: execution.id,
      workflowId,
      workflowKey: workflow.key,
    });

    try {
      return await this.processWorkflow(workflow, execution, input);
    } catch (error) {
      const err = error as Error;
      await this.handleFailure(
        execution,
        { code: "EXECUTION_ERROR", message: err.message, timestamp: new Date() },
        workflow,
      );
      EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_EXECUTION_FAILED, {
        executionId: execution.id,
        workflowId,
        error: err.message,
      });
      throw error;
    }
  }

  private async processWorkflow(
    workflow: WorkflowDefinition,
    execution: WorkflowExecution,
    input: Record<string, unknown>,
  ): Promise<WorkflowExecution> {
    const ctx: ConditionContext = {
      event: input,
      payload: input,
      context: execution.context,
      system: { workflowId: workflow.id, workflowKey: workflow.key, version: workflow.version },
    };

    const executionSteps: ExecutionStep[] = [];

    if (workflow.rules.length > 0) {
      for (const rule of workflow.rules.sort((a, b) => a.priority - b.priority)) {
        const result = evaluateRules([rule], ctx);
        if (result.matched && result.matchedActions.length > 0) {
          for (const action of result.matchedActions.sort((a, b) => a.order - b.order)) {
            const stepResult = await this.executeAction(action, ctx, execution);
            executionSteps.push(stepResult);
            if (action.type === "stop_workflow") break;
          }
        }
        if (workflow.steps.length === 0) break;
      }
    }

    if (workflow.steps.length > 0) {
      for (const step of workflow.steps) {
        const stepResult = await this.executeStep(step, ctx, execution);
        executionSteps.push(stepResult);
      }
    }

    const now = new Date();
    const duration = execution.startedAt ? now.getTime() - execution.startedAt.getTime() : 0;

    try {
      await workflowExecutionRepository.update(execution.id, {
        status: "completed",
        steps: executionSteps,
        output: execution.output,
        completedAt: now,
        duration,
      });
    } catch {
      // execution already saved
    }

    const avgDuration =
      workflow.totalRuns > 0
        ? (workflow.averageDuration * workflow.totalRuns + duration) / (workflow.totalRuns + 1)
        : duration;

    await workflowRepository.update(workflow.id, {
      lastRunAt: now,
      lastRunStatus: "completed",
      totalRuns: workflow.totalRuns + 1,
      averageDuration: avgDuration,
    });

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_EXECUTION_COMPLETED, {
      executionId: execution.id,
      workflowId: workflow.id,
      duration,
    });

    return {
      ...execution,
      status: "completed",
      steps: executionSteps,
      completedAt: now,
      duration,
    };
  }

  private async executeAction(
    action: WorkflowAction,
    ctx: ConditionContext,
    execution: WorkflowExecution,
  ): Promise<ExecutionStep> {
    const step: ExecutionStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      stepId: action.id,
      name: action.label,
      type: action.type,
      status: "running",
      startedAt: new Date(),
      retryCount: 0,
      input: action.config,
    };

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_STEP_STARTED, {
      executionId: execution.id,
      stepId: step.id,
      action: action.type,
    });

    try {
      const task = getTask(action.type);
      if (!task) {
        throw new Error(`No task registered for action type: ${action.type}`);
      }

      const result = await task.handler(action.config, {
        ...ctx,
        order: execution.input,
      });

      step.status = "completed";
      step.completedAt = new Date();
      step.duration = step.startedAt ? step.completedAt.getTime() - step.startedAt.getTime() : 0;
      step.output = result;

      execution.output = { ...execution.output, [action.id]: result };
    } catch (error) {
      const err = error as Error;
      step.status = "failed";
      step.error = {
        code: "ACTION_ERROR",
        message: err.message,
        timestamp: new Date(),
      };
      step.completedAt = new Date();
      step.duration = step.startedAt ? step.completedAt.getTime() - step.startedAt.getTime() : 0;

      EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_STEP_FAILED, {
        executionId: execution.id,
        stepId: step.id,
        error: err.message,
      });
    }

    try {
      await executionLogRepository.create({
        executionId: execution.id,
        workflowId: execution.workflowId,
        level: step.status === "completed" ? "info" : "error",
        message: `Action ${action.label}: ${step.status}`,
        step: step.id,
        data: { action: action.type, result: step.output, error: step.error },
        timestamp: new Date(),
      });
    } catch {
      // log failures are non-fatal
    }

    return step;
  }

  private async executeStep(
    step: WorkflowStep,
    ctx: ConditionContext,
    execution: WorkflowExecution,
  ): Promise<ExecutionStep> {
    const execStep: ExecutionStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      stepId: step.id,
      name: step.name,
      type: step.type,
      status: "running",
      startedAt: new Date(),
      retryCount: 0,
    };

    if (step.type === "delay" || step.type === "action") {
      const task = getTask(step.config.type as string);
      if (task) {
        try {
          const result = await task.handler(step.config, {
            ...ctx,
            order: execution.input,
          });
          execStep.status = "completed";
          execStep.output = result;
        } catch (error) {
          execStep.status = "failed";
          execStep.error = {
            code: "STEP_ERROR",
            message: (error as Error).message,
            timestamp: new Date(),
          };
        }
      }
    }

    execStep.completedAt = new Date();
    execStep.duration = execStep.startedAt
      ? execStep.completedAt.getTime() - execStep.startedAt.getTime()
      : 0;

    return execStep;
  }

  async retry(executionId: string): Promise<WorkflowExecution | null> {
    const execution = await workflowExecutionRepository.findById(executionId);
    if (!execution || execution.status !== "failed") return null;

    const workflow = await workflowRepository.findById(execution.workflowId);
    if (!workflow) return null;

    try {
      await workflowExecutionRepository.update(executionId, {
        status: "retrying",
        retryCount: execution.retryCount + 1,
      });
    } catch {
      return null;
    }

    try {
      return await this.processWorkflow(
        workflow,
        {
          ...execution,
          status: "retrying",
          retryCount: execution.retryCount + 1,
        },
        execution.input,
      );
    } catch (error) {
      await this.handleFailure(
        { ...execution, retryCount: execution.retryCount + 1 },
        { code: "RETRY_FAILED", message: (error as Error).message, timestamp: new Date() },
        workflow,
      );
      return null;
    }
  }

  async cancel(executionId: string): Promise<WorkflowExecution | null> {
    try {
      const updated = await workflowExecutionRepository.update(executionId, {
        status: "cancelled",
        completedAt: new Date(),
      });
      EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_EXECUTION_CANCELLED, {
        executionId,
        workflowId: updated.workflowId,
      });
      return updated;
    } catch {
      return null;
    }
  }

  private async handleFailure(
    execution: WorkflowExecution,
    error: ExecutionError,
    workflow: WorkflowDefinition,
  ): Promise<void> {
    const newRetryCount = execution.retryCount + 1;
    const shouldRetry = newRetryCount <= execution.maxRetries;

    try {
      await workflowExecutionRepository.update(execution.id, {
        status: shouldRetry ? "retrying" : "failed",
        error,
        retryCount: newRetryCount,
        completedAt: new Date(),
      });
    } catch {
      // best effort
    }

    try {
      await executionLogRepository.create({
        executionId: execution.id,
        workflowId: execution.workflowId,
        level: "error",
        message: `Execution failed: ${error.message}`,
        data: { error, retryCount: newRetryCount, willRetry: shouldRetry },
        timestamp: new Date(),
      });
    } catch {
      // best effort
    }

    try {
      await workflowRepository.update(workflow.id, {
        lastRunStatus: "failed",
        totalFailures: workflow.totalFailures + 1,
      });
    } catch {
      // best effort
    }

    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_EXECUTION_FAILED, {
      executionId: execution.id,
      workflowId: workflow.id,
      error: error.message,
      retryCount: newRetryCount,
      willRetry: shouldRetry,
    });
  }

  async enable(id: string): Promise<WorkflowDefinition | null> {
    const updated = await workflowRepository.update(id, { status: "active" });
    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_ENABLED, { workflowId: id });
    return updated;
  }

  async disable(id: string): Promise<WorkflowDefinition | null> {
    const updated = await workflowRepository.update(id, { status: "paused" });
    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_DISABLED, { workflowId: id });
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await workflowRepository.delete(id);
    EventBus.publish(AUTOMATION_DOMAIN_EVENTS.WORKFLOW_DELETED, { workflowId: id });
    return result;
  }
}

export const workflowEngine = new WorkflowEngine();
