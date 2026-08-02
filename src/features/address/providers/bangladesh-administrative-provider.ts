import type { LocationProvider, SteadfastDistrictEntity, SteadfastUpazilaEntity } from "../domain/address-entity";
import { STEADFAST_LOCATIONS, getDistrictByName } from "@/shared/config/steadfast-locations";

export class BangladeshAdministrativeProvider implements LocationProvider {
  async getDistricts(): Promise<SteadfastDistrictEntity[]> {
    return STEADFAST_LOCATIONS.map((d) => ({
      districtId: d.id,
      districtNameEn: d.name,
      districtNameBn: d.bnName,
      isDhaka: d.isDhaka,
    }));
  }

  async getUpazilas(districtIdOrName: string): Promise<SteadfastUpazilaEntity[]> {
    if (!districtIdOrName || !districtIdOrName.trim()) {
      return [];
    }

    const dist = getDistrictByName(districtIdOrName);
    if (!dist) {
      return [];
    }

    return dist.upazilas.map((uName, idx) => ({
      upazilaId: `${dist.id}-u-${idx}`,
      districtId: dist.id,
      upazilaNameEn: uName,
    }));
  }
}
