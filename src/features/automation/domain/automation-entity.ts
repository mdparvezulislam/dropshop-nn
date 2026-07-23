export type TriggerType = "event" | "schedule" | "manual" | "webhook" | "api";

export type WorkflowStatus = "draft" | "active" | "paused" | "archived";

export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying"
  | "paused"
  | "timeout";

export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "startsWith" | "endsWith" | "exists" | "regex";

export type LogicalOperator = "and" | "or" | "not";

export type ActionType =
  | "send_notification"
  | "send_email"
  | "send_sms"
  | "create_shipment"
  | "update_order"
  | "update_inventory"
  | "create_wallet_transaction"
  | "generate_invoice"
  | "generate_report"
  | "trigger_analytics_event"
  | "execute_webhook"
  | "delay"
  | "wait"
  | "branch"
  | "stop_workflow";

export type TaskCategory =
  | "notification"
  | "logistics"
  | "finance"
  | "inventory"
  | "order"
  | "cms"
  | "analytics"
  | "communication"
  | "webhook"
  | "system";

export interface WorkflowRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  logicalOperator: LogicalOperator;
  actions: WorkflowAction[];
  priority: number;
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  source: "event" | "context" | "payload" | "system";
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  config: Record<string, unknown>;
  label: string;
  order: number;
  retryOnFailure?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface WorkflowTrigger {
  type: TriggerType;
  eventType?: string;
  cron?: string;
  webhookUrl?: string;
  apiEndpoint?: string;
  filters?: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "condition" | "action" | "delay" | "branch";
  ruleId?: string;
  actionId?: string;
  config: Record<string, unknown>;
  order: number;
  children?: WorkflowStep[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  key: string;
  description?: string;
  category: TaskCategory;
  status: WorkflowStatus;
  version: number;
  trigger: WorkflowTrigger;
  rules: WorkflowRule[];
  steps: WorkflowStep[];
  tags: string[];
  settings: WorkflowSettings;
  lastRunAt?: Date;
  lastRunStatus?: ExecutionStatus;
  totalRuns: number;
  totalFailures: number;
  averageDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowSettings {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  concurrency: number;
  preserveOrder: boolean;
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  notificationRecipients: string[];
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  definition: Record<string, unknown>;
  changelog?: string;
  publishedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowKey: string;
  workflowName: string;
  workflowVersion: number;
  trigger: TriggerType;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  context: Record<string, unknown>;
  currentStep?: string;
  steps: ExecutionStep[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: ExecutionError;
  retryCount: number;
  maxRetries: number;
  initiatedBy?: string;
  correlationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionStep {
  id: string;
  stepId: string;
  name: string;
  type: string;
  status: ExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: ExecutionError;
  retryCount: number;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: Date;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  workflowId: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  step?: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledJob {
  id: string;
  workflowId: string;
  name: string;
  cron: string;
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  timezone: string;
  maxRetries: number;
  retryDelay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDefinition {
  key: string;
  name: string;
  description: string;
  category: TaskCategory;
  actionType: ActionType;
  configSchema: Record<string, unknown>;
  handler: (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export interface AutomationDashboardData {
  runningWorkflows: number;
  scheduledJobs: number;
  queuedJobs: number;
  failedJobs: number;
  retryQueue: number;
  deadLetterQueue: number;
  avgExecutionTime: number;
  todayExecutions: number;
  successRate: number;
  failureRate: number;
  recentExecutions: WorkflowExecution[];
  workflowStatusCounts: Record<string, number>;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  path: string;
  secret?: string;
  enabled: boolean;
  workflowId?: string;
  lastCalledAt?: Date;
  lastStatus?: number;
  totalCalls: number;
  createdAt: Date;
  updatedAt: Date;
}

export const AUTOMATION_SOURCE_EVENTS = [
  "identity.user_registered",
  "identity.user_approved",
  "identity.user_blocked",
  "catalog.product.created",
  "catalog.product.updated",
  "inventory.stock_adjusted",
  "inventory.low_stock",
  "inventory.out_of_stock",
  "order.created",
  "order.confirmed",
  "order.cancelled",
  "order.paid",
  "courier.shipment_created",
  "courier.pickup_assigned",
  "courier.out_for_delivery",
  "courier.shipment_delivered",
  "courier.shipment_returned",
  "courier.cod_collected",
  "finance.wallet_credited",
  "finance.wallet_debited",
  "finance.refund_processed",
  "finance.payment_failed",
] as const;
