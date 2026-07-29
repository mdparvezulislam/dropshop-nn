import { env } from "@/config/env";
import type {
  PaymentProvider,
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentVerificationResult,
  PaymentWebhookResult,
} from "./payment-provider";
import { logger } from "@/lib/utils/logger";

export class RocketPaymentAdapter implements PaymentProvider {
  readonly id = "rocket";
  readonly name = "DBBL Rocket Gateway";

  isConfigured(): boolean {
    return Boolean(env.ROCKET_MERCHANT_ID);
  }

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "Rocket merchant configuration missing" };
    }

    return {
      success: true,
      gatewayReference: input.referenceNumber,
      paymentUrl: `${env.ROCKET_BASE_URL.replace(/\/$/, "")}/pay?merchant=${env.ROCKET_MERCHANT_ID}&ref=${input.referenceNumber}&amount=${input.amount / 100}`,
    };
  }

  async verifyPayment(paymentRef: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", error: "Rocket credentials missing" };
    }

    try {
      const url = `${env.ROCKET_BASE_URL.replace(/\/$/, "")}/verify/${paymentRef}`;
      const res = await fetch(url, { method: "GET" });
      const data = (await res.json()) as { status?: string; transaction_id?: string; amount?: number };

      if (data.status === "SUCCESS") {
        return {
          success: true,
          status: "paid",
          transactionId: data.transaction_id || paymentRef,
          amount: data.amount ? Math.round(data.amount * 100) : undefined,
          currency: "BDT",
          paymentRef,
          rawResponse: data as Record<string, unknown>,
        };
      }

      return { success: false, status: "failed", error: `Rocket status: ${data.status || "failed"}` };
    } catch (err: unknown) {
      logger.error("Rocket verifyPayment error", err);
      return { success: false, status: "failed", error: err instanceof Error ? err.message : "Rocket error" };
    }
  }

  parseWebhookPayload(payload: unknown): PaymentWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const isSuccess = data.status === "SUCCESS";
    return {
      valid: Boolean(data.ref || data.transaction_id),
      depositId: String(data.ref || ""),
      transactionId: String(data.transaction_id || ""),
      status: isSuccess ? "paid" : "failed",
      amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
      rawPayload: payload,
    };
  }
}

export const rocketAdapter = new RocketPaymentAdapter();
