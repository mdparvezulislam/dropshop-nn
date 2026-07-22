import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { WalletModel } from "./wallet-model";
import type { Wallet, WorkspaceRole, WalletStatus } from "../domain/wallet-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface WalletDocument extends BaseDocument {
  workspaceId: string;
  workspaceRole: string;
  currency: string;
  status: WalletStatus;
}

function mapToDomain(doc: any): Wallet {
  return {
    id: doc.id ?? doc._id?.toString(),
    workspaceId: doc.workspaceId,
    workspaceRole: doc.workspaceRole as WorkspaceRole,
    currency: doc.currency ?? "BDT",
    status: (doc.status as WalletStatus) ?? "active",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
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

  async findByRole(role: WorkspaceRole): Promise<Wallet[]> {
    return this.find({ workspaceRole: role });
  }

  async listAllWallets(): Promise<Wallet[]> {
    const results = await this.find({});
    return results;
  }
}

export default WalletRepository;
