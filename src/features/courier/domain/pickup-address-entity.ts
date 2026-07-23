import { BaseDBEntity } from "@/lib/database/types";

export interface PickupAddress extends BaseDBEntity {
  name: string; // e.g. "Main Dhaka Warehouse"
  isDefault: boolean;
  warehouseId?: string;
  contactPerson: string;
  phone: string;
  alternativePhone?: string;
  district: string;
  area: string;
  address: string;
  instructions?: string;
}
