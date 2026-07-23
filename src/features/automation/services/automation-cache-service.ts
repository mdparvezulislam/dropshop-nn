const DEFAULT_TTL = 300;

export class AutomationCacheService {
  private memoryCache = new Map<string, { data: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const memEntry = this.memoryCache.get(key);
    if (memEntry && memEntry.expires > Date.now()) {
      return memEntry.data as T;
    }
    if (memEntry) this.memoryCache.delete(key);
    return null;
  }

  async set<T>(key: string, data: T, ttl = DEFAULT_TTL): Promise<void> {
    this.memoryCache.set(key, { data, expires: Date.now() + ttl * 1000 });
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) this.memoryCache.delete(key);
    }
  }
}

export const automationCacheService = new AutomationCacheService();
