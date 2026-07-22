import { CourierConfigRepository } from "../repositories/courier-config-repository";
import { CourierApiLogRepository } from "../repositories/courier-api-log-repository";
import type { CourierConfig, SteadfastCredentials, PathaoCredentials, AutoBookingRules } from "../domain/courier-config-entity";
import { logger } from "@/shared/utils/logger";

export const DEFAULT_STEADFAST_STATUS_MAPPING: Record<string, string> = {
  pending: "pending_booking",
  in_review: "pending_booking",
  delivered: "delivered",
  partial_delivered: "partial_delivered",
  cancelled: "cancelled",
  hold: "in_transit",
  in_transit: "in_transit",
  unknown: "failed",
};

export const DEFAULT_PATHAO_STATUS_MAPPING: Record<string, string> = {
  Pending: "pending_booking",
  Pickup_Requested: "pickup_requested",
  Picked_Up: "picked_up",
  At_Sorting_Hub: "in_transit",
  In_Transit: "in_transit",
  Out_For_Delivery: "out_for_delivery",
  Delivered: "delivered",
  Partial_Delivered: "partial_delivered",
  Returned: "returned",
  Cancelled: "cancelled",
  Failed: "failed",
};

export class CourierSettingsService {
  private readonly configRepository: CourierConfigRepository;
  private readonly logRepository: CourierApiLogRepository;

  constructor() {
    this.configRepository = new CourierConfigRepository();
    this.logRepository = new CourierApiLogRepository();
  }

  async saveSteadfastSettings(input: {
    enabled: boolean;
    isSandbox: boolean;
    apiBaseUrl: string;
    apiKey: string;
    apiSecret?: string;
    merchantId?: string;
    pickupAddressId?: string;
    defaultWeight?: number;
    defaultPackageType?: string;
    webhookSecret?: string;
    statusMapping?: Record<string, string>;
  }): Promise<CourierConfig> {
    const updated = await this.configRepository.upsertConfig("steadfast", {
      displayName: "Steadfast Courier",
      enabled: input.enabled,
      isSandbox: input.isSandbox,
      apiBaseUrl: input.apiBaseUrl,
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      merchantId: input.merchantId,
      pickupAddressId: input.pickupAddressId,
      defaultWeight: input.defaultWeight || 500,
      defaultPackageType: input.defaultPackageType || "parcel",
      webhookSecret: input.webhookSecret,
      steadfastConfig: {
        apiKey: input.apiKey,
        apiSecret: input.apiSecret,
        merchantId: input.merchantId,
      },
      statusMapping: input.statusMapping || DEFAULT_STEADFAST_STATUS_MAPPING,
      connectionStatus: input.apiKey ? "connected" : "untested",
    });

    logger.info("CourierSettingsService: saved Steadfast settings");
    return updated;
  }

  async savePathaoSettings(input: {
    enabled: boolean;
    isSandbox: boolean;
    apiBaseUrl: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    storeId?: string;
    pickupAddressId?: string;
    defaultWeight?: number;
    defaultPackageType?: string;
    webhookSecret?: string;
    statusMapping?: Record<string, string>;
  }): Promise<CourierConfig> {
    const existing = await this.configRepository.findByProvider("pathao");

    const updated = await this.configRepository.upsertConfig("pathao", {
      displayName: "Pathao Courier",
      enabled: input.enabled,
      isSandbox: input.isSandbox,
      apiBaseUrl: input.apiBaseUrl,
      apiKey: input.clientId,
      apiSecret: input.clientSecret,
      pickupAddressId: input.pickupAddressId,
      defaultWeight: input.defaultWeight || 500,
      defaultPackageType: input.defaultPackageType || "parcel",
      webhookSecret: input.webhookSecret,
      pathaoConfig: {
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        username: input.username,
        password: input.password,
        storeId: input.storeId,
        accessToken: existing?.pathaoConfig?.accessToken,
        refreshToken: existing?.pathaoConfig?.refreshToken,
        tokenExpiresAt: existing?.pathaoConfig?.tokenExpiresAt,
        autoRefresh: true,
      },
      statusMapping: input.statusMapping || DEFAULT_PATHAO_STATUS_MAPPING,
      connectionStatus: input.clientId ? "connected" : "untested",
    });

    logger.info("CourierSettingsService: saved Pathao settings");
    return updated;
  }

  async saveGlobalShippingDefaults(input: {
    defaultCourier: string;
    autoBookingRules: AutoBookingRules;
  }): Promise<void> {
    const providers = ["steadfast", "pathao"];
    for (const provider of providers) {
      await this.configRepository.upsertConfig(provider, {
        autoBookingRules: input.autoBookingRules,
      });
    }
  }

  async getCourierSettingsDashboard(): Promise<{
    steadfast: CourierConfig | null;
    pathao: CourierConfig | null;
    steadfastHealth: any;
    pathaoHealth: any;
  }> {
    const steadfast = await this.configRepository.findByProvider("steadfast");
    const pathao = await this.configRepository.findByProvider("pathao");

    const steadfastHealth = await this.logRepository.getHealthStats("steadfast");
    const pathaoHealth = await this.logRepository.getHealthStats("pathao");

    return {
      steadfast,
      pathao,
      steadfastHealth,
      pathaoHealth,
    };
  }
}

export default CourierSettingsService;
