import type { CourierProvider } from "./provider-adapter";
import { SteadfastAdapter } from "./steadfast-adapter";
import { PathaoAdapter } from "./pathao-adapter";
import { RedxAdapter } from "./redx-adapter";
import { EcourierAdapter } from "./ecourier-adapter";
import { PaperflyAdapter } from "./paperfly-adapter";

export class CourierProviderRegistry {
  private static readonly providers: Map<string, CourierProvider> = new Map<string, CourierProvider>([
    ["steadfast", new SteadfastAdapter()],
    ["pathao", new PathaoAdapter()],
    ["redx", new RedxAdapter()],
    ["ecourier", new EcourierAdapter()],
    ["paperfly", new PaperflyAdapter()],
  ]);

  static get(name: string): CourierProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`Courier provider adapter not supported: ${name}`);
    }
    return provider;
  }

  static list(): string[] {
    return Array.from(this.providers.keys());
  }
}
export default CourierProviderRegistry;
