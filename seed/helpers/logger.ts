export class SeedLogger {
  static info(message: string, meta?: Record<string, unknown>): void {
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
    console.log(`\x1b[36m[SEED INFO]\x1b[0m ${message}${metaStr}`);
  }

  static success(message: string, count?: number): void {
    const countStr = count !== undefined ? ` (\x1b[33m${count} records\x1b[0m)` : "";
    console.log(`\x1b[32m✔ [SEED SUCCESS]\x1b[0m ${message}${countStr}`);
  }

  static warn(message: string): void {
    console.log(`\x1b[33m⚠ [SEED WARN]\x1b[0m ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`\x1b[31m✖ [SEED ERROR]\x1b[0m ${message}`, error ?? "");
  }

  static step(step: number, total: number, title: string): void {
    console.log(`\n\x1b[35m[${step}/${total}]\x1b[0m \x1b[1m${title}\x1b[0m`);
  }
}
