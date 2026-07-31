import { logger } from "@/lib/utils/logger";

export interface SmsDeliveryResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface ISmsProvider {
  sendSms(to: string, message: string): Promise<SmsDeliveryResult>;
}

/**
 * Pluggable SMS Provider supporting generic HTTP API Gateways (ElitBuzz, Greenweb, BulkSMS BD)
 */
export class PluggableSmsProvider implements ISmsProvider {
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || "";
    this.senderId = process.env.SMS_SENDER_ID || "NN Enterprise";
    this.apiUrl = process.env.SMS_API_URL || "https://api.sms-gateway.com/send";
  }

  async sendSms(to: string, message: string): Promise<SmsDeliveryResult> {
    if (!this.apiKey) {
      logger.info("[SMS Stub Provider] SMS API Key not configured. Simulated delivery.", {
        to,
        message: message.slice(0, 60),
      });
      return {
        success: true,
        provider: "sms-stub-provider",
        messageId: `stub_sms_${Date.now()}`,
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          sender: this.senderId,
          to,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS Gateway returned HTTP status ${response.status}`);
      }

      const resData = await response.json();
      return {
        success: true,
        provider: "http-sms-gateway",
        messageId: resData.message_id || resData.id || `sms_${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "SMS dispatch failed";
      logger.error("PluggableSmsProvider error", { error: errorMsg, to });
      return {
        success: false,
        provider: "http-sms-gateway",
        error: errorMsg,
      };
    }
  }
}

export default PluggableSmsProvider;
