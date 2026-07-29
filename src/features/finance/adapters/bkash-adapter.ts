import { env } from "@/config/env";
import type {
  PaymentProvider,
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentVerificationResult,
  PaymentWebhookResult,
} from "./payment-provider";
import { logger } from "@/lib/utils/logger";

export class BkashPaymentAdapter implements PaymentProvider {
  readonly id = "bkash";
  readonly name = "bKash Direct Merchant";

  private idToken: string | null = null;
  private tokenExpiresAt: number = 0;

  isConfigured(): boolean {
    return Boolean(
      env.BKASH_APP_KEY && env.BKASH_APP_SECRET && env.BKASH_USERNAME && env.BKASH_PASSWORD,
    );
  }

  private async grantToken(): Promise<string> {
    if (this.idToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.idToken;
    }

    const url = `${env.BKASH_BASE_URL.replace(/\/$/, "")}/checkout/token/grant`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        username: env.BKASH_USERNAME,
        password: env.BKASH_PASSWORD,
      },
      body: JSON.stringify({
        app_key: env.BKASH_APP_KEY,
        app_secret: env.BKASH_APP_SECRET,
      }),
    });

    if (!res.ok) {
      throw new Error(`bKash grant token failed HTTP ${res.status}`);
    }

    const data = (await res.json()) as { id_token: string; expires_in: number };
    this.idToken = data.id_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return this.idToken;
  }

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "bKash credentials missing" };
    }

    try {
      const token = await this.grantToken();
      const url = `${env.BKASH_BASE_URL.replace(/\/$/, "")}/checkout/payment/create`;
      const amountInBdt = (input.amount / 100).toFixed(2);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": env.BKASH_APP_KEY,
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: input.customerPhone || "01700000000",
          callbackURL: input.callbackUrl || `${env.NEXT_PUBLIC_APP_URL}/api/finance/payment/callback/bkash`,
          amount: amountInBdt,
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: input.referenceNumber,
        }),
      });

      const data = (await res.json()) as {
        paymentID?: string;
        bkashURL?: string;
        errorMessage?: string;
      };

      if (data.paymentID && data.bkashURL) {
        return {
          success: true,
          gatewayReference: data.paymentID,
          paymentUrl: data.bkashURL,
        };
      }

      return { success: false, error: data.errorMessage || "bKash payment creation failed" };
    } catch (err: unknown) {
      logger.error("Bkash createPaymentIntent error", err);
      return { success: false, error: err instanceof Error ? err.message : "bKash error" };
    }
  }

  async verifyPayment(paymentRef: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", error: "bKash credentials missing" };
    }

    try {
      const token = await this.grantToken();
      const url = `${env.BKASH_BASE_URL.replace(/\/$/, "")}/checkout/payment/execute/${paymentRef}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": env.BKASH_APP_KEY,
        },
      });

      const data = (await res.json()) as {
        transactionStatus?: string;
        trxID?: string;
        amount?: string;
        currency?: string;
        errorMessage?: string;
      };

      if (data.transactionStatus === "Completed" && data.trxID) {
        return {
          success: true,
          status: "paid",
          transactionId: data.trxID,
          amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
          currency: data.currency || "BDT",
          paymentRef,
          rawResponse: data as Record<string, unknown>,
        };
      }

      return {
        success: false,
        status: "failed",
        error: data.errorMessage || `bKash status: ${data.transactionStatus}`,
        rawResponse: data as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("Bkash verifyPayment error", err);
      return { success: false, status: "failed", error: err instanceof Error ? err.message : "Verification error" };
    }
  }

  parseWebhookPayload(payload: unknown): PaymentWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const isSuccess = data.transactionStatus === "Completed" || data.status === "Completed";
    return {
      valid: Boolean(data.paymentID || data.trxID),
      depositId: String(data.merchantInvoiceNumber || ""),
      transactionId: String(data.trxID || data.paymentID || ""),
      status: isSuccess ? "paid" : "failed",
      amount: data.amount ? Math.round(parseFloat(data.amount) * 100) : undefined,
      rawPayload: payload,
    };
  }
}

export const bkashAdapter = new BkashPaymentAdapter();
