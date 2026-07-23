import { z } from "zod";

export const conditionOperatorSchema = z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin", "contains", "startsWith", "endsWith", "exists", "regex"]);

export const logicalOperatorSchema = z.enum(["and", "or", "not"]);

export const actionTypeSchema = z.enum([
  "send_notification", "send_email", "send_sms",
  "create_shipment", "update_order", "update_inventory",
  "create_wallet_transaction", "generate_invoice", "generate_report",
  "trigger_analytics_event", "execute_webhook",
  "delay", "wait", "branch", "stop_workflow",
]);

export const triggerTypeSchema = z.enum(["event", "schedule", "manual", "webhook", "api"]);

export const workflowStatusSchema = z.enum(["draft", "active", "paused", "archived"]);

export const executionStatusSchema = z.enum([
  "pending", "running", "completed", "failed", "cancelled", "retrying", "paused", "timeout",
]);

export const ruleConditionSchema = z.object({
  field: z.string().min(1),
  operator: conditionOperatorSchema,
  value: z.unknown(),
  source: z.enum(["event", "context", "payload", "system"]),
});

export const workflowActionSchema = z.object({
  id: z.string(),
  type: actionTypeSchema,
  config: z.record(z.string(), z.unknown()),
  label: z.string(),
  order: z.number(),
  retryOnFailure: z.boolean().optional(),
  maxRetries: z.number().optional(),
  timeout: z.number().optional(),
});

export const workflowRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditions: z.array(ruleConditionSchema),
  logicalOperator: logicalOperatorSchema,
  actions: z.array(workflowActionSchema),
  priority: z.number(),
});

export const workflowTriggerSchema = z.object({
  type: triggerTypeSchema,
  eventType: z.string().optional(),
  cron: z.string().optional(),
  webhookUrl: z.string().optional(),
  apiEndpoint: z.string().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export const workflowSettingsSchema = z.object({
  maxRetries: z.number().min(0).default(3),
  retryDelay: z.number().min(0).default(5000),
  timeout: z.number().min(0).default(300000),
  concurrency: z.number().min(1).default(5),
  preserveOrder: z.boolean().default(true),
  notifyOnFailure: z.boolean().default(true),
  notifyOnSuccess: z.boolean().default(false),
  notificationRecipients: z.array(z.string()).default([]),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  key: z.string().min(1).max(100).regex(/^[a-z0-9_\-\.]+$/),
  description: z.string().max(500).optional(),
  category: z.enum(["notification", "logistics", "finance", "inventory", "order", "cms", "analytics", "communication", "webhook", "system"]),
  trigger: workflowTriggerSchema,
  rules: z.array(workflowRuleSchema).default([]),
  steps: z.array(z.any()).default([]),
  tags: z.array(z.string()).default([]),
  settings: workflowSettingsSchema.optional(),
});

export const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  status: workflowStatusSchema.optional(),
});

export const executeWorkflowSchema = z.object({
  workflowId: z.string().min(1),
  input: z.record(z.string(), z.unknown()).default({}),
  trigger: triggerTypeSchema.default("manual"),
});

export const scheduleJobSchema = z.object({
  workflowId: z.string().min(1),
  name: z.string().min(1).max(200),
  cron: z.string().min(1),
  enabled: z.boolean().default(true),
  timezone: z.string().default("UTC"),
  maxRetries: z.number().min(0).default(3),
  retryDelay: z.number().min(0).default(5000),
});

export const webhookEndpointSchema = z.object({
  name: z.string().min(1).max(200),
  path: z.string().min(1).max(200),
  secret: z.string().optional(),
  enabled: z.boolean().default(true),
  workflowId: z.string().optional(),
});

export const automationSearchSchema = z.object({
  query: z.string().min(2).max(200),
  limit: z.number().min(1).max(50).optional().default(20),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type ExecuteWorkflowInput = z.infer<typeof executeWorkflowSchema>;
