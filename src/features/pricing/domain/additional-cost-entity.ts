import { BaseDBEntity } from "@/lib/database/types";

export type CostType = "import" | "shipping" | "packaging" | "handling" | "vat" | "tax" | "customs" | "other";

export interface AdditionalCost extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  costType: CostType;
  label: string;
  amount: number;
  isPercentage: boolean;
  percentageOfField?: "baseCostPrice" | "purchasePrice" | "supplierPrice" | "sellingPrice";
  isActive: boolean;
}
