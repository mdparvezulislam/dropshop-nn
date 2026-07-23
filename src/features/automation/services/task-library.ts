import type { TaskDefinition, TaskCategory, ActionType } from "../domain/automation-entity";

type TaskHandler = (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<Record<string, unknown>>;

const tasks = new Map<string, TaskDefinition>();

export function registerTask(
  key: string,
  name: string,
  description: string,
  category: TaskCategory,
  actionType: ActionType,
  configSchema: Record<string, unknown>,
  handler: TaskHandler
): void {
  tasks.set(key, {
    key,
    name,
    description,
    category,
    actionType,
    configSchema,
    handler,
  });
}

export function getTask(key: string): TaskDefinition | undefined {
  return tasks.get(key);
}

export function getTasksByCategory(category: TaskCategory): TaskDefinition[] {
  return Array.from(tasks.values()).filter((t) => t.category === category);
}

export function getAllTasks(): TaskDefinition[] {
  return Array.from(tasks.values());
}

const defaultHandlers: Record<string, TaskHandler> = {
  send_notification: async (config) => {
    const { type, title, message, recipients } = config as Record<string, string>;
    return { sent: true, type, title, message, recipients, timestamp: new Date().toISOString() };
  },
  send_email: async (config) => {
    const { to, subject, body } = config as Record<string, string>;
    return { sent: true, to, subject, timestamp: new Date().toISOString() };
  },
  send_sms: async (config) => {
    const { to, message } = config as Record<string, string>;
    return { sent: true, to, message, timestamp: new Date().toISOString() };
  },
  create_shipment: async (config, context) => {
    const orderCtx = (context.order ?? {}) as Record<string, unknown>;
    return {
      shipmentCreated: true,
      courier: config.courier,
      orderId: orderCtx.orderId,
      trackingId: `TRK-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  },
  update_order: async (config, context) => {
    const orderCtx = (context.order ?? {}) as Record<string, unknown>;
    return {
      orderUpdated: true,
      orderId: orderCtx.orderId,
      updates: config,
      timestamp: new Date().toISOString(),
    };
  },
  update_inventory: async (config, context) => {
    const { productId, quantity } = config as Record<string, unknown>;
    const productCtx = (context.product ?? {}) as Record<string, unknown>;
    return {
      inventoryUpdated: true,
      productId: productId ?? productCtx.productId,
      quantity,
      timestamp: new Date().toISOString(),
    };
  },
  create_wallet_transaction: async (config) => {
    const { userId, amount, type, description } = config as Record<string, string>;
    return {
      transactionCreated: true,
      userId,
      amount,
      type,
      description,
      transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  },
  generate_invoice: async (config, context) => {
    const orderCtx = (context.order ?? {}) as Record<string, unknown>;
    return {
      invoiceGenerated: true,
      orderId: orderCtx.orderId,
      invoiceNumber: `INV-${Date.now()}`,
      format: config.format ?? "pdf",
      timestamp: new Date().toISOString(),
    };
  },
  generate_report: async (config) => {
    return {
      reportGenerated: true,
      type: config.type,
      format: config.format ?? "csv",
      reportId: `RPT-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  },
  trigger_analytics_event: async (config) => {
    return {
      eventTriggered: true,
      eventType: config.eventType,
      data: config.data,
      timestamp: new Date().toISOString(),
    };
  },
  execute_webhook: async (config) => {
    const { url, method, headers, body } = config as Record<string, unknown>;
    return {
      webhookExecuted: true,
      url,
      method: method ?? "POST",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  },
  delay: async (config) => {
    const ms = (config as Record<string, number>).ms ?? 1000;
    await new Promise((resolve) => setTimeout(resolve, ms));
    return { delayed: true, ms, timestamp: new Date().toISOString() };
  },
  wait: async (config) => {
    const ms = (config as Record<string, number>).ms ?? 5000;
    await new Promise((resolve) => setTimeout(resolve, ms));
    return { waited: true, ms, timestamp: new Date().toISOString() };
  },
  stop_workflow: async () => {
    return { stopped: true, timestamp: new Date().toISOString() };
  },
};

export function initializeTaskLibrary(): void {
  const taskDefs: Array<[string, string, string, TaskCategory, ActionType]> = [
    ["send_notification", "Send Notification", "Send push/in-app notification", "notification", "send_notification"],
    ["send_email", "Send Email", "Send transactional email", "communication", "send_email"],
    ["send_sms", "Send SMS", "Send SMS message", "communication", "send_sms"],
    ["create_shipment", "Create Shipment", "Create courier shipment", "logistics", "create_shipment"],
    ["update_order_status", "Update Order Status", "Change order status", "order", "update_order"],
    ["adjust_inventory", "Adjust Inventory", "Update product stock level", "inventory", "update_inventory"],
    ["credit_wallet", "Credit Wallet", "Add funds to user wallet", "finance", "create_wallet_transaction"],
    ["debit_wallet", "Debit Wallet", "Deduct from user wallet", "finance", "create_wallet_transaction"],
    ["generate_invoice", "Generate Invoice", "Create order invoice", "finance", "generate_invoice"],
    ["generate_report", "Generate Report", "Create analytics report", "analytics", "generate_report"],
    ["trigger_analytics", "Trigger Analytics", "Emit analytics event", "analytics", "trigger_analytics_event"],
    ["execute_webhook", "Execute Webhook", "Call external webhook URL", "webhook", "execute_webhook"],
    ["delay", "Delay", "Wait for specified time", "system", "delay"],
    ["wait", "Wait", "Wait for condition", "system", "wait"],
    ["stop_workflow", "Stop Workflow", "Stop current workflow execution", "system", "stop_workflow"],
  ];

  for (const [key, name, description, category, actionType] of taskDefs) {
    const handler = defaultHandlers[key];
    if (handler) {
      registerTask(key, name, description, category, actionType, {}, handler);
    }
  }
}
