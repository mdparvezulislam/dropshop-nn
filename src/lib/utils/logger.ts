import { env } from "@/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private get currentLevel(): number {
    // Falls back to info (1) if not matching
    const configLevel = (env.LOG_LEVEL || "info") as LogLevel;
    return LOG_LEVELS[configLevel] ?? 1;
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.currentLevel <= LOG_LEVELS.debug) {
      console.log(`\x1b[35m🐛 ${this.formatMessage("debug", message, meta)}\x1b[0m`);
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.currentLevel <= LOG_LEVELS.info) {
      console.log(`\x1b[32mℹ️ ${this.formatMessage("info", message, meta)}\x1b[0m`);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.currentLevel <= LOG_LEVELS.warn) {
      console.warn(`\x1b[33m⚠️ ${this.formatMessage("warn", message, meta)}\x1b[0m`);
    }
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, any>): void {
    if (this.currentLevel <= LOG_LEVELS.error) {
      const errMeta =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack, ...meta }
          : { error, ...meta };
      console.error(`\x1b[31m🚨 ${this.formatMessage("error", message, errMeta)}\x1b[0m`);
    }
  }
}

export const logger = new Logger();
export type { LogLevel };
export default logger;
