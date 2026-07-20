export { SupplierService } from "./services/supplier-service";
export { StatisticsService } from "./services/statistics-service";
export {
  SupplierRepository,
  SupplierProductMappingRepository,
} from "./repositories/supplier-repository";

export { SupplierModel, SupplierProductMappingModel } from "./repositories/supplier-model";

export {
  createSupplierSchema,
  updateSupplierSchema,
  settingsSchema,
  bankAccountSchema,
  contactSchema,
  addressSchema,
  supplierCategorySchema,
  supplierNoteSchema,
  supplierPerformanceSchema,
  createSupplierProductMappingSchema,
  updateSupplierProductMappingSchema,
  supplierListQuerySchema,
} from "./types/validation";

export type {
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateSupplierProductMappingInput,
  UpdateSupplierProductMappingInput,
  SupplierListQuery,
} from "./types/validation";

export {
  type SupplierEvent,
  type SupplierEventType,
  type SupplierEventPayload,
  type SupplierCreatedPayload,
  type SupplierUpdatedPayload,
  type SupplierStatusChangedPayload,
  type SupplierDeletedPayload,
  type SupplierPerformanceUpdatedPayload,
  type ProductMappedPayload,
  type ProductMappingUpdatedPayload,
  type ProductMappingRemovedPayload,
} from "./domain/supplier-events";

export { registerSupplierFeatureFlags } from "./init";

export {
  createSupplierAction,
  updateSupplierAction,
  getSupplierByIdAction,
  listSuppliersAction,
  searchSuppliersAction,
  updateSupplierStatusAction,
  updateSupplierSettingsAction,
  updateSupplierBankingAction,
  addSupplierNoteAction,
  addSupplierTagsAction,
  mapProductToSupplierAction,
  updateSupplierProductMappingAction,
  removeProductMappingAction,
  getSupplierProductMappingsAction,
  getSupplierStatsAction,
} from "./actions/supplier-actions";
