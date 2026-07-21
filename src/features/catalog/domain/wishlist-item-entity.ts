import type { BaseDBEntity } from "@/shared/lib/database/types";

export interface WishlistItem extends BaseDBEntity {
  userId: string;
  productId: string;
}
