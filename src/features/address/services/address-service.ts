import type { LocationProvider, SteadfastDistrictEntity, SteadfastUpazilaEntity, LocationQueryResult } from "../domain/address-entity";
import { BangladeshAdministrativeProvider } from "../providers/bangladesh-administrative-provider";
import { calculateSteadfastDeliveryCharge } from "@/shared/config/steadfast-locations";
import { logger } from "@/lib/utils/logger";

class AddressServiceCache {
  private static districtsCache: SteadfastDistrictEntity[] | null = null;
  private static upazilasCache: Map<string, SteadfastUpazilaEntity[]> = new Map();
  private static cacheExpiryMs = 1000 * 60 * 60; // 1 Hour Cache
  private static lastFetched: number = 0;

  static getDistricts(): SteadfastDistrictEntity[] | null {
    if (this.districtsCache && Date.now() - this.lastFetched < this.cacheExpiryMs) {
      return this.districtsCache;
    }
    return null;
  }

  static setDistricts(districts: SteadfastDistrictEntity[]): void {
    this.districtsCache = districts;
    this.lastFetched = Date.now();
  }

  static getUpazilas(districtId: string): SteadfastUpazilaEntity[] | null {
    return this.upazilasCache.get(districtId.toLowerCase().trim()) || null;
  }

  static setUpazilas(districtId: string, upazilas: SteadfastUpazilaEntity[]): void {
    this.upazilasCache.set(districtId.toLowerCase().trim(), upazilas);
  }
}

export class AddressService {
  private provider: LocationProvider;

  constructor(provider?: LocationProvider) {
    this.provider = provider || new BangladeshAdministrativeProvider();
  }

  async getDistricts(): Promise<LocationQueryResult<SteadfastDistrictEntity>> {
    const cached = AddressServiceCache.getDistricts();
    if (cached) {
      return { success: true, data: cached, source: "cache" };
    }

    try {
      const districts = await this.provider.getDistricts();
      AddressServiceCache.setDistricts(districts);
      return { success: true, data: districts, source: "provider" };
    } catch (err) {
      logger.error("AddressService: Failed to fetch districts", err as Error);
      return { success: false, data: [], source: "fallback", error: "Failed to load districts" };
    }
  }

  async getUpazilas(districtIdOrName: string): Promise<LocationQueryResult<SteadfastUpazilaEntity>> {
    if (!districtIdOrName || !districtIdOrName.trim()) {
      return { success: true, data: [], source: "fallback" };
    }

    const key = districtIdOrName.replace(/\(.*?\)/g, "").trim().toLowerCase();
    const cached = AddressServiceCache.getUpazilas(key);
    if (cached) {
      return { success: true, data: cached, source: "cache" };
    }

    try {
      const upazilas = await this.provider.getUpazilas(districtIdOrName);
      AddressServiceCache.setUpazilas(key, upazilas);
      return { success: true, data: upazilas, source: "provider" };
    } catch (err) {
      logger.error("AddressService: Failed to fetch upazilas", err as Error);
      return { success: false, data: [], source: "fallback", error: "Failed to load upazilas" };
    }
  }

  calculateDeliveryCharge(districtName: string): number {
    return calculateSteadfastDeliveryCharge(districtName);
  }
}
