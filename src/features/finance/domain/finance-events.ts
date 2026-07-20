export type FinanceEventType =
  | "finance.wallet_created"
  | "finance.ledger_entry_created"
  | "finance.profit_released"
  | "finance.withdrawal_requested"
  | "finance.withdrawal_approved"
  | "finance.withdrawal_rejected"
  | "finance.withdrawal_paid"
  | "finance.settlement_completed"
  | "finance.invoice_generated"
  | "finance.refund_processed";

export interface FinanceEventPayload {
  eventId: string;
  eventType: FinanceEventType;
  timestamp: string;
  correlationId?: string;
  data: Record<string, unknown>;
}
