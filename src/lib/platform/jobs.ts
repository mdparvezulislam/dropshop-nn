import type { BackgroundJobDefinition } from "./platform-types";
import { logger } from "@/lib/utils/logger";

const JOB_REGISTRY = new Map<string, BackgroundJobDefinition>();

export class BackgroundJobs {
  private constructor() {}

  static register(job: BackgroundJobDefinition): void {
    if (JOB_REGISTRY.has(job.name)) {
      throw new Error(`Background job "${job.name}" is already registered`);
    }
    JOB_REGISTRY.set(job.name, job);
    logger.info(`BackgroundJobs: registered "${job.name}" (${job.engine})`);
  }

  static get(name: string): BackgroundJobDefinition | undefined {
    return JOB_REGISTRY.get(name);
  }

  static getAll(): BackgroundJobDefinition[] {
    return Array.from(JOB_REGISTRY.values());
  }

  static getByEngine(engineId: string): BackgroundJobDefinition[] {
    return Array.from(JOB_REGISTRY.values()).filter((j) => j.engine === engineId);
  }

  static getScheduled(): BackgroundJobDefinition[] {
    return Array.from(JOB_REGISTRY.values()).filter((j) => j.cron && j.enabled);
  }

  static isRegistered(name: string): boolean {
    return JOB_REGISTRY.has(name);
  }

  static async registerAll(): Promise<void> {
    /* Courier jobs */
    BackgroundJobs.register({
      name: "courier.sync-tracking",
      engine: "COURIER",
      cron: "*/5 * * * *",
      description: "Synchronize tracking statuses from courier APIs for active shipments",
      enabled: true,
    });
    BackgroundJobs.register({
      name: "courier.expire-stale-pickups",
      engine: "COURIER",
      cron: "0 */6 * * *",
      description: "Auto-expire stale pending pickup requests older than 2 days",
      enabled: true,
    });
    BackgroundJobs.register({
      name: "courier.retry-failed-submissions",
      engine: "COURIER",
      cron: "0 */2 * * *",
      description: "Retry shipments that failed creation due to remote API network timeouts",
      enabled: true,
    });
    BackgroundJobs.register({
      name: "courier.reconcile-daily",
      engine: "COURIER",
      cron: "0 2 * * *",
      description: "Daily reconciliation check verifying shipment delivery records",
      enabled: true,
    });

    /* Finance jobs */
    BackgroundJobs.register({
      name: "finance.clear-pending-ledgers",
      engine: "FINANCE",
      cron: "*/30 * * * *",
      description: "Clear pending ledger entries whose clearance delay has passed",
      enabled: true,
    });
    BackgroundJobs.register({
      name: "finance.expire-stale-withdrawals",
      engine: "FINANCE",
      cron: "0 */6 * * *",
      description: "Auto-expire stale pending withdrawals older than configured days",
      enabled: true,
    });
    BackgroundJobs.register({
      name: "finance.reconcile-wallets",
      engine: "FINANCE",
      cron: "0 3 * * *",
      description: "Daily wallet balance reconciliation against ledger records",
      enabled: true,
    });
    BackgroundJobs.register({
      name: "finance.generate-daily-summary",
      engine: "FINANCE",
      cron: "0 23 * * *",
      description: "Aggregate daily platform finance summary report",
      enabled: true,
    });

    /* Order jobs (future) */
    BackgroundJobs.register({
      name: "order.auto-cancel-stale",
      engine: "ORDER",
      cron: "*/15 * * * *",
      description: "Auto-cancel stale unpaid orders after configured TTL",
      enabled: false,
    });
    BackgroundJobs.register({
      name: "order.auto-complete-delivered",
      engine: "ORDER",
      cron: "0 */12 * * *",
      description: "Auto-complete orders that were delivered and past completion delay",
      enabled: false,
    });

    logger.info(
      `BackgroundJobs: registered ${JOB_REGISTRY.size} jobs (${BackgroundJobs.getScheduled().length} scheduled)`,
    );
  }

  static clear(): void {
    JOB_REGISTRY.clear();
  }
}
