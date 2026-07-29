import type { CourierProvider } from "./provider-adapter";
import { createManualCourierAdapter } from "./manual-adapter";
import { COURIER_PROVIDERS, getCourierProvider } from "../domain/courier-catalog";
import { steadfastAdapter } from "./steadfast-adapter";
import { pathaoAdapter } from "./pathao-adapter";
import { redxAdapter } from "./redx-adapter";
import { paperflyAdapter } from "./paperfly-adapter";
import { ecourierAdapter } from "./ecourier-adapter";
import { sundarbanAdapter } from "./sundarban-adapter";

/**
 * Provider lookup. Every entry in `COURIER_PROVIDERS` gets an adapter.
 * Real API adapters are registered in `API_ADAPTERS`.
 */
const API_ADAPTERS = new Map<string, CourierProvider>([
  ["steadfast", steadfastAdapter],
  ["pathao", pathaoAdapter],
  ["redx", redxAdapter],
  ["paperfly", paperflyAdapter],
  ["ecourier", ecourierAdapter],
  ["sundarban", sundarbanAdapter],
]);

const ADAPTERS: Map<string, CourierProvider> = new Map(
  COURIER_PROVIDERS.map((info) => [info.id, createManualCourierAdapter(info)]),
);

export class CourierProviderRegistry {
  static get(name: string): CourierProvider {
    const key = name.toLowerCase();
    const provider = API_ADAPTERS.get(key) ?? ADAPTERS.get(key);
    if (!provider) {
      throw new Error(`Courier provider not supported: ${name}`);
    }
    return provider;
  }

  static list(): string[] {
    return Array.from(ADAPTERS.keys());
  }

  static isSupported(name: string): boolean {
    return ADAPTERS.has(name.toLowerCase());
  }

  /** True only when a provider has a live API adapter — false for all today. */
  static isApiEnabled(name: string): boolean {
    const key = name.toLowerCase();
    return API_ADAPTERS.has(key) && (API_ADAPTERS.get(key)?.isConfigured() ?? false);
  }

  static describe(name: string) {
    return getCourierProvider(name);
  }
}

export default CourierProviderRegistry;
