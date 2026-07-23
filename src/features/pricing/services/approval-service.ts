import { PriceApprovalRepository, PriceHistoryRepository } from "../repositories/approval-repository";
import { PriceApproval, PriceChange } from "../domain/price-approval-entity";
import { PriceHistoryEntry } from "../domain/price-history-entity";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

export class PriceApprovalService {
  private readonly approvalRepo = new PriceApprovalRepository();
  private readonly historyRepo = new PriceHistoryRepository();

  async listPendingApprovals(): Promise<PriceApproval[]> {
    return this.approvalRepo.findPendingApprovals();
  }

  async listAllApprovals(): Promise<PriceApproval[]> {
    return this.approvalRepo.find({});
  }

  async requestApproval(data: {
    entityType: PriceApproval["entityType"];
    entityId: string;
    requestedBy: string;
    requestedByName?: string;
    changes: PriceChange[];
    reason: string;
  }): Promise<PriceApproval> {
    logger.info("ApprovalService: requesting approval", { entityType: data.entityType, entityId: data.entityId });
    return this.approvalRepo.create({
      ...data,
      status: "pending",
      createdBy: data.requestedBy,
      updatedBy: data.requestedBy,
    } as any);
  }

  async approveApproval(id: string, reviewedBy: string, reviewedByName?: string, note?: string): Promise<PriceApproval> {
    const approval = await this.approvalRepo.findById(id);
    if (!approval) throw new NotFoundError("Approval request not found");
    if (approval.status !== "pending") throw new ValidationError(`Approval already ${approval.status}`);

    logger.info("ApprovalService: approving", { id });
    return this.approvalRepo.update(id, {
      status: "approved",
      reviewedBy,
      reviewedByName,
      reviewNote: note,
      approvedAt: new Date(),
      updatedBy: reviewedBy,
    } as any);
  }

  async rejectApproval(id: string, reviewedBy: string, reviewedByName?: string, note?: string): Promise<PriceApproval> {
    const approval = await this.approvalRepo.findById(id);
    if (!approval) throw new NotFoundError("Approval request not found");
    if (approval.status !== "pending") throw new ValidationError(`Approval already ${approval.status}`);

    logger.info("ApprovalService: rejecting", { id });
    return this.approvalRepo.update(id, {
      status: "rejected",
      reviewedBy,
      reviewedByName,
      reviewNote: note,
      rejectedAt: new Date(),
      updatedBy: reviewedBy,
    } as any);
  }

  async recordHistory(entry: Omit<PriceHistoryEntry, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status" | "metadata" | "deletedAt" | "createdBy" | "updatedBy">): Promise<PriceHistoryEntry> {
    return this.historyRepo.create(entry as any);
  }

  async getProductHistory(productId: string, variantSku?: string): Promise<PriceHistoryEntry[]> {
    return this.historyRepo.findByProduct(productId, variantSku);
  }

  async getAllHistory(): Promise<PriceHistoryEntry[]> {
    return this.historyRepo.find({});
  }
}
