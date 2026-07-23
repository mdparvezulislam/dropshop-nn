import { workflowRepository } from "../repositories/workflow-repository";
import { workflowVersionRepository } from "../repositories/workflow-version-repository";

export class AutomationExportService {
  async exportWorkflow(workflowId: string): Promise<Record<string, unknown> | null> {
    const workflow = await workflowRepository.findById(workflowId);
    if (!workflow) return null;

    const versions = await workflowVersionRepository.findByWorkflowId(workflowId);

    return {
      exportVersion: "1.0",
      exportedAt: new Date().toISOString(),
      workflow,
      versions: versions.map((v) => ({
        version: v.version,
        changelog: v.changelog,
        publishedBy: v.publishedBy,
        createdAt: v.createdAt,
      })),
    };
  }

  async importWorkflow(data: Record<string, unknown>): Promise<boolean> {
    const workflowData = data.workflow as Record<string, unknown>;
    if (!workflowData) return false;

    try {
      await workflowRepository.create(workflowData as unknown as Parameters<typeof workflowRepository.create>[0]);
      return true;
    } catch {
      return false;
    }
  }
}

export const automationExportService = new AutomationExportService();
