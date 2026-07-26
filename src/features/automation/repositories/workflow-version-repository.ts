import { BaseRepository } from "@/lib/database/generic-repository";
import type { WorkflowVersion } from "../domain/automation-entity";
import { WorkflowVersionModel, type WorkflowVersionDocument } from "./workflow-version-model";

function toVersionDomain(doc: WorkflowVersionDocument): WorkflowVersion {
  return {
    id: doc._id.toString(),
    workflowId: doc.workflowId,
    version: doc.version,
    definition: doc.definition as Record<string, unknown>,
    changelog: doc.changelog,
    publishedBy: doc.publishedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class WorkflowVersionRepository extends BaseRepository<
  WorkflowVersionDocument,
  WorkflowVersion
> {
  constructor() {
    super(WorkflowVersionModel, toVersionDomain);
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowVersion[]> {
    return this.find({ workflowId });
  }

  async findLatest(workflowId: string): Promise<WorkflowVersion | null> {
    const all = await this.find({ workflowId });
    return all.length > 0 ? all.reduce((a, b) => (a.version > b.version ? a : b)) : null;
  }

  async findVersion(workflowId: string, version: number): Promise<WorkflowVersion | null> {
    const all = await this.find({ workflowId });
    return all.find((v) => v.version === version) ?? null;
  }
}

export const workflowVersionRepository = new WorkflowVersionRepository();
