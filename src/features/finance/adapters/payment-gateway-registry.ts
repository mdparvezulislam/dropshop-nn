import type { PaymentProvider } from "./payment-provider";
import { bkashAdapter } from "./bkash-adapter";
import { nagadAdapter } from "./nagad-adapter";
import { rocketAdapter } from "./rocket-adapter";
import { sslcommerzAdapter } from "./sslcommerz-adapter";

const ADAPTERS = new Map<string, PaymentProvider>([
  ["bkash", bkashAdapter],
  ["nagad", nagadAdapter],
  ["rocket", rocketAdapter],
  ["sslcommerz", sslcommerzAdapter],
]);

export class PaymentGatewayRegistry {
  static get(providerId: string): PaymentProvider {
    const key = providerId.toLowerCase();
    const provider = ADAPTERS.get(key);
    if (!provider) {
      throw new Error(`Unsupported payment provider: ${providerId}`);
    }
    return provider;
  }

  static list(): string[] {
    return Array.from(ADAPTERS.keys());
  }

  static isSupported(providerId: string): boolean {
    return ADAPTERS.has(providerId.toLowerCase());
  }

  static isConfigured(providerId: string): boolean {
    const key = providerId.toLowerCase();
    return ADAPTERS.has(key) && (ADAPTERS.get(key)?.isConfigured() ?? false);
  }
}

export default PaymentGatewayRegistry;
