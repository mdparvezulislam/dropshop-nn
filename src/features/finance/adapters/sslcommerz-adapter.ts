import { env } from "@/config/env";
import type {
  PaymentProvider,
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentVerificationResult,
  PaymentWebhookResult,
} from "./payment-provider";
import { logger } from "@/lib/utils/logger";

export class SSLCommerzPaymentAdapter implements PaymentProvider {
  readonly id = "sslcommerz";
  readonly name = "SSLCommerz Payment Gateway";

  isConfigured(): boolean {
    return Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD);
  }

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "SSLCommerz credentials missing" };
    }

    try {
      const amountInBdt = (input.amount / 100).toFixed(2);
      const url = `${env.SSLCOMMERZ_BASE_URL.replace(/\/$/, "")}/gwprocess/v4/api.php`;

      const formData = new URLSearchParams();
      formData.append("store_id", env.SSLCOMMERZ_STORE_ID);
      formData.append("store_passwd", env.SSLCOMMERZ_STORE_PASSWORD);
      formData.append("total_amount", amountInBdt);
      formData.append("currency", input.currency || "BDT");
      formData.append("tran_id", input.referenceNumber);
      formData.append(
        "success_url",
        input.callbackUrl || `${env.NEXT_PUBLIC_APP_URL}/api/finance/payment/callback/sslcommerz?status=success`,
      );
      formData.append(
        "fail_url",
        input.callbackUrl || `${env.NEXT_PUBLIC_APP_URL}/api/finance/payment/callback/sslcommerz?status=fail`,
      );
      formData.append(
        "cancel_url",
        input.callbackUrl || `${env.NEXT_PUBLIC_APP_URL}/api/finance/payment/callback/sslcommerz?status=cancel`,
      );
      formData.append("cus_name", "Customer");
      formData.append("cus_email", input.customerEmail || "customer@example.com");
      formData.append("cus_phone", input.customerPhone || "01700000000");
      formData.append("cus_add1", "Dhaka");
      formData.append("cus_city", "Dhaka");
      formData.append("cus_country", "Bangladesh");
      formData.append("shipping_method", "NO");

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };

      if (data.status === "SUCCESS" && data.GatewayPageURL) {
        return {
          success: true,
          gatewayReference: input.referenceNumber,
          paymentUrl: data.GatewayPageURL,
        };
      }

      return { success: false, error: data.failedreason || "SSLCommerz initiation failed" };
    } catch (err: unknown) {
      logger.error("SSLCommerz createPaymentIntent error", err);
      return { success: false, error: err instanceof Error ? err.message : "SSLCommerz error" };
    }
  }

  async verifyPayment(valId: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", error: "SSLCommerz credentials missing" };
    }

    try {
      const url = `${env.SSLCOMMERZ_BASE_URL.replace(/\/$/, "")}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${env.SSLCOMMERZ_STORE_ID}&store_passwd=${env.SSLCOMMERZ_STORE_PASSWORD}&v=1&format=json`;
      const res = await fetch(url, { method: "GET" });
      const data = (await res.json()) as { status?: string; tran_id?: string; amount?: string; val_id?: string };

      if (data.status === "VALID" || data.status === "VALIDATED") {
        return {
          success: true,
          status: "paid",
          transactionId: data.tran_id || valId,
          amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
          currency: "BDT",
          paymentRef: data.val_id || valId,
          rawResponse: data as Record<string, unknown>,
        };
      }

      return { success: false, status: "failed", error: `SSLCommerz validation status: ${data.status}` };
    } catch (err: unknown) {
      logger.error("SSLCommerz verifyPayment error", err);
      return { success: false, status: "failed", error: err instanceof Error ? err.message : "SSLCommerz error" };
    }
  }

  parseWebhookPayload(payload: unknown): PaymentWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const isSuccess = data.status === "VALID" || data.status === "VALIDATED";
    return {
      valid: Boolean(data.val_id || data.tran_id),
      depositId: String(data.tran_id || ""),
      transactionId: String(data.val_id || data.tran_id || ""),
      status: isSuccess ? "paid" : "failed",
      amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
      rawPayload: payload,
    };
  }
}

export const sslcommerzAdapter = new SSLCommerzPaymentAdapter();
