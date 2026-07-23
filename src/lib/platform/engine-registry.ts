import type { PlatformEngine, PlatformEngineId, EngineStatus, BootstrapContext, BootstrapError } from "./platform-types";
import { logger } from "@/lib/utils/logger";

export interface EngineLifecycle {
  preInit?: () => Promise<void>;
  init?: () => Promise<void>;
  postInit?: () => Promise<void>;
}

const ENGINES = new Map<PlatformEngineId, PlatformEngine>();
const LIFECYCLES = new Map<PlatformEngineId, EngineLifecycle>();

export class EngineRegistry {
  private constructor() {}

  static register(engine: PlatformEngine, lifecycle?: EngineLifecycle): void {
    if (ENGINES.has(engine.id)) {
      throw new Error(`Engine "${engine.id}" is already registered`);
    }
    ENGINES.set(engine.id, engine);
    if (lifecycle) {
      LIFECYCLES.set(engine.id, lifecycle);
    }
    logger.info(`EngineRegistry: registered "${engine.id}" (${engine.name})`);
  }

  static get(id: PlatformEngineId): PlatformEngine | undefined {
    return ENGINES.get(id);
  }

  static getAll(): PlatformEngine[] {
    return Array.from(ENGINES.values());
  }

  static getLifecycle(id: PlatformEngineId): EngineLifecycle | undefined {
    return LIFECYCLES.get(id);
  }

  static isRegistered(id: PlatformEngineId): boolean {
    return ENGINES.has(id);
  }

  static getEnabled(): PlatformEngine[] {
    return Array.from(ENGINES.values()).filter((e) => e.enabled);
  }

  static async runLifecycle(
    id: PlatformEngineId,
    phase: "preInit" | "init" | "postInit",
    context: BootstrapContext,
  ): Promise<void> {
    const lifecycle = LIFECYCLES.get(id);
    const fn = lifecycle?.[phase];
    if (!fn) return;

    const status = context.engines.get(id);
    if (status) {
      status[phase] = "running";
    }

    try {
      await fn();
      if (status) {
        status[phase] = "done";
      }
      logger.info(`EngineRegistry: ${id} ${phase} completed`);
    } catch (error) {
      if (status) {
        status[phase] = "failed";
        status.error = error instanceof Error ? error.message : String(error);
      }
      context.errors.push({
        engineId: id,
        phase,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
      logger.error(`EngineRegistry: ${id} ${phase} failed`, error);
    }
  }

  static clear(): void {
    ENGINES.clear();
    LIFECYCLES.clear();
  }
}
