import type { TaskDefinition, TaskCategory, ActionType } from "../domain/automation-entity";

type TaskHandler = (
  config: Record<string, unknown>,
  context: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

const tasks = new Map<string, TaskDefinition>();

export function registerTask(
  key: string,
  name: string,
  description: string,
  category: TaskCategory,
  actionType: ActionType,
  configSchema: Record<string, unknown>,
  handler: TaskHandler,
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
  send_notification: async (config, context) => {
    const { type, title, message, recipientId } = config as Record<string, string>;
    const targetUserId = recipientId || String((context.user as any)?.id || "system");
    return {
      sent: true,
      recipientId: targetUserId,
      type: type || "in_app",
      title: title || "Automated Notification",
      message: message || "",
      timestamp: new Date().toISOString(),
    };
  },
  send_email: async (config, context) => {
    const { to, subject, body } = config as Record<string, string>;
    const targetEmail = to || String((context.user as any)?.email || "");
    return {
      sent: true,
      to: targetEmail,
      subject: subject || "System Notification",
      bodyLength: body?.length ?? 0,
      timestamp: new Date().toISOString(),
    };
  },
  send_sms: async (config, context) => {
    const { to, message } = config as Record<string, string>;
    const targetPhone = to || String((context.user as any)?.phone || "");
    return {
      sent: true,
      to: targetPhone,
      message,
      timestamp: new Date().toISOString(),
    };
  },
  create_shipment: async (config, context) => {
    const orderCtx = (context.order ?? {}) as Record<string, unknown>;
    const courier = String(config.courier || "steadfast");
    const orderId = String(orderCtx.id || orderCtx.orderId || "");
    return {
      shipmentCreated: true,
      courier,
      orderId,
      trackingId: `TRK-${Date.now()}`,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
  },
  update_order: async (config, context) => {
    const orderCtx = (context.order ?? {}) as Record<string, unknown>;
    return {
      orderUpdated: true,
      orderId: String(orderCtx.id || orderCtx.orderId || ""),
      status: config.status,
      timestamp: new Date().toISOString(),
    };
  },
  update_inventory: async (config, context) => {
    const { productId, quantity } = config as Record<string, unknown>;
    const productCtx = (context.product ?? {}) as Record<string, unknown>;
    return {
      inventoryUpdated: true,
      productId: productId ?? productCtx.productId,
      quantity: Number(quantity ?? 0),
      timestamp: new Date().toISOString(),
    };
  },
  create_wallet_transaction: async (config) => {
    const { userId, amount, type, description } = config as Record<string, string>;
    return {
      transactionCreated: true,
      userId,
      amount: Number(amount ?? 0),
      type: type || "credit",
      description,
      transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  },
  generate_invoice: async (config, context) => {
    const orderCtx = (context.order ?? {}) as Record<string, unknown>;
    return {
      invoiceGenerated: true,
      orderId: String(orderCtx.id || orderCtx.orderId || ""),
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
    const targetUrl = String(config.url || "");
    if (!targetUrl) throw new Error("Webhook URL is required");

    const method = String(config.method || "POST").toUpperCase();
    const headers = (config.headers as Record<string, string>) || { "Content-Type": "application/json" };
    const body = config.body ? JSON.stringify(config.body) : undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(targetUrl, {
        method,
        headers,
        body: method !== "GET" ? body : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        webhookExecuted: true,
        url: targetUrl,
        method,
        statusCode: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw new Error(`Webhook execution failed for ${targetUrl}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
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
    [
      "send_notification",
      "Send Notification",
      "Send push/in-app notification",
      "notification",
      "send_notification",
    ],
    ["send_email", "Send Email", "Send transactional email", "communication", "send_email"],
    ["send_sms", "Send SMS", "Send SMS message", "communication", "send_sms"],
    [
      "create_shipment",
      "Create Shipment",
      "Create courier shipment",
      "logistics",
      "create_shipment",
    ],
    ["update_order_status", "Update Order Status", "Change order status", "order", "update_order"],
    [
      "adjust_inventory",
      "Adjust Inventory",
      "Update product stock level",
      "inventory",
      "update_inventory",
    ],
    [
      "credit_wallet",
      "Credit Wallet",
      "Add funds to user wallet",
      "finance",
      "create_wallet_transaction",
    ],
    [
      "debit_wallet",
      "Debit Wallet",
      "Deduct from user wallet",
      "finance",
      "create_wallet_transaction",
    ],
    ["generate_invoice", "Generate Invoice", "Create order invoice", "finance", "generate_invoice"],
    [
      "generate_report",
      "Generate Report",
      "Create analytics report",
      "analytics",
      "generate_report",
    ],
    [
      "trigger_analytics",
      "Trigger Analytics",
      "Emit analytics event",
      "analytics",
      "trigger_analytics_event",
    ],
    [
      "execute_webhook",
      "Execute Webhook",
      "Call external webhook URL",
      "webhook",
      "execute_webhook",
    ],
    ["delay", "Delay", "Wait for specified time", "system", "delay"],
    ["wait", "Wait", "Wait for condition", "system", "wait"],
    [
      "stop_workflow",
      "Stop Workflow",
      "Stop current workflow execution",
      "system",
      "stop_workflow",
    ],
  ];

  for (const [key, name, description, category, actionType] of taskDefs) {
    const handler = defaultHandlers[key];
    if (handler) {
      registerTask(key, name, description, category, actionType, {}, handler);
    }
  }
}
