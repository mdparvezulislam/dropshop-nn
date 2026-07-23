import { PlatformBootstrap } from "./platform-bootstrap";
import { BackgroundJobs } from "./jobs";
import { logger } from "@/lib/utils/logger";

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-export";

let bootstrapped = false;

export async function ensurePlatformInitialized(): Promise<void> {
  if (bootstrapped) return;
  if (isBuildTime) return;
  bootstrapped = true;

  if (typeof window === "undefined") {
    logger.info("Platform: starting server-side initialization");

    try {
      const context = await PlatformBootstrap.initialize();
      logger.info(`Platform: initialization context: ${context.engines.size} engines, ${context.errors.length} errors`);
    } catch (error) {
      logger.error("Platform: bootstrap failed", error);
    }

    try {
      await BackgroundJobs.registerAll();
      logger.info("Platform: background jobs registered");
    } catch (error) {
      logger.error("Platform: background jobs registration failed", error);
    }

    const status = await PlatformBootstrap.verifyEngines();
    logger.info("Platform: engine verification", status);
  }
}
