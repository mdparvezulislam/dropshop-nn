import { BaseDBEntity } from "@/shared/lib/database/types";

export interface ProductAudit extends BaseDBEntity {
  productId: string;
  action: string;
  editorId?: string;
  editorName?: string;
  changedFields: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  summary?: string;
}
