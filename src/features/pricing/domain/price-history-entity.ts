import { BaseDBEntity } from "@/lib/database/types";

export interface PriceHistoryEntry extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  field: string;
  oldValue: number;
  newValue: number;
  changedBy: string;
  changedByName?: string;
  reason?: string;
  source: "manual" | "rule" | "bulk" | "import" | "automation" | "approval" | "campaign";
  affectedProducts?: number;
}
