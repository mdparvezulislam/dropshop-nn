import { CourierConfigRepository } from "../repositories/courier-config-repository";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import type { CourierConfig } from "../domain/courier-config-entity";
import type { ConnectionTestResult } from "../adapters/provider-adapter";
import { logger } from "@/lib/utils/logger";

export class CourierConfigService {
  private readonly configRepository: CourierConfigRepository;

  constructor() {
    this.configRepository = new CourierConfigRepository();
  }

  async getConfig(provider: string): Promise<CourierConfig | null> {
    return this.configRepository.findByProvider(provider.toLowerCase());
  }

  async listConfigs(): Promise<CourierConfig[]> {
    const existing = await this.configRepository.listAllConfigs();
    const supported = CourierProviderRegistry.list();

    const result: CourierConfig[] = [];
    for (const provider of supported) {
      const match = existing.find((c) => c.provider === provider);
      if (match) {
        result.push(match);
      } else {
        result.push({
          id: `CONFIG-${provider.toUpperCase()}`,
          provider: provider as any,
          displayName: provider.charAt(0).toUpperCase() + provider.slice(1),
          enabled: false,
          isSandbox: true,
          apiBaseUrl: `https://api.${provider}.com`,
          apiKey: "",
          defaultStatus: "pending_booking",
          defaultPackageType: "parcel",
          defaultWeight: 500,
          defaultCodPolicy: "collect_full",
          connectionStatus: "untested",
        } as CourierConfig);
      }
    }

    return result;
  }

  async saveConfig(provider: string, data: Partial<CourierConfig>): Promise<CourierConfig> {
    const updated = await this.configRepository.upsertConfig(provider.toLowerCase(), data);
    logger.info("CourierConfigService: saved configuration", { provider });
    return updated;
  }

  async testConnection(provider: string): Promise<ConnectionTestResult> {
    const adapter = CourierProviderRegistry.get(provider);
    const result = await adapter.testConnection();

    await this.configRepository.upsertConfig(provider.toLowerCase(), {
      lastTestedAt: new Date(),
      connectionStatus: result.success ? "connected" : "error",
      lastErrorMessage: result.success ? undefined : result.message,
    });

    return result;
  }
}

export default CourierConfigService;
