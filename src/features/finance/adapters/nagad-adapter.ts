import { env } from "@/config/env";
import type {
  PaymentProvider,
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentVerificationResult,
  PaymentWebhookResult,
} from "./payment-provider";
import { logger } from "@/lib/utils/logger";

export class NagadPaymentAdapter implements PaymentProvider {
  readonly id = "nagad";
  readonly name = "Nagad Online Payment";

  isConfigured(): boolean {
    return Boolean(env.NAGAD_MERCHANT_ID);
  }

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "Nagad merchant configuration missing" };
    }

    try {
      const amountInBdt = (input.amount / 100).toFixed(2);
      const url = `${env.NAGAD_BASE_URL.replace(/\/$/, "")}/check-out/initialize/${env.NAGAD_MERCHANT_ID}/${input.referenceNumber}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-KM-IP-V4": "127.0.0.1" },
        body: JSON.stringify({
          merchantId: env.NAGAD_MERCHANT_ID,
          orderId: input.referenceNumber,
          amount: amountInBdt,
          currencyCode: "050",
          challenge: `CH-${Date.now()}`,
        }),
      });

      const data = (await res.json()) as { callBackUrl?: string; callBackUrlRedirect?: string; reason?: string };

      if (data.callBackUrlRedirect || data.callBackUrl) {
        return {
          success: true,
          gatewayReference: input.referenceNumber,
          paymentUrl: data.callBackUrlRedirect || data.callBackUrl,
        };
      }

      return { success: false, error: data.reason || "Nagad initialization failed" };
    } catch (err: unknown) {
      logger.error("Nagad createPaymentIntent error", err);
      return { success: false, error: err instanceof Error ? err.message : "Nagad error" };
    }
  }

  async verifyPayment(paymentRef: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", error: "Nagad merchant configuration missing" };
    }

    try {
      const url = `${env.NAGAD_BASE_URL.replace(/\/$/, "")}/verify/payment/${paymentRef}`;
      const res = await fetch(url, { method: "GET" });
      const data = (await res.json()) as { status?: string; issuerPaymentRefNo?: string; amount?: string };

      if (data.status === "Success") {
        return {
          success: true,
          status: "paid",
          transactionId: data.issuerPaymentRefNo || paymentRef,
          amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
          currency: "BDT",
          paymentRef,
          rawResponse: data as Record<string, unknown>,
        };
      }

      return { success: false, status: "failed", error: `Nagad status: ${data.status || "failed"}` };
    } catch (err: unknown) {
      logger.error("Nagad verifyPayment error", err);
      return { success: false, status: "failed", error: err instanceof Error ? err.message : "Nagad error" };
    }
  }

  parseWebhookPayload(payload: unknown): PaymentWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const isSuccess = data.status === "Success";
    return {
      valid: Boolean(data.order_id || data.payment_ref_id),
      depositId: String(data.order_id || ""),
      transactionId: String(data.payment_ref_id || data.issuer_payment_ref_no || ""),
      status: isSuccess ? "paid" : "failed",
      amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
      rawPayload: payload,
    };
  }
}

export const nagadAdapter = new NagadPaymentAdapter();
