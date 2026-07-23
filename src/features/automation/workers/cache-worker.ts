import { automationCacheService } from "../services/automation-cache-service";

export async function warmupAutomationCache(): Promise<void> {
  await automationCacheService.set("automation:health-check", "ok", 60);
}

export async function cleanupAutomationCache(): Promise<void> {
  await automationCacheService.delPattern("automation:*");
}
