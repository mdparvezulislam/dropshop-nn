export { registerCustomerFeatureFlags } from "./init";

export { CustomerService } from "./services/customer-service";
export { CustomerRepository } from "./repositories/customer-repository";

export {
  createCustomerAction,
  updateCustomerAction,
  addAddressAction,
  addNoteAction,
  updateTagsAction,
  listCustomersAction,
} from "./actions/customer-actions";
