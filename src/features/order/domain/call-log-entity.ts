import { BaseDBEntity } from "@/lib/database/types";

export const CALL_OUTCOMES = [
  "reached", "not_reached", "busy", "switched_off",
  "wrong_number", "call_back_later", "completed",
] as const;

export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export interface CallLogEntry extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  duration: number;
  outcome: CallOutcome;
  notes?: string;
  nextFollowUpAt?: Date;
  callTime: Date;
}
