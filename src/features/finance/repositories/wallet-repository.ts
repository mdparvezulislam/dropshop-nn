import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { WalletModel } from "./wallet-model";
import type { Wallet, WorkspaceRole } from "../domain/wallet-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface WalletDocument extends BaseDocument {
  workspaceId: string;
  workspaceRole: string;
  currency: string;
}

function mapToDomain(doc: any): Wallet {
  return {
    id: doc.id ?? doc._id.toString(),
    workspaceId: doc.workspaceId,
    workspaceRole: doc.workspaceRole as WorkspaceRole,
    currency: doc.currency,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    status: doc.status,
    metadata: doc.metadata,
  };
}

export class WalletRepository extends BaseRepository<WalletDocument, Wallet> {
  constructor() {
    super(WalletModel as any, mapToDomain);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Wallet | null> {
    return this.findOne({ workspaceId });
  }
}

export default WalletRepository;
