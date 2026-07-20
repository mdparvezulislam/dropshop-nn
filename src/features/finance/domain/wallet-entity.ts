import { BaseDBEntity } from "@/shared/lib/database/types";

export type WorkspaceRole = "reseller" | "wholesaler" | "admin" | "supplier";

export interface Wallet extends BaseDBEntity {
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  currency: string;
}
