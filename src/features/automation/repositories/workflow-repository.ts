import { BaseRepository } from "@/lib/database/generic-repository";
import type { WorkflowDefinition } from "../domain/automation-entity";
import { WorkflowDefinitionModel, type WorkflowDocument } from "./workflow-model";
import { toDomain, toDomainMany } from "./workflow-mapper";

export class WorkflowRepository extends BaseRepository<WorkflowDocument, WorkflowDefinition> {
  constructor() {
    super(WorkflowDefinitionModel, toDomain);
  }

  async findActiveByEventType(eventType: string): Promise<WorkflowDefinition[]> {
    const docs = await this.find({
      status: "active",
      "trigger.type": "event",
      "trigger.eventType": eventType,
    });
    return docs;
  }

  async findByKey(key: string): Promise<WorkflowDefinition | null> {
    return this.findOne({ key });
  }

  async findByCategory(category: string): Promise<WorkflowDefinition[]> {
    return this.find({ category });
  }

  async findActive(limit = 50): Promise<WorkflowDefinition[]> {
    const docs = await this.find({ status: "active" });
    return docs.slice(0, limit);
  }

  async findScheduledActive(): Promise<WorkflowDefinition[]> {
    return this.find({ status: "active", "trigger.type": "schedule" });
  }

  async search(query: string, limit = 20): Promise<WorkflowDefinition[]> {
    const regex = new RegExp(query, "i");
    const all = await this.find({});
    return all
      .filter(
        (w) =>
          regex.test(w.name) ||
          regex.test(w.key) ||
          (w.description && regex.test(w.description)) ||
          w.tags.some((t) => regex.test(t)),
      )
      .slice(0, limit);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await this.model.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const result: Record<string, number> = { draft: 0, active: 0, paused: 0, archived: 0 };
    for (const c of counts) {
      result[c._id] = c.count;
    }
    return result;
  }
}

export const workflowRepository = new WorkflowRepository();
