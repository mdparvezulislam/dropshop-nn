import { BaseRepository } from "@/shared/lib/database/generic-repository";
import type { ExecutionLog } from "../domain/automation-entity";
import { ExecutionLogModel, type ExecutionLogDocument } from "./execution-log-model";

function toLogDomain(doc: ExecutionLogDocument): ExecutionLog {
  return {
    id: doc._id.toString(),
    executionId: doc.executionId,
    workflowId: doc.workflowId,
    level: doc.level as ExecutionLog["level"],
    message: doc.message,
    step: doc.step,
    data: doc.data as Record<string, unknown> | undefined,
    timestamp: doc.timestamp,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class ExecutionLogRepository extends BaseRepository<ExecutionLogDocument, ExecutionLog> {
  constructor() {
    super(ExecutionLogModel, toLogDomain);
  }

  async findByExecutionId(executionId: string): Promise<ExecutionLog[]> {
    const all = await this.find({ executionId });
    return all.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async findErrors(workflowId: string, limit = 50): Promise<ExecutionLog[]> {
    const all = await this.find({ workflowId, level: "error" });
    return all.slice(0, limit);
  }
}

export const executionLogRepository = new ExecutionLogRepository();
