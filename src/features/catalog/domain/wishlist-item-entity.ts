import type { BaseDBEntity } from "@/lib/database/types";

export interface WishlistItem extends BaseDBEntity {
  userId: string;
  productId: string;
}
