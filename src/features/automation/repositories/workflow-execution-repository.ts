import { BaseRepository } from "@/shared/lib/database/generic-repository";
import type { WorkflowExecution } from "../domain/automation-entity";
import { WorkflowExecutionModel, type WorkflowExecutionDocument } from "./workflow-execution-model";

function toExecDomain(doc: WorkflowExecutionDocument): WorkflowExecution {
  return {
    id: doc._id.toString(),
    workflowId: doc.workflowId,
    workflowKey: doc.workflowKey,
    workflowName: doc.workflowName,
    workflowVersion: doc.workflowVersion,
    trigger: doc.trigger as WorkflowExecution["trigger"],
    status: doc.status as WorkflowExecution["status"],
    input: (doc.input ?? {}) as Record<string, unknown>,
    output: (doc.output ?? {}) as Record<string, unknown>,
    context: (doc.context ?? {}) as Record<string, unknown>,
    currentStep: doc.currentStep,
    steps: doc.steps as unknown as WorkflowExecution["steps"],
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    duration: doc.duration,
    error: doc.error as WorkflowExecution["error"],
    retryCount: doc.retryCount ?? 0,
    maxRetries: doc.maxRetries ?? 3,
    initiatedBy: doc.initiatedBy,
    correlationId: doc.correlationId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class WorkflowExecutionRepository extends BaseRepository<WorkflowExecutionDocument, WorkflowExecution> {
  constructor() {
    super(WorkflowExecutionModel, toExecDomain);
  }

  async findByWorkflowId(workflowId: string, limit = 20): Promise<WorkflowExecution[]> {
    const docs = await this.find({ workflowId });
    return docs.slice(0, limit);
  }

  async findByStatus(status: string, limit = 50): Promise<WorkflowExecution[]> {
    const docs = await this.find({ status });
    return docs.slice(0, limit);
  }

  async findToday(limit = 100): Promise<WorkflowExecution[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const docs = await this.find({ createdAt: { $gte: today } });
    return docs.slice(0, limit);
  }

  async findRunning(): Promise<WorkflowExecution[]> {
    return this.find({ status: "running" });
  }

  async countByStatus(): Promise<Record<string, number>> {
    const docModels = this.model;
    const counts = await docModels.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = {
      pending: 0, running: 0, completed: 0, failed: 0,
      cancelled: 0, retrying: 0, paused: 0, timeout: 0,
    };
    for (const c of counts) {
      result[c._id as string] = c.count as number;
    }
    return result;
  }

  async search(query: string, limit = 20): Promise<WorkflowExecution[]> {
    const all = await this.find({});
    const regex = new RegExp(query, "i");
    return all
      .filter((e) => regex.test(e.workflowName) || regex.test(e.workflowKey) || (e.correlationId && regex.test(e.correlationId)) || (e.initiatedBy && regex.test(e.initiatedBy)))
      .slice(0, limit);
  }

  async getDashboardStats(): Promise<{
    todayTotal: number; todaySuccess: number; todayFailure: number; avgDuration: number;
    runningCount: number; failedCount: number; retryCount: number; deadLetterCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const docModels = this.model;
    const [stats] = await docModels.aggregate([
      {
        $facet: {
          todayTotal: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }],
          todaySuccess: [{ $match: { createdAt: { $gte: today }, status: "completed" } }, { $count: "count" }],
          todayFailure: [{ $match: { createdAt: { $gte: today }, status: "failed" } }, { $count: "count" }],
          avgDuration: [{ $match: { status: "completed", duration: { $exists: true } } }, { $group: { _id: null, avg: { $avg: "$duration" } } }],
          runningCount: [{ $match: { status: "running" } }, { $count: "count" }],
          failedCount: [{ $match: { status: "failed" } }, { $count: "count" }],
          retryCount: [{ $match: { status: "retrying" } }, { $count: "count" }],
        },
      },
    ]);
    return {
      todayTotal: stats.todayTotal[0]?.count ?? 0,
      todaySuccess: stats.todaySuccess[0]?.count ?? 0,
      todayFailure: stats.todayFailure[0]?.count ?? 0,
      avgDuration: stats.avgDuration[0]?.avg ?? 0,
      runningCount: stats.runningCount[0]?.count ?? 0,
      failedCount: stats.failedCount[0]?.count ?? 0,
      retryCount: stats.retryCount[0]?.count ?? 0,
      deadLetterCount: 0,
    };
  }
}

export const workflowExecutionRepository = new WorkflowExecutionRepository();
