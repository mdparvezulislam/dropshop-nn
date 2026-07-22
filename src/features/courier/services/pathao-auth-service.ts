import { CourierConfigRepository } from "../repositories/courier-config-repository";
import { CourierApiLogRepository } from "../repositories/courier-api-log-repository";
import { logger } from "@/shared/utils/logger";

export interface PathaoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class PathaoAuthService {
  private readonly configRepository: CourierConfigRepository;
  private readonly logRepository: CourierApiLogRepository;

  constructor() {
    this.configRepository = new CourierConfigRepository();
    this.logRepository = new CourierApiLogRepository();
  }

  async issueToken(credentials: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    apiBaseUrl?: string;
  }): Promise<{ success: boolean; accessToken?: string; refreshToken?: string; expiresAt?: Date; error?: string }> {
    const startTime = Date.now();
    const baseUrl = credentials.apiBaseUrl || "https://api-hermes.pathao.com";
    const endpoint = `${baseUrl}/aladdin/api/v1/issue-token`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          username: credentials.username,
          password: credentials.password,
          grant_type: "password",
        }),
      });

      const responseTimeMs = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok || !data.access_token) {
        const errorMsg = data.message || data.error || `HTTP ${response.status}: Failed to issue Pathao token`;
        await this.logRepository.create({
          provider: "pathao",
          logType: "auth",
          endpoint,
          requestPayload: { clientId: credentials.clientId, username: credentials.username, grant_type: "password" },
          responsePayload: data,
          statusCode: response.status,
          responseTimeMs,
          success: false,
          errorMessage: errorMsg,
          timestamp: new Date(),
        } as any);

        return { success: false, error: errorMsg };
      }

      const expiresAt = new Date(Date.now() + (data.expires_in || 86400) * 1000);

      // Persist generated tokens in Pathao courier config
      await this.configRepository.upsertConfig("pathao", {
        pathaoConfig: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          username: credentials.username,
          password: credentials.password,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenExpiresAt: expiresAt,
          autoRefresh: true,
        },
        connectionStatus: "connected",
        lastTestedAt: new Date(),
      });

      await this.logRepository.create({
        provider: "pathao",
        logType: "auth",
        endpoint,
        requestPayload: { clientId: credentials.clientId, username: credentials.username, grant_type: "password" },
        responsePayload: { token_type: data.token_type, expires_in: data.expires_in },
        statusCode: response.status,
        responseTimeMs,
        success: true,
        timestamp: new Date(),
      } as any);

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
      };
    } catch (err: any) {
      logger.error("PathaoAuthService: issueToken failed", err);
      return { success: false, error: err.message };
    }
  }

  async refreshToken(configId?: string): Promise<{ success: boolean; accessToken?: string; error?: string }> {
    const config = await this.configRepository.findByProvider("pathao");
    if (!config || !config.pathaoConfig?.refreshToken) {
      return { success: false, error: "No active Pathao refresh token available. Please generate a new token." };
    }

    const { clientId, clientSecret, refreshToken } = config.pathaoConfig;
    const baseUrl = config.apiBaseUrl || "https://api-hermes.pathao.com";
    const endpoint = `${baseUrl}/aladdin/api/v1/issue-token`;
    const startTime = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const responseTimeMs = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok || !data.access_token) {
        const errorMsg = data.message || `Failed to refresh Pathao token`;
        return { success: false, error: errorMsg };
      }

      const expiresAt = new Date(Date.now() + (data.expires_in || 86400) * 1000);

      await this.configRepository.upsertConfig("pathao", {
        pathaoConfig: {
          ...config.pathaoConfig,
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          tokenExpiresAt: expiresAt,
        },
        connectionStatus: "connected",
        lastTestedAt: new Date(),
      });

      return { success: true, accessToken: data.access_token };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async fetchPathaoStores(): Promise<{ success: boolean; stores?: any[]; error?: string }> {
    const config = await this.configRepository.findByProvider("pathao");
    if (!config || !config.pathaoConfig?.accessToken) {
      return { success: false, error: "Pathao Access Token missing. Please generate a token first." };
    }

    const baseUrl = config.apiBaseUrl || "https://api-hermes.pathao.com";
    const endpoint = `${baseUrl}/aladdin/api/v1/stores`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${config.pathaoConfig.accessToken}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || "Failed to fetch Pathao store locations" };
      }

      return { success: true, stores: data.data?.data || data.data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export default PathaoAuthService;
