export interface PaymentIntentInput {
  amount: number; // in cents
  currency?: string;
  depositId: string;
  referenceNumber: string;
  customerPhone?: string;
  customerEmail?: string;
  callbackUrl?: string;
}

export interface PaymentIntentResult {
  success: boolean;
  gatewayReference?: string;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: "paid" | "failed" | "pending" | "cancelled";
  transactionId?: string;
  amount?: number;
  currency?: string;
  paymentRef?: string;
  rawResponse?: Record<string, unknown>;
  error?: string;
}

export interface PaymentWebhookResult {
  valid: boolean;
  depositId?: string;
  transactionId?: string;
  status: "paid" | "failed" | "pending" | "cancelled";
  amount?: number;
  rawPayload: unknown;
}

export interface PaymentProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyPayment(paymentRef: string, transactionId?: string): Promise<PaymentVerificationResult>;
  parseWebhookPayload(payload: unknown, signature?: string): PaymentWebhookResult;
}
