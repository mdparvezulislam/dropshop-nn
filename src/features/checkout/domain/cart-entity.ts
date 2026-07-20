import { BaseDBEntity } from "@/shared/lib/database/types";

export type CartType = "guest" | "customer" | "reseller" | "wholesaler";

export type CartStatus = "active" | "abandoned" | "converted" | "expired";

export interface CartItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  resolvedPrice: number;
  currency: string;
  appliedRule?: string;
  campaignId?: string;
  profitPreview?: {
    costBasis: number;
    profitAmount: number;
    profitMargin: number;
  };
}

export interface Cart extends BaseDBEntity {
  type: CartType;
  status: CartStatus;
  sessionId?: string;
  userId?: string;
  resellerId?: string;
  wholesaleId?: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
  notes?: string;
  expiresAt?: Date;
  lastActivityAt: Date;
}

export default Cart;
