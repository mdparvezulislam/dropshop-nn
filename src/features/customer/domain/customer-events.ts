export const CUSTOMER_EVENTS = {
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
  CUSTOMER_TAGGED: "customer.tagged",
  CUSTOMER_ADDRESS_UPDATED: "customer.address_updated",
  CUSTOMER_MERGED: "customer.merged",
} as const;

export type CustomerEventType = (typeof CUSTOMER_EVENTS)[keyof typeof CUSTOMER_EVENTS];

export interface CustomerCreatedPayload {
  customerId: string;
  workspaceId: string;
  name: string;
  phone: string;
  source: string;
}

export interface CustomerUpdatedPayload {
  customerId: string;
  workspaceId: string;
  name: string;
  phone: string;
  fieldsChanged: string[];
}

export interface CustomerTaggedPayload {
  customerId: string;
  tags: string[];
  addedTags: string[];
  removedTags: string[];
}

export interface CustomerAddressUpdatedPayload {
  customerId: string;
  addressId: string;
  type: string;
}

export interface CustomerMergedPayload {
  sourceCustomerId: string;
  targetCustomerId: string;
  workspaceId: string;
}
