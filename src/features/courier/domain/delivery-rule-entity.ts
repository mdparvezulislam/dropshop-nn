import { BaseDBEntity } from "@/lib/database/types";

export interface DeliveryZone extends BaseDBEntity {
  name: string;
  country: string;
  division: string;
  district: string;
  area: string;
  zoneCode: string;
  shippingCategory: "inside_city" | "outside_city" | "sub_city" | "remote_area";
}

export interface ShippingRule extends BaseDBEntity {
  ruleName: string;
  preferredCourier: string;
  zoneCode?: string;
  maxCodLimitCents?: number;
  maxWeightGrams?: number;
  packageType?: string;
  isPriority: boolean;
  active: boolean;
}

export interface DeliveryCostRule extends BaseDBEntity {
  ruleName: string;
  ruleType: "weight_based" | "zone_based" | "courier_based" | "cod_based" | "flat_rate";
  baseCostCents: number;
  extraWeightUnitGrams?: number;
  extraWeightCostCents?: number;
  courierProvider?: string;
  zoneCode?: string;
  active: boolean;
}
