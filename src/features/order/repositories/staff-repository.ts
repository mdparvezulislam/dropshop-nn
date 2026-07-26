import { BaseRepository } from "@/lib/database/generic-repository";
import { StaffAssignmentModel } from "./staff-model";
import type { BaseDocument } from "@/lib/database/types";

export type StaffRole = "picker" | "packer" | "courier_manager" | "customer_support" | "manager";

export interface StaffAssignmentDocument extends BaseDocument {
  orderId: string;
  orderNumber: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  assignedBy: string;
  assignedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface StaffAssignmentEntity {
  id: string;
  orderId: string;
  orderNumber: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  assignedBy: string;
  assignedAt: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  isDeleted: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

function toDomain(doc: any): StaffAssignmentEntity {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    staffId: doc.staffId,
    staffName: doc.staffName,
    role: doc.role,
    assignedBy: doc.assignedBy,
    assignedAt: doc.assignedAt,
    completedAt: doc.completedAt,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class StaffRepository extends BaseRepository<
  StaffAssignmentDocument,
  StaffAssignmentEntity
> {
  constructor() {
    super(StaffAssignmentModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<StaffAssignmentEntity[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByStaff(staffId: string, role?: StaffRole): Promise<StaffAssignmentEntity[]> {
    const filter: Record<string, unknown> = { staffId };
    if (role) filter.role = role;
    return this.find(filter, { sort: { createdAt: -1 } } as any);
  }

  async countActiveByRole(role: StaffRole): Promise<number> {
    return this.count({ role, completedAt: null });
  }
}

export default StaffRepository;
