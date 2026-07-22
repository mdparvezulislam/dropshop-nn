import { BaseDBEntity } from "@/shared/lib/database/types";

export type StaffRole = "picker" | "packer" | "courier_manager" | "customer_support" | "manager";

export interface StaffAssignment extends BaseDBEntity {
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

export const STAFF_ROLES: StaffRole[] = [
  "picker",
  "packer",
  "courier_manager",
  "customer_support",
  "manager",
];
