export interface SupplierCreatedPayload {
  supplierId: string;
  code: string;
  businessName: string;
  email: string;
  category: string;
  createdBy?: string;
}

export interface SupplierUpdatedPayload {
  supplierId: string;
  code: string;
  changes: string[];
  updatedBy?: string;
}

export interface SupplierStatusChangedPayload {
  supplierId: string;
  previousStatus: string;
  newStatus: string;
  changedBy?: string;
}

export interface SupplierDeletedPayload {
  supplierId: string;
  code: string;
}

export interface SupplierPerformanceUpdatedPayload {
  supplierId: string;
  previousScore: number;
  newScore: number;
  period?: string;
}

export interface ProductMappedPayload {
  supplierId: string;
  productId: string;
  supplierSku: string;
  costPrice: number;
  mappedBy?: string;
}

export interface ProductMappingUpdatedPayload {
  mappingId: string;
  supplierId: string;
  productId: string;
  changes: string[];
  updatedBy?: string;
}

export interface ProductMappingRemovedPayload {
  mappingId: string;
  supplierId: string;
  productId: string;
}

export type SupplierEventPayload =
  | SupplierCreatedPayload
  | SupplierUpdatedPayload
  | SupplierStatusChangedPayload
  | SupplierDeletedPayload
  | SupplierPerformanceUpdatedPayload
  | ProductMappedPayload
  | ProductMappingUpdatedPayload
  | ProductMappingRemovedPayload;

export interface SupplierEvent {
  type: SupplierEventType;
  payload: SupplierEventPayload;
  timestamp: Date;
  correlationId?: string;
}

export type SupplierEventType =
  | "supplier.created"
  | "supplier.updated"
  | "supplier.status_changed"
  | "supplier.deleted"
  | "supplier.performance_updated"
  | "supplier.product_mapped"
  | "supplier.product_mapping_updated"
  | "supplier.product_mapping_removed";
