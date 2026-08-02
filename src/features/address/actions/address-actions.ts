"use server";

import { AddressService } from "../services/address-service";
import type { SteadfastDistrictEntity, SteadfastUpazilaEntity } from "../domain/address-entity";

export async function getDistrictsAction(): Promise<{
  success: boolean;
  data: SteadfastDistrictEntity[];
  error?: string;
}> {
  try {
    const service = new AddressService();
    const result = await service.getDistricts();
    return { success: result.success, data: result.data };
  } catch (err) {
    return { success: false, data: [], error: err instanceof Error ? err.message : "Failed to load districts" };
  }
}

export async function getUpazilasAction(districtIdOrName: string): Promise<{
  success: boolean;
  data: SteadfastUpazilaEntity[];
  error?: string;
}> {
  try {
    const service = new AddressService();
    const result = await service.getUpazilas(districtIdOrName);
    return { success: result.success, data: result.data };
  } catch (err) {
    return { success: false, data: [], error: err instanceof Error ? err.message : "Failed to load upazilas" };
  }
}
