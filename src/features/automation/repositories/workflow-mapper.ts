import type { WorkflowDocument } from "./workflow-model";
import type { WorkflowDefinition } from "../domain/automation-entity";

export function toDomain(doc: WorkflowDocument): WorkflowDefinition {
  return {
    id: doc._id.toString(),
    name: doc.name,
    key: doc.key,
    description: doc.description,
    category: doc.category as WorkflowDefinition["category"],
    status: doc.status as WorkflowDefinition["status"],
    version: doc.version,
    trigger: doc.trigger as unknown as WorkflowDefinition["trigger"],
    rules: doc.rules as unknown as WorkflowDefinition["rules"],
    steps: doc.steps as unknown as WorkflowDefinition["steps"],
    tags: doc.tags ?? [],
    settings: doc.settings as unknown as WorkflowDefinition["settings"],
    lastRunAt: doc.lastRunAt,
    lastRunStatus: doc.lastRunStatus as WorkflowDefinition["lastRunStatus"],
    totalRuns: doc.totalRuns ?? 0,
    totalFailures: doc.totalFailures ?? 0,
    averageDuration: doc.averageDuration ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function toDomainMany(docs: WorkflowDocument[]): WorkflowDefinition[] {
  return docs.map(toDomain);
}
