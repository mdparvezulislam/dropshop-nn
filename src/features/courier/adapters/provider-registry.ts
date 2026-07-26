import type { CourierProvider } from "./provider-adapter";
import { SteadfastAdapter } from "./steadfast-adapter";
import { PathaoAdapter } from "./pathao-adapter";
import { RedxAdapter } from "./redx-adapter";
import { ECourierAdapter } from "./ecourier-adapter";
import { PaperflyAdapter } from "./paperfly-adapter";
import { SundarbanAdapter } from "./sundarban-adapter";
import { CustomCourierAdapter } from "./custom-courier-adapter";

export class CourierProviderRegistry {
  private static readonly providers: Map<string, CourierProvider> = new Map<
    string,
    CourierProvider
  >([
    ["steadfast", new SteadfastAdapter()],
    ["pathao", new PathaoAdapter()],
    ["redx", new RedxAdapter()],
    ["ecourier", new ECourierAdapter()],
    ["paperfly", new PaperflyAdapter()],
    ["sundarban", new SundarbanAdapter()],
    ["custom", new CustomCourierAdapter()],
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

  static isSupported(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }
}
export default CourierProviderRegistry;
