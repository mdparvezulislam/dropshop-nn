export interface CartCreatedPayload {
  cartId: string;
  type: string;
  sessionId?: string;
  userId?: string;
}

export interface CartUpdatedPayload {
  cartId: string;
  type: string;
  itemCount: number;
  subtotal: number;
  changes: string[];
}

export interface CheckoutStartedPayload {
  checkoutId: string;
  cartId: string;
  type: string;
}

export interface CheckoutValidatedPayload {
  checkoutId: string;
  cartId: string;
  priceValid: boolean;
  inventoryValid: boolean;
}

export interface InventoryReservedPayload {
  checkoutId: string;
  cartId: string;
  reservations: { productId: string; quantity: number }[];
}

export interface OrderDraftCreatedPayload {
  draftId: string;
  checkoutId: string;
  cartId: string;
  type: string;
  grandTotal: number;
  itemCount: number;
}

export interface CheckoutExpiredPayload {
  checkoutId: string;
  cartId: string;
  reason?: string;
}

export type CheckoutEventPayload =
  | CartCreatedPayload
  | CartUpdatedPayload
  | CheckoutStartedPayload
  | CheckoutValidatedPayload
  | InventoryReservedPayload
  | OrderDraftCreatedPayload
  | CheckoutExpiredPayload;

export type CheckoutEventType =
  | "checkout.cart_created"
  | "checkout.cart_updated"
  | "checkout.started"
  | "checkout.validated"
  | "checkout.inventory_reserved"
  | "checkout.order_draft_created"
  | "checkout.expired";
