import type { CourierProvider } from "./provider-adapter";
import { createManualCourierAdapter } from "./manual-adapter";
import { COURIER_PROVIDERS, getCourierProvider } from "../domain/courier-catalog";

/**
 * Provider lookup. Every entry in `COURIER_PROVIDERS` gets an adapter, so a new
 * courier is one catalog row away. When a provider gains a real API, register
 * its adapter in `API_ADAPTERS` below and nothing else in the codebase changes.
 */
const API_ADAPTERS = new Map<string, CourierProvider>();

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
