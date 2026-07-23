import { BaseDBEntity } from "@/lib/database/types";

export interface ProductVersion extends BaseDBEntity {
  productId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  changedFields: string[];
  editorId?: string;
  editorName?: string;
  reason?: string;
}
