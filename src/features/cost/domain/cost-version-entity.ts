import { BaseDBEntity } from "@/shared/lib/database/types";

export type CostChangeReason =
  | "supplier_price_increased"
  | "supplier_price_decreased"
  | "new_shipment"
  | "import_cost_updated"
  | "manual_correction"
  | "currency_adjustment"
  | "promotion"
  | "replacement_supplier"
  | "other";

export type CostApprovalStatus = "pending" | "approved" | "rejected";

export interface CostSupplierInfo {
  supplierId?: string;
  supplierName?: string;
  supplierSku?: string;
  invoiceNumber?: string;
  purchaseDate?: Date;
  purchaseLink?: string;
  notes?: string;
}

export interface CostVersion extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  versionNumber: number;
  costPrice: number;
  currency: string;
  supplier: CostSupplierInfo;
  importCost: number;
  shippingCost: number;
  packagingCost: number;
  handlingCost: number;
  otherExpenses: number;
  landedCost: number;
  reason: CostChangeReason;
  reasonText?: string;
  notes?: string;
  effectiveDate: Date;
  isCurrentVersion: boolean;
  previousCostPrice?: number;
  previousLandedCost?: number;
  changedBy?: string;
  changedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvalStatus: CostApprovalStatus;
  approvedAt?: Date;
}
