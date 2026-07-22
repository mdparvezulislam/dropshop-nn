import { BaseDBEntity } from "@/shared/lib/database/types";

export interface ActivityLogEntry extends BaseDBEntity {
  entityType: "order" | "return" | "warranty" | "exchange" | "invoice";
  entityId: string;
  action: string;
  summary: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export default ActivityLogEntry;
